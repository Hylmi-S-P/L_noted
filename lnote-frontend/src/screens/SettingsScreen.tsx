import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Badge, BottomNav, Button, Card, LoadingState, Screen, TopBar } from '../components/UI/LNoteUI';
import { features } from '../config/features';
import { colors, spacing, typography } from '../constants/theme';
import { getIntegrationStatus, sendTestNotification } from '../services/api/integrationService';
import { IntegrationStatus, User } from '../types/domain';

type Props = {
  user: User;
  onOpenDashboard: () => void;
  onOpenHistory: () => void;
  onOpenReports: () => void;
  onOpenCustomers: () => void;
  onOpenServices: () => void;
  onLogout: () => void;
};

export default function SettingsScreen({
  user,
  onOpenDashboard,
  onOpenHistory,
  onOpenReports,
  onOpenCustomers,
  onOpenServices,
  onLogout,
}: Props) {
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registrationMessage, setRegistrationMessage] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      setStatus(await getIntegrationStatus());
    } catch {
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const testPush = async () => {
    if (!features.pushNotifications) return;
    setSending(true);
    try {
      await sendTestNotification();
      Alert.alert('Notifikasi dikirim', 'Cek perangkat yang sudah menyimpan token FCM.');
    } catch {
      Alert.alert('Notifikasi gagal', 'Pastikan FCM dan device token sudah dikonfigurasi.');
    } finally {
      setSending(false);
      void load();
    }
  };

  const registerThisDevice = async () => {
    if (!features.pushNotifications) return;
    setRegistering(true);
    try {
      const { registerDeviceForPushNotifications } = await import('../services/notification/pushRegistration');
      const result = await registerDeviceForPushNotifications();
      setRegistrationMessage(result.message);
      if (result.ok) {
        Alert.alert('Perangkat terdaftar', result.message);
      } else {
        Alert.alert('Belum bisa daftar', result.message);
      }
      await load();
    } finally {
      setRegistering(false);
    }
  };

  return (
    <View style={styles.root}>
      <Screen bottomInset={120}>
        <TopBar title="Pengaturan" />
        <View style={styles.header}>
          <Text style={styles.title}>Pengaturan</Text>
          <Text style={styles.subtitle}>Profil, koneksi backend, dan status integrasi produksi.</Text>
        </View>

        <Card>
          <Text style={styles.cardLabel}>Profil</Text>
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
        </Card>

        <View style={styles.menuStack}>
          <MenuCard
            title="Data Pelanggan"
            subtitle="Tambah atau ubah nama dan nomor HP pelanggan."
            onPress={onOpenCustomers}
          />
          <MenuCard
            title="Data Layanan"
            subtitle="Atur nama layanan dan harga per kg."
            onPress={onOpenServices}
          />
        </View>

        <Card style={styles.cardStack}>
          <Text style={styles.cardLabel}>Integrasi</Text>
          {loading ? <LoadingState label="Memeriksa integrasi..." /> : null}
          {!loading ? (
            <>
              {features.pushNotifications ? (
                <>
                  <StatusRow label="FCM Backend" ok={status?.fcm_configured ?? false} />
                  <StatusRow label="Perangkat Ini" ok={status?.device_token_saved ?? false} />
                </>
              ) : (
                <StatusRow label="Notifikasi" ok={false} textOverride="Dimatikan" />
              )}
              <Text style={styles.helpText}>
                {features.pushNotifications
                  ? 'Notifikasi aktif jika backend FCM siap dan perangkat ini sudah terdaftar.'
                  : 'Notifikasi tidak dipakai untuk versi produksi ini agar aplikasi tetap sederhana.'}
              </Text>
            </>
          ) : null}
        </Card>

        {features.pushNotifications ? (
          <Card style={styles.cardStack}>
            <Text style={styles.cardLabel}>Notifikasi HP Ini</Text>
            <Text style={styles.helpText}>
              Tekan tombol ini kalau status perangkat masih belum aktif. Untuk Android, tes push perlu development build atau production build, bukan Expo Go.
            </Text>
            <Button onPress={registerThisDevice} disabled={registering} variant="secondary">
              {registering ? 'Mendaftarkan...' : 'Daftarkan Perangkat'}
            </Button>
            {registrationMessage ? <Text style={styles.statusHint}>{registrationMessage}</Text> : null}
          </Card>
        ) : null}

        <View style={styles.actionStack}>
          {features.pushNotifications ? (
            <Button onPress={testPush} disabled={sending} variant="secondary">
              {sending ? 'Mengirim...' : 'Tes Notifikasi'}
            </Button>
          ) : null}
          <Button onPress={onLogout} variant="danger">Keluar</Button>
        </View>
      </Screen>
      <BottomNav
        active="settings"
        onDashboard={onOpenDashboard}
        onHistory={onOpenHistory}
        onReports={onOpenReports}
      />
    </View>
  );
}

function MenuCard({ title, subtitle, onPress }: { title: string; subtitle: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      <Card style={styles.menuCard}>
        <View style={styles.menuTextWrap}>
          <Text style={styles.menuTitle}>{title}</Text>
          <Text style={styles.menuSubtitle}>{subtitle}</Text>
        </View>
        <Text style={styles.menuArrow}>›</Text>
      </Card>
    </Pressable>
  );
}

function StatusRow({ label, ok, textOverride }: { label: string; ok: boolean; textOverride?: string }) {
  return (
    <View style={styles.statusRow}>
      <Text style={styles.statusLabel}>{label}</Text>
      <Badge label={textOverride ?? (ok ? 'Aktif' : 'Belum')} tone={ok ? 'success' : 'warning'} />
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
  cardLabel: {
    ...typography.label,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  profileName: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  profileEmail: {
    color: colors.textMuted,
    fontSize: 15,
    marginTop: spacing.xs,
  },
  cardStack: {
    gap: spacing.md,
  },
  menuStack: {
    gap: spacing.md,
  },
  menuCard: {
    minHeight: 92,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  menuTextWrap: {
    flex: 1,
  },
  menuTitle: {
    color: colors.text,
    fontSize: 22,
    lineHeight: 30,
    fontWeight: '700',
  },
  menuSubtitle: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
    marginTop: spacing.xs,
  },
  menuArrow: {
    color: colors.primary,
    fontSize: 32,
    fontWeight: '700',
  },
  statusRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  statusLabel: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  helpText: {
    ...typography.body,
    color: colors.textMuted,
  },
  statusHint: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '700',
  },
  actionStack: {
    gap: spacing.md,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
  },
});
