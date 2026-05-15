import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AxiosError } from 'axios';
import { login } from '../services/api/authService';
import { User } from '../types/domain';

type Props = {
  onLoginSuccess: (user: User) => void;
};

export default function LoginScreen({ onLoginSuccess }: Props) {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Data belum lengkap', 'Isi email dan password terlebih dahulu.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      onLoginSuccess(user);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message =
        axiosError.response?.data?.message ??
        (axiosError.request
          ? 'Tidak bisa terhubung ke server. Cek koneksi atau nyalakan backend.'
          : 'Periksa email dan password.');
      Alert.alert('Login gagal', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>L-Note Login</Text>
      <TextInput value={email} onChangeText={setEmail} style={styles.input} placeholder="Email" autoCapitalize="none" />
      <TextInput value={password} onChangeText={setPassword} style={styles.input} placeholder="Password" secureTextEntry />
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Masuk...' : 'Masuk'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 20, color: '#0f172a' },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 12, marginBottom: 12 },
  button: { height: 52, borderRadius: 10, backgroundColor: '#0f766e', alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#fff', fontWeight: '700' },
});
