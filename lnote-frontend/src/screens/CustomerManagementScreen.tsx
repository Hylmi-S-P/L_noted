import React, { useEffect, useState } from 'react';
import { Alert, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Button, Card, EmptyState, Input, LoadingState, Screen, TopBar } from '../components/UI/LNoteUI';
import { colors, spacing, typography } from '../constants/theme';
import { createCustomer, deleteCustomer, getCustomers, updateCustomer } from '../services/api/customerService';
import { Customer } from '../types/domain';

type Props = {
  goBack: () => void;
};

function apiMessage(error: unknown, fallback: string): string {
  const maybe = error as { response?: { data?: { message?: string } } };
  return maybe.response?.data?.message ?? fallback;
}

const offlineMessage = 'Tidak bisa terhubung ke server. Cek koneksi atau nyalakan backend.';

export default function CustomerManagementScreen({ goBack }: Props) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      setCustomers(await getCustomers());
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

  const openAdd = () => {
    setEditing(null);
    setName('');
    setPhone('');
    setAddress('');
    setShowForm(true);
  };

  const openEdit = (customer: Customer) => {
    setEditing(customer);
    setName(customer.name ?? '');
    setPhone(customer.phone_number ?? customer.phone ?? '');
    setAddress(customer.address ?? '');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setName('');
    setPhone('');
    setAddress('');
  };

  const save = async () => {
    const cleanName = name.trim();
    if (!cleanName) {
      Alert.alert('Nama belum diisi', 'Isi nama pelanggan dulu.');
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await updateCustomer(editing.id, {
          name: cleanName,
          phone_number: phone.trim(),
          address: address.trim(),
        });
        Alert.alert('Tersimpan', 'Data pelanggan sudah diperbarui.');
      } else {
        await createCustomer({
          name: cleanName,
          phone_number: phone.trim(),
          address: address.trim(),
        });
        Alert.alert('Tersimpan', 'Pelanggan baru sudah ditambahkan.');
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

    Alert.alert('Hapus pelanggan?', 'Data ini tidak bisa dikembalikan.', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          setSaving(true);
          try {
            await deleteCustomer(editing.id);
            Alert.alert('Terhapus', 'Pelanggan sudah dihapus.');
            closeForm();
            await load();
          } catch (error) {
            Alert.alert('Tidak bisa dihapus', apiMessage(error, 'Pelanggan ini tidak bisa dihapus.'));
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
        <TopBar title="Data Pelanggan" onBack={goBack} />

        <View style={styles.header}>
          <Text style={styles.title}>Data Pelanggan</Text>
          <Text style={styles.subtitle}>Simpan nama dan nomor HP pelanggan supaya input transaksi lebih cepat.</Text>
        </View>

        {!showForm ? (
          <Button onPress={openAdd} style={styles.bigButton}>
            Tambah Pelanggan
          </Button>
        ) : null}

        {showForm ? (
          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>{editing ? 'Ubah Pelanggan' : 'Tambah Pelanggan'}</Text>
            <Input label="Nama" value={name} onChangeText={setName} placeholder="Contoh: Ibu Siti" />
            <Input label="Nomor HP" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="08..." />
            <Input label="Alamat opsional" value={address} onChangeText={setAddress} placeholder="Boleh dikosongkan" />
            <Button onPress={save} disabled={saving}>
              {saving ? 'Menyimpan...' : 'Simpan'}
            </Button>
            <Button onPress={closeForm} disabled={saving} variant="ghost">
              Batal
            </Button>
            {editing ? (
              <Pressable onPress={confirmDelete} disabled={saving} style={styles.deleteLink}>
                <Text style={styles.deleteText}>Hapus pelanggan ini</Text>
              </Pressable>
            ) : null}
          </Card>
        ) : null}

        {loading ? <LoadingState label="Memuat pelanggan..." /> : null}

        {!loading && customers.length === 0 ? (
          <EmptyState title="Belum ada pelanggan" subtitle="Tekan tombol Tambah Pelanggan untuk mulai." />
        ) : null}

        {!loading && customers.length > 0 ? (
          <View style={styles.list}>
            {customers.map((customer) => (
              <Pressable key={customer.id} onPress={() => openEdit(customer)} style={({ pressed }) => pressed && styles.pressed}>
                <Card style={styles.itemCard}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{customer.name?.charAt(0).toUpperCase() ?? 'P'}</Text>
                  </View>
                  <View style={styles.itemBody}>
                    <Text style={styles.itemTitle}>{customer.name}</Text>
                    <Text style={styles.itemSub}>{customer.phone_number ?? customer.phone ?? 'Nomor HP belum diisi'}</Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
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
    gap: spacing.md,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.onSecondaryContainer,
    fontSize: 22,
    fontWeight: '700',
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
  chevron: {
    color: colors.primary,
    fontSize: 30,
    fontWeight: '700',
  },
  pressed: {
    transform: [{ scale: 0.99 }],
  },
});
