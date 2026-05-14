import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { User } from '../types/domain';

type Props = {
  user: User;
  onOpenAdd: () => void;
  onOpenHistory: () => void;
  onLogout: () => void;
};

export default function DashboardScreen({ user, onOpenAdd, onOpenHistory, onLogout }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {user.name}</Text>
      <Text style={styles.subtitle}>Laundry operations MVP</Text>

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
