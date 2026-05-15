import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomNav, Card, Screen, TopBar } from '../components/UI/LNoteUI';
import { colors, money, spacing, typography } from '../constants/theme';
import { getDailyReport, getFilteredTransactions } from '../services/api/transactionService';
import { Transaction, User } from '../types/domain';

type Props = {
  user: User;
  onOpenAdd: () => void;
  onOpenHistory: () => void;
  onOpenReports: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
};

export default function DashboardScreen({ user, onOpenAdd, onOpenHistory, onOpenReports, onOpenSettings, onLogout }: Props) {
  const [summary, setSummary] = useState<{
    total_revenue: number;
    total_transactions: number;
    unpaid_transactions: number;
  } | null>(null);
  const [activeTransactions, setActiveTransactions] = useState<Transaction[]>([]);
  const [loadingSummary, setLoadingSummary] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [daily, active] = await Promise.all([
          getDailyReport(),
          getFilteredTransactions({ status: 'proses' }),
        ]);

        setSummary({
          total_revenue: daily.total_revenue,
          total_transactions: daily.total_transactions,
          unpaid_transactions: daily.unpaid_transactions,
        });
        setActiveTransactions(active.slice(0, 3));
      } catch {
        setSummary(null);
        setActiveTransactions([]);
      } finally {
        setLoadingSummary(false);
      }
    };

    void load();
  }, []);

  return (
    <View style={styles.root}>
      <Screen bottomInset={120}>
        <TopBar onRightPress={onLogout} rightLabel="○" />

        <View style={styles.hero}>
          <View style={styles.heroOrb} />
          <Text style={styles.heroLabel}>Pendapatan Hari Ini</Text>
          {loadingSummary ? (
            <ActivityIndicator color={colors.onPrimaryContainer} style={styles.heroLoader} />
          ) : (
            <Text style={styles.heroAmount}>{money(summary?.total_revenue ?? 0)}</Text>
          )}
          <View style={styles.heroFooter}>
            <Text style={styles.heroMeta}>{summary?.total_transactions ?? 0} Transaksi</Text>
            <View style={styles.unpaidPill}>
              <Text style={styles.unpaidText}>{summary?.unpaid_transactions ?? 0} Belum Bayar</Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable onPress={onOpenAdd} style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]}>
            <Text style={styles.actionIcon}>＋</Text>
            <Text style={styles.primaryActionText}>Tambah Transaksi</Text>
          </Pressable>
          <Pressable onPress={onOpenHistory} style={({ pressed }) => [styles.secondaryAction, pressed && styles.pressed]}>
            <Text style={styles.secondaryActionText}>Riwayat</Text>
          </Pressable>
        </View>

        <Pressable onPress={onOpenHistory} style={({ pressed }) => [styles.historyStrip, pressed && styles.pressed]}>
          <Text style={styles.historyStripText}>Lihat semua riwayat transaksi</Text>
          <Text style={styles.historyStripArrow}>›</Text>
        </Pressable>

        <Pressable onPress={onOpenReports} style={({ pressed }) => [styles.reportStrip, pressed && styles.pressed]}>
          <View>
            <Text style={styles.reportTitle}>Laporan Usaha</Text>
            <Text style={styles.reportSub}>Omzet, lunas, belum lunas, dan export CSV.</Text>
          </View>
          <Text style={styles.historyStripArrow}>›</Text>
        </Pressable>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Laundry Aktif</Text>
          <Text style={styles.sectionSub}>Halo, {user.name}</Text>
        </View>

        {activeTransactions.length === 0 ? (
          <Card>
            <Text style={styles.emptyTitle}>Belum ada cucian proses</Text>
            <Text style={styles.emptyBody}>Transaksi baru akan muncul di sini setelah dibuat.</Text>
          </Card>
        ) : (
          <View style={styles.transactionList}>
            {activeTransactions.map((transaction) => (
              <Card key={transaction.id} style={styles.transactionCard}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{transaction.customer?.name?.charAt(0).toUpperCase() ?? 'L'}</Text>
                </View>
                <View style={styles.transactionBody}>
                  <Text style={styles.customerName}>{transaction.customer?.name ?? 'Pelanggan'}</Text>
                  <Text style={styles.transactionMeta}>
                    {transaction.weight_kg ?? transaction.quantity} kg · {transaction.service_price?.name ?? transaction.service_type ?? 'Layanan'}
                  </Text>
                </View>
                <Text style={styles.amount}>{money(transaction.total_price ?? transaction.amount)}</Text>
              </Card>
            ))}
          </View>
        )}
      </Screen>
      <BottomNav
        active="dashboard"
        onDashboard={() => undefined}
        onHistory={onOpenHistory}
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
  hero: {
    backgroundColor: colors.primaryContainer,
    borderRadius: 16,
    padding: spacing.xl,
    overflow: 'hidden',
    gap: spacing.sm,
  },
  heroOrb: {
    position: 'absolute',
    width: 132,
    height: 132,
    borderRadius: 66,
    right: -46,
    top: -42,
    backgroundColor: colors.primary,
    opacity: 0.22,
  },
  heroLabel: {
    ...typography.label,
    color: colors.onPrimaryContainer,
  },
  heroLoader: {
    alignSelf: 'flex-start',
    marginVertical: spacing.md,
  },
  heroAmount: {
    color: colors.onPrimaryContainer,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
  },
  heroFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.18)',
    paddingTop: spacing.md,
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  heroMeta: {
    color: colors.onPrimaryContainer,
    fontSize: 15,
    fontWeight: '700',
  },
  unpaidPill: {
    backgroundColor: colors.surfaceLowest,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  unpaidText: {
    color: colors.onWarningContainer,
    fontSize: 12,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  primaryAction: {
    flex: 1.35,
    minHeight: 56,
    borderRadius: 12,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  primaryActionText: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  actionIcon: {
    color: colors.onPrimary,
    fontSize: 22,
    fontWeight: '700',
  },
  secondaryAction: {
    flex: 1,
    minHeight: 56,
    borderRadius: 12,
    backgroundColor: colors.surfaceLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  historyStrip: {
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: colors.surfaceLow,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyStripText: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: '700',
  },
  historyStripArrow: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: '700',
  },
  reportStrip: {
    minHeight: 76,
    borderRadius: 16,
    backgroundColor: colors.tertiaryContainer,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  reportTitle: {
    color: colors.tertiary,
    fontSize: 17,
    fontWeight: '700',
  },
  reportSub: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  sectionHeader: {
    gap: 2,
  },
  sectionTitle: {
    ...typography.heading,
  },
  sectionSub: {
    ...typography.body,
    color: colors.textMuted,
  },
  transactionList: {
    gap: spacing.md,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  transactionBody: {
    flex: 1,
  },
  customerName: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  transactionMeta: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 2,
  },
  amount: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  emptyTitle: {
    ...typography.heading,
  },
  emptyBody: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
