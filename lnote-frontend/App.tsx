import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AddTransactionScreen from './src/screens/AddTransactionScreen';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import TransactionDetailScreen from './src/screens/TransactionDetailScreen';
import { me, logout } from './src/services/api/authService';
import { setUnauthorizedHandler } from './src/services/api/client';
import { User } from './src/types/domain';

type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  AddTransaction: undefined;
  History: undefined;
  TransactionDetail: { id: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [booting, setBooting] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const boot = async () => {
      try {
        const currentUser = await me();
        setUser(currentUser);
      } catch {
        setUser(null);
      } finally {
        setBooting(false);
      }
    };

    setUnauthorizedHandler(() => setUser(null));
    void boot();

    return () => setUnauthorizedHandler(null);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      setUser(null);
    }
  };

  if (booting) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? (
        <Stack.Navigator>
          <Stack.Screen name="Dashboard">
            {({ navigation }) => (
              <DashboardScreen
                user={user}
                onOpenAdd={() => navigation.navigate('AddTransaction')}
                onOpenHistory={() => navigation.navigate('History')}
                onLogout={handleLogout}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="AddTransaction" component={AddTransactionScreen} options={{ title: 'Add Transaction' }} />
          <Stack.Screen name="History">
            {({ navigation }) => (
              <HistoryScreen onOpenDetail={(id) => navigation.navigate('TransactionDetail', { id })} />
            )}
          </Stack.Screen>
          <Stack.Screen name="TransactionDetail" options={{ title: 'Transaction Detail' }}>
            {({ route }) => <TransactionDetailScreen transactionId={route.params.id} />}
          </Stack.Screen>
        </Stack.Navigator>
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login">
            {() => <LoginScreen onLoginSuccess={setUser} />}
          </Stack.Screen>
        </Stack.Navigator>
      )}
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
});
