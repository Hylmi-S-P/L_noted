import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getTransaction, updateTransactionPayment, updateTransactionStatus } from '../services/api/transactionService';
import { Transaction } from '../types/domain';

type Props = {
  transactionId: number;
};

export default function TransactionDetailScreen({ transactionId }: Props) {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getTransaction(transactionId);
      setTransaction(data);
    } catch {
      Alert.alert('Error', 'Failed to load transaction detail.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [transactionId]);

  const setStatus = async () => {
    if (!transaction) return;
    setSaving(true);
    try {
      const nextStatus = transaction.status === 'proses' ? 'selesai' : 'diambil';
      const updated = await updateTransactionStatus(transaction.id, nextStatus);
      setTransaction(updated);
    } catch {
      Alert.alert('Error', 'Failed to update status.');
    } finally {
      setSaving(false);
    }
  };

  const setPayment = async () => {
    if (!transaction) return;
    setSaving(true);
    try {
      const nextPayment = transaction.payment_status === 'belum_lunas' ? 'lunas' : 'belum_lunas';
      const updated = await updateTransactionPayment(transaction.id, nextPayment);
      setTransaction(updated);
    } catch {
      Alert.alert('Error', 'Failed to update payment.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 30 }} />;
  if (!transaction) return <Text style={{ padding: 16 }}>Transaction not found.</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transaction #{transaction.id}</Text>
      <Text style={styles.text}>Customer: {transaction.customer?.name ?? '-'}</Text>
      <Text style={styles.text}>Amount: Rp {transaction.amount.toLocaleString()}</Text>
      <Text style={styles.text}>Status: {transaction.status}</Text>
      <Text style={styles.text}>Payment: {transaction.payment_status}</Text>

      <TouchableOpacity style={styles.button} onPress={setStatus} disabled={saving}>
        <Text style={styles.buttonText}>{saving ? 'Saving...' : 'Update Status'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={setPayment} disabled={saving}>
        <Text style={styles.buttonText}>{saving ? 'Saving...' : 'Update Payment'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  text: { marginBottom: 6, fontSize: 15, color: '#334155' },
  button: {
    marginTop: 12,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#0f766e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '700' },
});
