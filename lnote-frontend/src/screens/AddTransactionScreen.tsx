import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { getCustomers } from '../services/api/customerService';
import { createTransaction, getServicePrices } from '../services/api/transactionService';
import { Customer, ServicePrice } from '../types/domain';

type Props = {
  navigation: {
    goBack: () => void;
    navigate: (screen: 'OcrCamera') => void;
  };
  route?: {
    params?: {
      ocrTotal?: number | null;
      ocrRawText?: string;
    };
  };
};

export default function AddTransactionScreen({ navigation, route }: Props) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<ServicePrice[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCustomers().then(setCustomers).catch(() => setCustomers([]));
    getServicePrices().then(setServices).catch(() => setServices([]));
  }, []);

  useEffect(() => {
    const ocrTotal = route?.params?.ocrTotal;
    const ocrRawText = route?.params?.ocrRawText;
    if (ocrTotal || ocrRawText) {
      const nextNote = `OCR Total: ${ocrTotal ?? '-'}\n${ocrRawText ?? ''}`.trim();
      setNotes(nextNote);
    }
  }, [route?.params?.ocrRawText, route?.params?.ocrTotal]);

  const computeTotal = () => {
    const svc = services.find((s) => s.id === selectedService);
    if (!svc) return 0;
    const qty = parseInt(quantity, 10) || 0;
    return svc.price * qty;
  };

  const submit = async () => {
    if (!selectedCustomer || !selectedService) {
      Alert.alert('Isi semua field', 'Pilih pelanggan dan jenis layanan');
      return;
    }
    setLoading(true);
    try {
      await createTransaction({
        customer_id: selectedCustomer,
        service_price_id: selectedService,
        quantity: parseInt(quantity, 10) || 1,
        notes: notes || undefined,
      });
      Alert.alert('Sukses', 'Transaksi dibuat');
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Gagal membuat transaksi. Periksa data dan koneksi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Tambah Transaksi</Text>
      <TouchableOpacity style={styles.ocrButton} onPress={() => navigation.navigate('OcrCamera')}>
        <Text style={styles.ocrButtonText}>Scan Receipt (OCR)</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Pelanggan</Text>
      <View style={styles.listContainer}>
        {customers.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={[styles.option, selectedCustomer === c.id && styles.optionSelected]}
            onPress={() => setSelectedCustomer(c.id)}
          >
            <Text style={styles.optionText}>{c.name}</Text>
            <Text style={styles.optionSub}>{c.phone}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Layanan</Text>
      <View style={styles.listContainer}>
        {services.map((s) => (
          <TouchableOpacity
            key={s.id}
            style={[styles.option, selectedService === s.id && styles.optionSelected]}
            onPress={() => setSelectedService(s.id)}
          >
            <Text style={styles.optionText}>{s.name}</Text>
            <Text style={styles.optionSub}>Rp {s.price.toLocaleString()} / {s.unit}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Berat / Jumlah</Text>
      <TextInput
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="numeric"
        style={styles.input}
      />
      <Text style={styles.label}>Catatan (opsional)</Text>
      <TextInput value={notes} onChangeText={setNotes} style={styles.input} />

      <Text style={styles.total}>Total: Rp {computeTotal().toLocaleString()}</Text>

      <TouchableOpacity style={styles.primaryButton} onPress={submit} disabled={loading}>
        <Text style={styles.primaryButtonText}>{loading ? 'Menyimpan...' : 'Simpan Transaksi'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  heading: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginTop: 12, marginBottom: 8 },
  listContainer: { marginBottom: 8 },
  option: { padding: 16, borderRadius: 12, backgroundColor: '#f3f4f6', marginBottom: 8 },
  optionSelected: { backgroundColor: '#0d7377' },
  optionText: { fontSize: 16, fontWeight: '600', color: '#111827' },
  optionSub: { fontSize: 12, color: '#6b7280' },
  input: { borderWidth: 1, borderColor: '#d1d5db', padding: 12, borderRadius: 10 },
  total: { fontSize: 18, fontWeight: '700', marginTop: 16, marginBottom: 12 },
  primaryButton: { height: 56, borderRadius: 12, backgroundColor: '#00595c', alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  ocrButton: {
    height: 48,
    borderRadius: 10,
    backgroundColor: '#ecfeff',
    borderWidth: 1,
    borderColor: '#67e8f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  ocrButtonText: { color: '#0f766e', fontWeight: '700' },
});
