import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import {
  Button,
  Card,
  Screen,
  TopBar,
} from '../components/UI/LNoteUI';
import { colors, money, shortDate, spacing, typography } from '../constants/theme';
import { getTransaction, updateTransactionPayment } from '../services/api/transactionService';
import { Transaction } from '../types/domain';

type Props = {
  transactionId: number;
  goBack?: () => void;
};

export default function TransactionDetailScreen({ transactionId, goBack }: Props) {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getTransaction(transactionId);
      setTransaction(data);
    } catch {
      Alert.alert('Server belum terhubung', 'Tidak bisa terhubung ke server. Cek koneksi atau nyalakan backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [transactionId]);

  const setPayment = async () => {
    if (!transaction) return;
    setSaving(true);
    try {
      const nextPayment = transaction.payment_status === 'belum_lunas' ? 'lunas' : 'belum_lunas';
      const updated = await updateTransactionPayment(transaction.id, nextPayment);
      setTransaction(updated);
    } catch {
      Alert.alert('Gagal menyimpan', 'Gagal menyimpan. Coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingRoot}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!transaction) {
    return (
      <Screen>
        <TopBar title="Detail" onBack={goBack} />
        <Text style={styles.notFound}>Transaksi tidak ditemukan.</Text>
      </Screen>
    );
  }

  const service = transaction.service_price ?? transaction.servicePrice;
  const amount = transaction.total_price ?? transaction.amount;
  const unitPrice = transaction.price_per_kg ?? service?.price_per_kg ?? service?.price ?? 0;

  return (
    <Screen bottomInset={32}>
      <TopBar title="Detail Transaksi" onBack={goBack} />

      <View style={styles.header}>
        <Text style={styles.title}>Detail Transaksi</Text>
        <Text style={styles.subtitle}>Nota #{transaction.id} · {shortDate(transaction.created_at)}</Text>
      </View>

      <Card>
        <Text style={styles.cardLabel}>Info Pelanggan</Text>
        <View style={styles.customerRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{transaction.customer?.name?.charAt(0).toUpperCase() ?? 'L'}</Text>
          </View>
          <View style={styles.customerBody}>
            <Text style={styles.customerName}>{transaction.customer?.name ?? 'Pelanggan'}</Text>
            <Text style={styles.customerPhone}>{transaction.customer?.phone_number ?? transaction.customer?.phone ?? '-'}</Text>
          </View>
        </View>
      </Card>

      <Card>
        <Text style={styles.cardLabel}>Rincian Pesanan</Text>
        <DetailRow label="Layanan" value={service?.name ?? transaction.service_type ?? '-'} />
        <DetailRow label="Berat" value={`${transaction.weight_kg ?? transaction.quantity} kg`} />
        <DetailRow label="Harga Satuan" value={money(unitPrice)} />
        <DetailRow label="Catatan" value={transaction.notes ?? '-'} />
        <View style={styles.divider} />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Tagihan</Text>
          <Text style={styles.totalValue}>{money(amount)}</Text>
        </View>
      </Card>

      <Card style={styles.paymentCard}>
        <Text style={styles.cardLabel}>Pembayaran</Text>
        <Text style={styles.paymentTitle}>
          {transaction.payment_status === 'lunas' ? 'Tagihan sudah lunas' : 'Tagihan belum lunas'}
        </Text>
        <Text style={styles.paymentSub}>Ubah hanya ketika pembayaran benar-benar diterima.</Text>
      </Card>

      <View style={styles.actionStack}>
        <Button onPress={setPayment} disabled={saving} variant={transaction.payment_status === 'lunas' ? 'ghost' : 'secondary'}>
          {saving ? 'Menyimpan...' : transaction.payment_status === 'lunas' ? 'Tandai Belum Lunas' : 'Tandai Lunas'}
        </Button>
      </View>
    </Screen>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  notFound: {
    ...typography.body,
    color: colors.textMuted,
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
  cardLabel: {
    ...typography.label,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryContainer,
  },
  avatarText: {
    color: colors.onPrimaryContainer,
    fontSize: 20,
    fontWeight: '700',
  },
  customerBody: {
    flex: 1,
  },
  customerName: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  customerPhone: {
    color: colors.outline,
    fontSize: 15,
    marginTop: 2,
  },
  detailRow: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  detailLabel: {
    flex: 1,
    color: colors.outline,
    fontSize: 15,
  },
  detailValue: {
    flex: 1.15,
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceVariant,
    marginVertical: spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  totalLabel: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  totalValue: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: '700',
  },
  paymentCard: {
    gap: spacing.sm,
  },
  paymentTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  paymentSub: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  actionStack: {
    gap: spacing.md,
  },
});
