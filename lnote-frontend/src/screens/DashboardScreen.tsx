import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getDailyReport, getSummaryReport } from '../services/api/reportService';
import { DailyReport, SummaryReport, User } from '../types/domain';

type Props = {
  user: User;
  onOpenAdd: () => void;
  onOpenHistory: () => void;
  onLogout: () => void;
};

export default function DashboardScreen({ user, onOpenAdd, onOpenHistory, onLogout }: Props) {
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null);
  const [summaryReport, setSummaryReport] = useState<SummaryReport | null>(null);
  const [loading, setLoading] = useState(true);

  const currentMonthRange = useMemo(() => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const toIso = (date: Date) => date.toISOString().slice(0, 10);
    return { from: toIso(from), to: toIso(to) };
  }, []);

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      try {
        const [daily, summary] = await Promise.all([
          getDailyReport(),
          getSummaryReport(currentMonthRange.from, currentMonthRange.to),
        ]);
        setDailyReport(daily);
        setSummaryReport(summary);
      } catch {
        setDailyReport(null);
        setSummaryReport(null);
      } finally {
        setLoading(false);
      }
    };

    void loadReports();
  }, [currentMonthRange.from, currentMonthRange.to]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {user.name}</Text>
      <Text style={styles.subtitle}>Laundry operations MVP</Text>

      {loading ? (
        <ActivityIndicator style={{ marginBottom: 12 }} />
      ) : (
        <View style={styles.reportGrid}>
          <View style={styles.reportCard}>
            <Text style={styles.reportLabel}>Today Revenue</Text>
            <Text style={styles.reportValue}>Rp {(dailyReport?.total_revenue ?? 0).toLocaleString()}</Text>
          </View>
          <View style={styles.reportCard}>
            <Text style={styles.reportLabel}>Today Transactions</Text>
            <Text style={styles.reportValue}>{dailyReport?.transaction_count ?? 0}</Text>
          </View>
          <View style={styles.reportCard}>
            <Text style={styles.reportLabel}>Today Unpaid</Text>
            <Text style={styles.reportValue}>{dailyReport?.unpaid_count ?? 0}</Text>
          </View>
          <View style={styles.reportCard}>
            <Text style={styles.reportLabel}>Month Revenue</Text>
            <Text style={styles.reportValue}>Rp {(summaryReport?.total_revenue ?? 0).toLocaleString()}</Text>
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={onOpenAdd}>
        <Text style={styles.buttonText}>Add Transaction</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={onOpenHistory}>
        <Text style={styles.buttonText}>Transaction History</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.outline]} onPress={onLogout}>
        <Text style={[styles.buttonText, styles.outlineText]}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '700', color: '#0f172a', marginTop: 18 },
  subtitle: { marginTop: 6, marginBottom: 30, color: '#475569' },
  reportGrid: { marginBottom: 16, gap: 8 },
  reportCard: { backgroundColor: '#f0fdfa', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#ccfbf1' },
  reportLabel: { color: '#0f766e', fontSize: 12, fontWeight: '600' },
  reportValue: { color: '#0f172a', fontSize: 18, fontWeight: '700', marginTop: 4 },
  button: {
    height: 56,
    borderRadius: 10,
    backgroundColor: '#0f766e',
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '700' },
  outline: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ef4444' },
  outlineText: { color: '#ef4444' },
});
