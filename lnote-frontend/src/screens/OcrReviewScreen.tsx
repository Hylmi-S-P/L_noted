import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { scanReceiptImage } from '../services/api/transactionService';

type Props = {
  route: {
    params: {
      imageUri: string;
    };
  };
  navigation: {
    navigate: (screen: 'AddTransaction', params?: { ocrTotal?: number | null; ocrRawText?: string }) => void;
    goBack: () => void;
  };
};

export default function OcrReviewScreen({ route, navigation }: Props) {
  const { imageUri } = route.params;
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<{
    total_price: number | null;
    raw_text: string;
    confidence: number;
  } | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const data = await scanReceiptImage(imageUri);
        setResult({
          total_price: data.total_price,
          raw_text: data.raw_text,
          confidence: data.confidence,
        });
      } catch {
        Alert.alert('OCR failed', 'Unable to scan receipt. Try another image.');
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [imageUri]);

  const useResult = () => {
    navigation.navigate('AddTransaction', {
      ocrTotal: result?.total_price ?? null,
      ocrRawText: result?.raw_text ?? '',
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>OCR Review</Text>
      <Image source={{ uri: imageUri }} style={styles.preview} />

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <View style={styles.card}>
          <Text style={styles.label}>Detected Total</Text>
          <Text style={styles.value}>
            {result?.total_price ? `Rp ${result.total_price.toLocaleString()}` : 'Not detected'}
          </Text>
          <Text style={styles.meta}>Confidence: {(result?.confidence ?? 0).toFixed(2)}</Text>
          <Text style={styles.label}>Raw OCR Text</Text>
          <Text style={styles.rawText}>{result?.raw_text?.trim() || '-'}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={useResult} disabled={loading}>
        <Text style={styles.buttonText}>Use Result</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
  preview: { width: '100%', height: 260, borderRadius: 12, backgroundColor: '#e2e8f0' },
  card: { marginTop: 16, backgroundColor: '#f8fafc', borderRadius: 12, padding: 12 },
  label: { fontWeight: '700', marginTop: 8, color: '#334155' },
  value: { fontSize: 20, color: '#0f766e', marginTop: 4 },
  meta: { marginTop: 4, color: '#64748b' },
  rawText: { marginTop: 6, color: '#1e293b' },
  button: {
    marginTop: 16,
    height: 52,
    borderRadius: 10,
    backgroundColor: '#0f766e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '700' },
});
