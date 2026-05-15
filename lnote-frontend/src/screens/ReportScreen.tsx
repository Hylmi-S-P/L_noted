import React, { useEffect, useMemo, useState } from 'react';
import { Alert, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { BottomNav, Button, Card, EmptyState, Input, LoadingState, Screen, TopBar } from '../components/UI/LNoteUI';
import { colors, money, shortDate, spacing, typography } from '../constants/theme';
import { exportReportCsv, getDailyReport, getSummaryReport } from '../services/api/transactionService';
import { DailyReport, SummaryReport } from '../types/domain';

type Props = {
  goBack?: () => void;
  onOpenDashboard: () => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
};

function isoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function monthStart(): string {
  const now = new Date();
  return isoDate(new Date(now.getFullYear(), now.getMonth(), 1));
}

function today(): string {
  return isoDate(new Date());
}

export default function ReportScreen({ goBack, onOpenDashboard, onOpenHistory, onOpenSettings }: Props) {
  const [daily, setDaily] = useState<DailyReport | null>(null);
  const [summary, setSummary] = useState<SummaryReport | null>(null);
  const [from, setFrom] = useState(monthStart());
  const [to, setTo] = useState(today());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [csvPreview, setCsvPreview] = useState('');

  const hasRows = (summary?.by_day.length ?? 0) > 0;
  const csvLineCount = useMemo(() => csvPreview.trim().split('\n').filter(Boolean).length, [csvPreview]);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [dailyData, summaryData] = await Promise.all([getDailyReport(), getSummaryReport(from, to)]);
      setDaily(dailyData);
      setSummary(summaryData);
    } catch {
      Alert.alert('Server belum terhubung', 'Tidak bisa terhubung ke server. Cek koneksi atau nyalakan backend.');
      setDaily(null);
      setSummary(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const applyRange = () => {
    setCsvPreview('');
    void load();
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      const csv = await exportReportCsv(from, to);
      setCsvPreview(csv);
      Alert.alert('CSV siap', 'Data CSV sudah dibuat. Teks di bawah bisa dipilih/copy untuk disimpan.');
    } catch {
      Alert.alert('Export gagal', 'Gagal menyimpan. Coba lagi.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <View style={styles.root}>
      <Screen
        bottomInset={120}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
      >
        <TopBar title="Laporan" onBack={goBack} />

        <View style={styles.header}>
          <Text style={styles.title}>Laporan Usaha</Text>
          <Text style={styles.subtitle}>Ringkasan omzet, pembayaran lunas, dan tagihan yang masih terbuka.</Text>
        </View>

        {loading ? <LoadingState label="Menghitung laporan..." /> : null}

        {!loading ? (
          <>
            <Card style={styles.heroCard}>
              <Text style={styles.heroLabel}>Total Tagihan Hari Ini</Text>
              <Text style={styles.heroAmount}>{money(daily?.total_revenue ?? 0)}</Text>
              <View style={styles.metricRow}>
                <Metric label="Lunas" value={money(daily?.paid_revenue ?? 0)} />
                <Metric label="Belum Lunas" value={money(daily?.unpaid_total ?? 0)} tone="warning" />
              </View>
              <Text style={styles.heroFoot}>
                {daily?.total_transactions ?? 0} transaksi hari ini, {daily?.unpaid_transactions ?? 0} belum lunas.
              </Text>
            </Card>

            <Card style={styles.cardStack}>
              <Text style={styles.cardLabel}>Rentang Laporan</Text>
              <View style={styles.dateGrid}>
                <Input label="Dari" value={from} onChangeText={setFrom} placeholder="YYYY-MM-DD" />
                <Input label="Sampai" value={to} onChangeText={setTo} placeholder="YYYY-MM-DD" />
              </View>
              <Button onPress={applyRange} variant="secondary">
                Terapkan Rentang
              </Button>
            </Card>

            <View style={styles.summaryGrid}>
              <Card style={styles.summaryCard}>
                <Text style={styles.cardLabel}>Total Tagihan</Text>
                <Text style={styles.summaryValue}>{money(summary?.total_revenue ?? 0)}</Text>
              </Card>
              <Card style={styles.summaryCard}>
                <Text style={styles.cardLabel}>Belum Lunas</Text>
                <Text style={[styles.summaryValue, styles.warningValue]}>{money(summary?.unpaid_total ?? 0)}</Text>
              </Card>
            </View>

            <Card style={styles.cardStack}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.cardLabel}>Rincian Harian</Text>
                  <Text style={styles.rangeText}>
                    {shortDate(summary?.from)} sampai {shortDate(summary?.to)}
                  </Text>
                </View>
                <Text style={styles.countText}>{summary?.total_transactions ?? 0} trx</Text>
              </View>

              {hasRows ? (
                <View style={styles.dayList}>
                  {summary?.by_day.map((row) => (
                    <View key={row.day} style={styles.dayRow}>
                      <View style={styles.dayLeft}>
                        <Text style={styles.dayTitle}>{shortDate(row.day)}</Text>
                        <Text style={styles.dayMeta}>
                          {row.total_transactions} transaksi | belum lunas {money(row.unpaid_total)}
                        </Text>
                      </View>
                      <Text style={styles.dayAmount}>{money(row.total_revenue)}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <EmptyState title="Belum ada transaksi" subtitle="Coba ubah rentang tanggal laporan." />
              )}
            </Card>

            <Card style={styles.cardStack}>
              <Text style={styles.cardLabel}>Export CSV</Text>
              <Text style={styles.helpText}>
                Untuk Expo Go, export dibuat sebagai teks CSV yang bisa dipilih dan disimpan. Nanti di production build bisa kita ubah menjadi file download/share.
              </Text>
              <Button onPress={exportCsv} disabled={exporting}>
                {exporting ? 'Membuat CSV...' : 'Buat CSV'}
              </Button>
              {csvPreview ? (
                <View style={styles.csvBox}>
                  <Text style={styles.csvMeta}>{csvLineCount} baris CSV</Text>
                  <Text selectable style={styles.csvText}>
                    {csvPreview}
                  </Text>
                </View>
              ) : null}
            </Card>
          </>
        ) : null}
      </Screen>

      <BottomNav
        active="reports"
        onDashboard={onOpenDashboard}
        onHistory={onOpenHistory}
        onReports={() => undefined}
        onSettings={onOpenSettings}
      />
    </View>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone?: 'warning' }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, tone === 'warning' && styles.warningValue]}>{value}</Text>
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
  heroCard: {
    backgroundColor: colors.primaryContainer,
    gap: spacing.md,
  },
  heroLabel: {
    ...typography.label,
    color: colors.onPrimaryContainer,
  },
  heroAmount: {
    color: colors.onPrimary,
    fontSize: 34,
    lineHeight: 42,
    fontWeight: '700',
  },
  heroFoot: {
    color: colors.onPrimaryContainer,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  metricRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  metric: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.16)',
    padding: spacing.md,
    gap: spacing.xs,
  },
  metricLabel: {
    color: colors.onPrimaryContainer,
    fontSize: 13,
    fontWeight: '700',
  },
  metricValue: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  warningValue: {
    color: colors.onWarningContainer,
  },
  cardStack: {
    gap: spacing.md,
  },
  cardLabel: {
    ...typography.label,
    color: colors.primary,
  },
  dateGrid: {
    gap: spacing.md,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  summaryCard: {
    flex: 1,
    gap: spacing.sm,
  },
  summaryValue: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  rangeText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  countText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  dayList: {
    gap: spacing.md,
  },
  dayRow: {
    borderTopWidth: 1,
    borderTopColor: colors.surfaceVariant,
    paddingTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  dayLeft: {
    flex: 1,
  },
  dayTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  dayMeta: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  dayAmount: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  helpText: {
    ...typography.body,
    color: colors.textMuted,
  },
  csvBox: {
    borderRadius: 12,
    backgroundColor: colors.surfaceLow,
    padding: spacing.md,
    gap: spacing.sm,
  },
  csvMeta: {
    ...typography.label,
    color: colors.textMuted,
  },
  csvText: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 18,
  },
});
