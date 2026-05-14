import React, { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getFilteredTransactions } from '../services/api/transactionService';
import { Transaction } from '../types/domain';

type Props = {
  onOpenDetail: (transactionId: number) => void;
};

export default function HistoryScreen({ onOpenDetail }: Props) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const loadTransactions = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await getFilteredTransactions({
        status: statusFilter === 'all' ? undefined : statusFilter,
        payment_status: paymentFilter === 'all' ? undefined : paymentFilter,
        customer: search.trim().length > 0 ? search.trim() : undefined,
        date: dateFilter.trim().length > 0 ? dateFilter.trim() : undefined,
      });
      setTransactions(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadTransactions();
  }, [statusFilter, paymentFilter]);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadTransactions(true)} />}
    >
      <Text style={styles.title}>Transaction History</Text>

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search customer..."
        style={styles.input}
      />
      <TextInput
        value={dateFilter}
        onChangeText={setDateFilter}
        placeholder="Date filter (YYYY-MM-DD)"
        style={styles.input}
      />

      <View style={styles.filters}>
        <TouchableOpacity style={styles.filterChip} onPress={() => setStatusFilter(statusFilter === 'all' ? 'proses' : 'all')}>
          <Text style={styles.filterText}>Status: {statusFilter}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip} onPress={() => setPaymentFilter(paymentFilter === 'all' ? 'lunas' : 'all')}>
          <Text style={styles.filterText}>Payment: {paymentFilter}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip} onPress={() => loadTransactions()}>
          <Text style={styles.filterText}>Apply</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        transactions.map((txn) => (
          <TouchableOpacity key={txn.id} style={styles.card} onPress={() => onOpenDetail(txn.id)}>
            <Text style={styles.cardTitle}>{txn.customer?.name ?? 'Unknown Customer'}</Text>
            <Text>Amount: Rp {txn.amount.toLocaleString()}</Text>
            <Text>Status: {txn.status}</Text>
            <Text>Payment: {txn.payment_status}</Text>
          </TouchableOpacity>
        ))
      )}

      {!loading && transactions.length === 0 ? <Text style={styles.empty}>No transactions found.</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 12, color: '#111827' },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 12, marginBottom: 12 },
  filters: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  filterChip: { backgroundColor: '#ecfeff', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12 },
  filterText: { color: '#0f766e', fontWeight: '600' },
  card: { padding: 14, backgroundColor: '#f8fafc', borderRadius: 12, marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  empty: { color: '#64748b', marginTop: 20, textAlign: 'center' },
});
