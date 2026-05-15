import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import {
  Badge,
  BottomNav,
  Button,
  Card,
  EmptyState,
  Input,
  LoadingState,
  Screen,
  TopBar,
  paymentLabel,
  paymentTone,
} from '../components/UI/LNoteUI';
import { colors, money, shortDate, spacing, typography } from '../constants/theme';
import { batchPayTransactions, getFilteredTransactions } from '../services/api/transactionService';
import { Transaction } from '../types/domain';

type Props = {
  onOpenDetail: (transactionId: number) => void;
  goBack?: () => void;
  onOpenDashboard?: () => void;
  onOpenReports?: () => void;
  onOpenSettings?: () => void;
};

const paymentFilters: Array<{ label: string; value: string }> = [
  { label: 'Semua', value: 'all' },
  { label: 'Belum Lunas', value: 'belum_lunas' },
  { label: 'Lunas', value: 'lunas' },
];

export default function HistoryScreen({ onOpenDetail, goBack, onOpenDashboard, onOpenReports, onOpenSettings }: Props) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingBatch, setSavingBatch] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const selectedTransactions = useMemo(
    () => transactions.filter((transaction) => selectedIds.includes(transaction.id)),
    [selectedIds, transactions]
  );
  const selectedTotal = selectedTransactions.reduce(
    (sum, transaction) => sum + (transaction.total_price ?? transaction.amount ?? 0),
    0
  );
  const selectedCustomerName = selectedTransactions[0]?.customer?.name ?? 'Pelanggan';

  const loadTransactions = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await getFilteredTransactions({
        payment_status: paymentFilter === 'all' ? undefined : paymentFilter,
        customer: search.trim().length > 0 ? search.trim() : undefined,
        date: dateFilter.trim().length > 0 ? dateFilter.trim() : undefined,
      });
      setTransactions(data);
      setSelectedIds((current) => current.filter((id) => data.some((transaction) => transaction.id === id)));
    } catch {
      Alert.alert('Server belum terhubung', 'Tidak bisa terhubung ke server. Cek koneksi atau nyalakan backend.');
      setTransactions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setSelectedIds([]);
    void loadTransactions();
  }, [paymentFilter]);

  const toggleSelectionMode = () => {
    setSelectionMode((current) => !current);
    setSelectedIds([]);
  };

  const toggleTransaction = (transaction: Transaction) => {
    if (!selectionMode) {
      onOpenDetail(transaction.id);
      return;
    }

    if (transaction.payment_status === 'lunas') {
      Alert.alert('Sudah lunas', 'Transaksi yang sudah lunas tidak perlu digabungkan lagi.');
      return;
    }

    const firstCustomerId = selectedTransactions[0]?.customer_id;
    if (firstCustomerId && firstCustomerId !== transaction.customer_id) {
      Alert.alert('Pelanggan berbeda', 'Pilih transaksi dari pelanggan yang sama untuk digabungkan.');
      return;
    }

    setSelectedIds((current) =>
      current.includes(transaction.id) ? current.filter((id) => id !== transaction.id) : [...current, transaction.id]
    );
  };

  const paySelected = async () => {
    if (selectedIds.length === 0) {
      Alert.alert('Belum ada pilihan', 'Pilih minimal satu transaksi belum lunas.');
      return;
    }

    Alert.alert(
      'Lunasi tagihan gabungan?',
      `${selectedCustomerName}: ${selectedIds.length} transaksi, total ${money(selectedTotal)}.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Tandai Lunas',
          onPress: async () => {
            setSavingBatch(true);
            try {
              await batchPayTransactions(selectedIds);
              setSelectedIds([]);
              setSelectionMode(false);
              await loadTransactions();
              Alert.alert('Sukses', 'Tagihan gabungan ditandai lunas.');
            } catch {
              Alert.alert('Gagal menyimpan', 'Gagal menyimpan. Coba lagi.');
            } finally {
              setSavingBatch(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.root}>
      <Screen
        bottomInset={selectionMode ? 220 : 120}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadTransactions(true)} />}
      >
        <TopBar title="Riwayat" onBack={goBack} />
        <View style={styles.header}>
          <Text style={styles.title}>Riwayat Transaksi</Text>
          <Text style={styles.subtitle}>Pantau pembayaran dan gabungkan tagihan pelanggan yang belum lunas.</Text>
        </View>

        <View style={styles.searchStack}>
          <Input value={search} onChangeText={setSearch} placeholder="Cari nama pelanggan..." returnKeyType="search" />
          <Input
            value={dateFilter}
            onChangeText={setDateFilter}
            placeholder="Tanggal (YYYY-MM-DD)"
            returnKeyType="done"
          />
          <Pressable onPress={() => loadTransactions()} style={({ pressed }) => [styles.applyButton, pressed && styles.pressed]}>
            <Text style={styles.applyText}>Terapkan Filter</Text>
          </Pressable>
        </View>

        <View style={styles.chips}>
          {paymentFilters.map((filter) => (
            <Pressable
              key={filter.value}
              onPress={() => setPaymentFilter(filter.value)}
              style={[styles.chip, paymentFilter === filter.value && styles.chipActive]}
            >
              <Text style={[styles.chipText, paymentFilter === filter.value && styles.chipTextActive]}>{filter.label}</Text>
            </Pressable>
          ))}
        </View>

        <Card style={styles.combineCard}>
          <View style={styles.combineHeader}>
            <View style={styles.combineTextWrap}>
              <Text style={styles.combineTitle}>Gabungkan Tagihan</Text>
              <Text style={styles.combineSub}>Pilih beberapa transaksi belum lunas dari pelanggan yang sama.</Text>
            </View>
            <Pressable onPress={toggleSelectionMode} style={[styles.selectToggle, selectionMode && styles.selectToggleActive]}>
              <Text style={[styles.selectToggleText, selectionMode && styles.selectToggleTextActive]}>
                {selectionMode ? 'Batal' : 'Pilih'}
              </Text>
            </Pressable>
          </View>
        </Card>

        {loading ? <LoadingState /> : null}

        {!loading && transactions.length === 0 ? (
          <EmptyState title="Belum ada transaksi" subtitle="Coba ubah filter atau tambah transaksi baru." />
        ) : null}

        {!loading && transactions.length > 0 ? (
          <View style={styles.list}>
            {transactions.map((txn) => {
              const selected = selectedIds.includes(txn.id);
              const disabledForSelection = selectionMode && txn.payment_status === 'lunas';

              return (
                <Pressable
                  key={txn.id}
                  onPress={() => toggleTransaction(txn)}
                  style={({ pressed }) => [pressed && styles.pressed, disabledForSelection && styles.disabledCard]}
                >
                  <Card style={[selected && styles.selectedCard]}>
                    <View style={styles.cardHeader}>
                      {selectionMode ? (
                        <View style={[styles.checkCircle, selected && styles.checkCircleActive]}>
                          <Text style={[styles.checkText, selected && styles.checkTextActive]}>{selected ? '✓' : ''}</Text>
                        </View>
                      ) : null}
                      <View style={styles.cardTitleWrap}>
                        <Text style={styles.customerName}>{txn.customer?.name ?? 'Pelanggan'}</Text>
                        <Text style={styles.cardMeta}>
                          {shortDate(txn.created_at)}, {txn.weight_kg ?? txn.quantity} kg, {txn.service_price?.name ?? txn.service_type ?? 'Layanan'}
                        </Text>
                      </View>
                      <View style={styles.amountWrap}>
                        <Text style={styles.total}>{money(txn.total_price ?? txn.amount)}</Text>
                        <Badge label={paymentLabel(txn.payment_status)} tone={paymentTone(txn.payment_status)} />
                      </View>
                    </View>
                  </Card>
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </Screen>

      {selectionMode ? (
        <View style={styles.batchBar}>
          <View>
            <Text style={styles.batchLabel}>{selectedIds.length} transaksi dipilih</Text>
            <Text style={styles.batchTotal}>{money(selectedTotal)}</Text>
            <Text style={styles.batchCustomer}>{selectedIds.length > 0 ? selectedCustomerName : 'Pilih tagihan belum lunas'}</Text>
          </View>
          <Button onPress={paySelected} disabled={savingBatch || selectedIds.length === 0} style={styles.batchButton}>
            {savingBatch ? 'Menyimpan...' : 'Tandai Lunas'}
          </Button>
        </View>
      ) : null}

      <BottomNav
        active="history"
        onDashboard={onOpenDashboard ?? goBack ?? (() => undefined)}
        onHistory={() => undefined}
        onReports={onOpenReports}
        onSettings={onOpenSettings}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    gap: spacing.xs,
  },
  title: {
    ...typography.title,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
  },
  searchStack: {
    gap: spacing.md,
  },
  applyButton: {
    minHeight: 48,
    borderRadius: 8,
    backgroundColor: colors.surfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    minHeight: 40,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceLowest,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  chipText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
  chipTextActive: {
    color: colors.onPrimary,
  },
  combineCard: {
    backgroundColor: colors.primaryContainer,
  },
  combineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  combineTextWrap: {
    flex: 1,
  },
  combineTitle: {
    color: colors.onPrimaryContainer,
    fontSize: 18,
    fontWeight: '700',
  },
  combineSub: {
    color: colors.onPrimaryContainer,
    fontSize: 13,
    marginTop: spacing.xs,
  },
  selectToggle: {
    minHeight: 40,
    borderRadius: 999,
    backgroundColor: colors.surfaceLowest,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  selectToggleActive: {
    backgroundColor: colors.primary,
  },
  selectToggleText: {
    color: colors.primary,
    fontWeight: '700',
  },
  selectToggleTextActive: {
    color: colors.onPrimary,
  },
  list: {
    gap: spacing.md,
  },
  selectedCard: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryContainer,
  },
  disabledCard: {
    opacity: 0.5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkCircleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkText: {
    color: colors.outline,
    fontSize: 14,
    fontWeight: '700',
  },
  checkTextActive: {
    color: colors.onPrimary,
  },
  cardTitleWrap: {
    flex: 1,
  },
  customerName: {
    color: colors.text,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
  },
  cardMeta: {
    color: colors.outline,
    fontSize: 14,
    marginTop: spacing.xs,
  },
  amountWrap: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  total: {
    color: colors.primary,
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '700',
    textAlign: 'right',
  },
  batchBar: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: 96,
    borderRadius: 18,
    backgroundColor: colors.surfaceLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    boxShadow: '0px 6px 18px rgba(13, 115, 119, 0.18)',
  },
  batchLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  batchTotal: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 2,
  },
  batchCustomer: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  batchButton: {
    minWidth: 132,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});
