import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Badge, Button, Card, EmptyState, Input, LoadingState, Screen, TopBar } from '../components/UI/LNoteUI';
import { colors, money, spacing, typography } from '../constants/theme';
import { createCustomer, getCustomers } from '../services/api/customerService';
import { createServicePrice, createTransaction, deleteServicePrice, getServicePrices } from '../services/api/transactionService';
import { Customer, ServicePrice } from '../types/domain';

type Props = {
  navigation: {
    goBack: () => void;
  };
};

type PricingMode = 'system' | 'manual';

const offlineMessage = 'Tidak bisa terhubung ke server. Cek koneksi atau nyalakan backend.';
const incompleteMessage = 'Data belum lengkap. Periksa bagian yang kosong.';
const saveFailedMessage = 'Gagal menyimpan. Coba lagi.';

function parseDecimalInput(value: string): number {
  const normalized = value.replace(',', '.').replace(/[^0-9.]/g, '');
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseIntegerInput(value: string): number {
  const parsed = Number.parseInt(value.replace(/[^0-9]/g, ''), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function AddTransactionScreen({ navigation }: Props) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<ServicePrice[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [pricingMode, setPricingMode] = useState<PricingMode>('system');
  const [weightKg, setWeightKg] = useState('1');
  const [manualTotalPrice, setManualTotalPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);

  const load = async () => {
    try {
      const [loadedCustomers, loadedServices] = await Promise.all([getCustomers(), getServicePrices()]);
      setCustomers(loadedCustomers);
      setServices(loadedServices);
    } catch {
      setCustomers([]);
      setServices([]);
      Alert.alert('Server belum terhubung', offlineMessage);
    } finally {
      setBooting(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const computeSystemTotal = () => {
    const svc = services.find((s) => s.id === selectedService);
    if (!svc) return 0;
    const weight = parseDecimalInput(weightKg);
    const unitPrice = svc.price_per_kg ?? svc.price;
    return Math.round(unitPrice * weight);
  };

  const computeTotal = () => {
    if (pricingMode === 'manual') return parseIntegerInput(manualTotalPrice);
    return computeSystemTotal();
  };

  const addCustomer = async () => {
    if (!customerName.trim()) {
      Alert.alert('Nama pelanggan kosong', 'Isi nama pelanggan terlebih dahulu.');
      return;
    }

    setLoading(true);
    try {
      const customer = await createCustomer({
        name: customerName.trim(),
        phone_number: customerPhone.trim() || undefined,
      });
      setCustomers((current) => [customer, ...current]);
      setSelectedCustomer(customer.id);
      setCustomerName('');
      setCustomerPhone('');
      setShowCustomerForm(false);
    } catch {
      Alert.alert('Gagal menyimpan', offlineMessage);
    } finally {
      setLoading(false);
    }
  };

  const addService = async () => {
    const price = parseIntegerInput(servicePrice);
    if (!serviceName.trim() || price <= 0) {
      Alert.alert('Data layanan belum lengkap', 'Isi nama layanan dan harga per kg.');
      return;
    }

    setLoading(true);
    try {
      const service = await createServicePrice({
        name: serviceName.trim(),
        service_type: serviceName.trim(),
        price_per_kg: price,
        unit: 'kg',
      });
      setServices((current) => [service, ...current]);
      setSelectedService(service.id);
      setServiceName('');
      setServicePrice('');
      setShowServiceForm(false);
    } catch {
      Alert.alert('Gagal menyimpan', offlineMessage);
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteService = (service: ServicePrice) => {
    Alert.alert(
      'Hapus layanan?',
      'Pastikan layanan ini memang salah dibuat.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await deleteServicePrice(service.id);
              setServices((current) => current.filter((item) => item.id !== service.id));
              if (selectedService === service.id) {
                setSelectedService(null);
              }
            } catch {
              Alert.alert('Tidak bisa dihapus', 'Layanan ini sudah dipakai, jadi tidak bisa dihapus.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const submit = async () => {
    const weight = parseDecimalInput(weightKg);
    const manualTotal = parseIntegerInput(manualTotalPrice);
    if (!selectedCustomer || !selectedService) {
      Alert.alert('Data belum lengkap', incompleteMessage);
      return;
    }

    if (weight <= 0) {
      Alert.alert('Berat tidak valid', 'Berat harus lebih dari 0 kg. Contoh: 1,5 kg.');
      return;
    }

    if (pricingMode === 'manual' && manualTotal <= 0) {
      Alert.alert('Harga manual belum valid', 'Isi total harga manual lebih dari Rp 0.');
      return;
    }

    setLoading(true);
    try {
      await createTransaction({
        customer_id: selectedCustomer,
        service_price_id: selectedService,
        weight_kg: weight,
        manual_total_price: pricingMode === 'manual' ? manualTotal : undefined,
        notes: notes || undefined,
      });
      Alert.alert('Sukses', 'Transaksi dibuat.');
      navigation.goBack();
    } catch {
      Alert.alert('Gagal menyimpan', saveFailedMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen bottomInset={32}>
      <TopBar title="Tambah" onBack={navigation.goBack} />
      <View style={styles.header}>
        <Text style={styles.title}>Tambah Transaksi</Text>
        <Text style={styles.subtitle}>Pilih pelanggan, layanan, isi berat, lalu simpan.</Text>
      </View>

      {booting ? <LoadingState /> : null}

      {!booting ? (
        <>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>1. Pilih Pelanggan</Text>
                <Text style={styles.sectionHint}>{selectedCustomer ? 'Pelanggan sudah dipilih.' : 'Tekan nama pelanggan.'}</Text>
              </View>
              <Button onPress={() => setShowCustomerForm((current) => !current)} disabled={loading} variant="secondary">
                {showCustomerForm ? 'Tutup' : 'Tambah'}
              </Button>
            </View>
            {showCustomerForm ? (
              <Card style={styles.formCard}>
                <Text style={styles.formTitle}>Pelanggan Baru</Text>
                <Input label="Nama" value={customerName} onChangeText={setCustomerName} placeholder="Contoh: Ibu Siti" />
                <Input label="Nomor HP opsional" value={customerPhone} onChangeText={setCustomerPhone} keyboardType="phone-pad" placeholder="08..." />
                <Button onPress={addCustomer} disabled={loading} variant="secondary">Simpan Pelanggan</Button>
              </Card>
            ) : null}
            {customers.length === 0 ? (
              <EmptyState title="Belum ada pelanggan" subtitle="Buat pelanggan baru dari form di atas." />
            ) : (
              <View style={styles.optionList}>
                {customers.map((customer) => (
                  <SelectableCard
                    key={customer.id}
                    selected={selectedCustomer === customer.id}
                    title={customer.name}
                    subtitle={customer.phone_number ?? customer.phone ?? 'Tanpa nomor telepon'}
                    onPress={() => setSelectedCustomer(customer.id)}
                  />
                ))}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>2. Pilih Layanan</Text>
                <Text style={styles.sectionHint}>{selectedService ? 'Layanan sudah dipilih.' : 'Tekan jenis layanan.'}</Text>
              </View>
              <Button onPress={() => setShowServiceForm((current) => !current)} disabled={loading} variant="secondary">
                {showServiceForm ? 'Tutup' : 'Tambah'}
              </Button>
            </View>
            {showServiceForm ? (
              <Card style={styles.formCard}>
                <Text style={styles.formTitle}>Layanan Baru</Text>
                <Input label="Nama Layanan" value={serviceName} onChangeText={setServiceName} placeholder="Contoh: Cuci Setrika" />
                <Input label="Harga per kg" value={servicePrice} onChangeText={setServicePrice} keyboardType="number-pad" placeholder="8000" />
                <Button onPress={addService} disabled={loading} variant="secondary">Simpan Layanan</Button>
              </Card>
            ) : null}
            {services.length === 0 ? (
              <EmptyState title="Belum ada layanan" subtitle="Buat layanan dan harga per kg dari form di atas." />
            ) : (
              <View style={styles.optionList}>
                {services.map((service) => (
                  <SelectableCard
                    key={service.id}
                    selected={selectedService === service.id}
                    title={service.name}
                    subtitle={`${money(service.price_per_kg ?? service.price)} / kg`}
                    badge="kg"
                    onPress={() => setSelectedService(service.id)}
                    onDelete={() => confirmDeleteService(service)}
                  />
                ))}
              </View>
            )}
          </View>

          <Card style={styles.formCard}>
            <Text style={styles.sectionTitle}>3. Berat dan Harga</Text>
            <View style={styles.modeRow}>
              <ModeButton label="Hitung Sistem" selected={pricingMode === 'system'} onPress={() => setPricingMode('system')} />
              <ModeButton label="Harga Manual" selected={pricingMode === 'manual'} onPress={() => setPricingMode('manual')} />
            </View>
            <Input
              label="Berat kg"
              value={weightKg}
              onChangeText={setWeightKg}
              keyboardType="decimal-pad"
              placeholder="Contoh: 1,5 kg"
            />
            <Text style={styles.inputHelp}>Boleh pakai koma atau titik. Contoh: 1,5 atau 2.3</Text>
            {pricingMode === 'manual' ? (
              <Input
                label="Total harga manual"
                value={manualTotalPrice}
                onChangeText={setManualTotalPrice}
                keyboardType="number-pad"
                placeholder="26000"
              />
            ) : null}
            <Input
              label="Catatan (opsional)"
              value={notes}
              onChangeText={setNotes}
              placeholder="Contoh: antar sore"
            />
            <View style={styles.totalRow}>
              <View>
                <Text style={styles.totalLabel}>Total Tagihan</Text>
                <Text style={styles.totalHint}>{pricingMode === 'manual' ? 'Dari input manual' : 'Berat x harga/kg'}</Text>
              </View>
              <Text style={styles.totalValue}>{money(computeTotal())}</Text>
            </View>
          </Card>

          <Button onPress={submit} disabled={loading || booting}>
            {loading ? 'Menyimpan...' : 'Simpan Transaksi'}
          </Button>
        </>
      ) : null}
    </Screen>
  );
}

function ModeButton({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.modeButton, selected && styles.modeButtonActive]}>
      <Text style={[styles.modeText, selected && styles.modeTextActive]}>{label}</Text>
    </Pressable>
  );
}

function SelectableCard({
  title,
  subtitle,
  badge,
  selected,
  onPress,
  onDelete,
}: {
  title: string;
  subtitle: string;
  badge?: string;
  selected: boolean;
  onPress: () => void;
  onDelete?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
      <Card style={[styles.selectCard, selected && styles.selectCardActive]}>
        <View style={styles.selectAvatar}>
          <Text style={styles.selectAvatarText}>{title.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.selectBody}>
          <Text style={[styles.optionTitle, selected && styles.optionTitleActive]}>{title}</Text>
          <Text style={[styles.optionSub, selected && styles.optionSubActive]}>{subtitle}</Text>
        </View>
        <View style={styles.cardActions}>
          {badge ? <Badge label={badge} tone={selected ? 'success' : 'neutral'} /> : null}
          {onDelete ? (
            <Pressable
              onPress={(event) => {
                event.stopPropagation();
                onDelete();
              }}
              hitSlop={8}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteText}>Hapus</Text>
            </Pressable>
          ) : null}
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  section: {
    gap: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.heading,
  },
  sectionHint: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 2,
  },
  optionList: {
    gap: spacing.md,
  },
  modeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modeButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceLowest,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  modeButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  modeText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
  modeTextActive: {
    color: colors.onPrimary,
  },
  selectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  selectCardActive: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primary,
  },
  selectAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectAvatarText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 16,
  },
  selectBody: {
    flex: 1,
  },
  cardActions: {
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  deleteButton: {
    minHeight: 32,
    borderRadius: 999,
    backgroundColor: colors.errorContainer,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  deleteText: {
    color: colors.onErrorContainer,
    fontSize: 12,
    fontWeight: '700',
  },
  optionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  optionTitleActive: {
    color: colors.onPrimaryContainer,
  },
  optionSub: {
    color: colors.textMuted,
    marginTop: 2,
    fontSize: 14,
  },
  optionSubActive: {
    color: colors.onPrimaryContainer,
  },
  formCard: {
    gap: spacing.lg,
  },
  formTitle: {
    ...typography.label,
    color: colors.primary,
  },
  inputHelp: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: -spacing.sm,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.surfaceVariant,
    paddingTop: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  totalLabel: {
    ...typography.body,
    fontWeight: '700',
  },
  totalHint: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  totalValue: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: '700',
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
});
