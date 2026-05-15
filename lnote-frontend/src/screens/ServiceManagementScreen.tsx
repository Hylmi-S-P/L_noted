import React, { useEffect, useState } from 'react';
import { Alert, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Button, Card, EmptyState, Input, LoadingState, Screen, TopBar } from '../components/UI/LNoteUI';
import { colors, money, spacing, typography } from '../constants/theme';
import {
  createServicePrice,
  deleteServicePrice,
  getServicePrices,
  updateServicePrice,
} from '../services/api/transactionService';
import { ServicePrice } from '../types/domain';

type Props = {
  goBack: () => void;
};

function apiMessage(error: unknown, fallback: string): string {
  const maybe = error as { response?: { data?: { message?: string } } };
  return maybe.response?.data?.message ?? fallback;
}

const offlineMessage = 'Tidak bisa terhubung ke server. Cek koneksi atau nyalakan backend.';

function parsePrice(value: string): number {
  return Number(value.replace(/[^\d]/g, ''));
}

export default function ServiceManagementScreen({ goBack }: Props) {
  const [services, setServices] = useState<ServicePrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<ServicePrice | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      setServices(await getServicePrices());
    } catch {
      Alert.alert('Server belum terhubung', offlineMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const serviceName = (service: ServicePrice) => service.name ?? service.service_type ?? 'Layanan';
  const servicePrice = (service: ServicePrice) => service.price_per_kg ?? service.price ?? 0;

  const openAdd = () => {
    setEditing(null);
    setName('');
    setPrice('');
    setShowForm(true);
  };

  const openEdit = (service: ServicePrice) => {
    setEditing(service);
    setName(serviceName(service));
    setPrice(String(servicePrice(service)));
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setName('');
    setPrice('');
  };

  const save = async () => {
    const cleanName = name.trim();
    const cleanPrice = parsePrice(price);

    if (!cleanName) {
      Alert.alert('Nama belum diisi', 'Isi nama layanan dulu.');
      return;
    }

    if (!cleanPrice || cleanPrice < 1) {
      Alert.alert('Harga belum benar', 'Isi harga per kg, contoh: 8000.');
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await updateServicePrice(editing.id, {
          name: cleanName,
          service_type: cleanName,
          price_per_kg: cleanPrice,
          unit: 'kg',
        });
        Alert.alert('Tersimpan', 'Data layanan sudah diperbarui.');
      } else {
        await createServicePrice({
          name: cleanName,
          service_type: cleanName,
          price_per_kg: cleanPrice,
          unit: 'kg',
        });
        Alert.alert('Tersimpan', 'Layanan baru sudah ditambahkan.');
      }
      closeForm();
      await load();
    } catch (error) {
      Alert.alert('Gagal menyimpan', apiMessage(error, 'Gagal menyimpan. Coba lagi.'));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    if (!editing) return;

    Alert.alert('Hapus layanan?', 'Pastikan layanan ini memang salah dibuat.', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          setSaving(true);
          try {
            await deleteServicePrice(editing.id);
            Alert.alert('Terhapus', 'Layanan sudah dihapus.');
            closeForm();
            await load();
          } catch (error) {
            Alert.alert('Tidak bisa dihapus', apiMessage(error, 'Layanan ini tidak bisa dihapus.'));
          } finally {
            setSaving(false);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.root}>
      <Screen
        bottomInset={32}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
      >
        <TopBar title="Data Layanan" onBack={goBack} />

        <View style={styles.header}>
          <Text style={styles.title}>Data Layanan</Text>
          <Text style={styles.subtitle}>Atur jenis layanan dan harga per kg yang dipakai saat membuat transaksi.</Text>
        </View>

        {!showForm ? (
          <Button onPress={openAdd} style={styles.bigButton}>
            Tambah Layanan
          </Button>
        ) : null}

        {showForm ? (
          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>{editing ? 'Ubah Layanan' : 'Tambah Layanan'}</Text>
            <Input label="Nama Layanan" value={name} onChangeText={setName} placeholder="Contoh: Cuci Kering" />
            <Input
              label="Harga per kg"
              value={price}
              onChangeText={setPrice}
              keyboardType="number-pad"
              placeholder="8000"
            />
            <Button onPress={save} disabled={saving}>
              {saving ? 'Menyimpan...' : 'Simpan'}
            </Button>
            <Button onPress={closeForm} disabled={saving} variant="ghost">
              Batal
            </Button>
            {editing ? (
              <Pressable onPress={confirmDelete} disabled={saving} style={styles.deleteLink}>
                <Text style={styles.deleteText}>Hapus layanan ini</Text>
              </Pressable>
            ) : null}
          </Card>
        ) : null}

        {loading ? <LoadingState label="Memuat layanan..." /> : null}

        {!loading && services.length === 0 ? (
          <EmptyState title="Belum ada layanan" subtitle="Tekan tombol Tambah Layanan untuk mulai." />
        ) : null}

        {!loading && services.length > 0 ? (
          <View style={styles.list}>
            {services.map((service) => (
              <Pressable key={service.id} onPress={() => openEdit(service)} style={({ pressed }) => pressed && styles.pressed}>
                <Card style={styles.itemCard}>
                  <View style={styles.itemBody}>
                    <Text style={styles.itemTitle}>{serviceName(service)}</Text>
                    <Text style={styles.itemSub}>Harga / kg</Text>
                  </View>
                  <View style={styles.priceWrap}>
                    <Text style={styles.priceText}>{money(servicePrice(service))}</Text>
                    <Text style={styles.chevron}>›</Text>
                  </View>
                </Card>
              </Pressable>
            ))}
          </View>
        ) : null}
      </Screen>
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
    fontSize: 28,
    lineHeight: 36,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
  },
  bigButton: {
    minHeight: 68,
    borderRadius: 16,
  },
  formCard: {
    gap: spacing.lg,
  },
  formTitle: {
    ...typography.heading,
    fontSize: 24,
    lineHeight: 32,
  },
  deleteLink: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    color: colors.error,
    fontSize: 15,
    fontWeight: '700',
  },
  list: {
    gap: spacing.md,
  },
  itemCard: {
    minHeight: 86,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  itemBody: {
    flex: 1,
  },
  itemTitle: {
    color: colors.text,
    fontSize: 21,
    lineHeight: 28,
    fontWeight: '700',
  },
  itemSub: {
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 2,
  },
  priceWrap: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  priceText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  chevron: {
    color: colors.primary,
    fontSize: 30,
    fontWeight: '700',
  },
  pressed: {
    transform: [{ scale: 0.99 }],
  },
});
