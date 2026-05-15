import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, BackHandler, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AddTransactionScreen from './src/screens/AddTransactionScreen';
import CustomerManagementScreen from './src/screens/CustomerManagementScreen';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ReportScreen from './src/screens/ReportScreen';
import ServiceManagementScreen from './src/screens/ServiceManagementScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import TransactionDetailScreen from './src/screens/TransactionDetailScreen';
import { features } from './src/config/features';
import { me, logout } from './src/services/api/authService';
import { setUnauthorizedHandler } from './src/services/api/client';
import { User } from './src/types/domain';

type Screen = 'dashboard' | 'add' | 'history' | 'detail' | 'reports' | 'settings' | 'customers' | 'services';

export default function App() {
  const [booting, setBooting] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [screen, setScreen] = useState<Screen>('dashboard');
  const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);
  const [historyStack, setHistoryStack] = useState<Screen[]>(['dashboard']);

  const navigateTo = (next: Screen) => {
    setHistoryStack((prev) => [...prev, next]);
    setScreen(next);
  };

  const registerPushQuietly = (currentUser: User) => {
    if (!currentUser || !features.pushNotifications) return;
    void import('./src/services/notification/pushRegistration').then(({ registerDeviceForPushNotifications }) => {
      void registerDeviceForPushNotifications();
    });
  };

  const resetToDashboard = () => {
    setSelectedTransactionId(null);
    setScreen('dashboard');
    setHistoryStack(['dashboard']);
  };

  const resetToHistory = () => {
    setSelectedTransactionId(null);
    setScreen('history');
    setHistoryStack(['dashboard', 'history']);
  };

  const goBack = () => {
    setHistoryStack((prev) => {
      if (prev.length <= 1) {
        setScreen('dashboard');
        return ['dashboard'];
      }
      const nextStack = prev.slice(0, -1);
      setScreen(nextStack[nextStack.length - 1]);
      return nextStack;
    });
  };

  useEffect(() => {
    const boot = async () => {
      try {
        const currentUser = await me();
        setUser(currentUser);
        registerPushQuietly(currentUser);
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

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!user) {
        return false;
      }

      if (screen !== 'dashboard') {
        goBack();
        return true;
      }

      return false;
    });

    return () => sub.remove();
  }, [screen, user]);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      setUser(null);
      setScreen('dashboard');
      setSelectedTransactionId(null);
      setHistoryStack(['dashboard']);
    }
  };

  const handleLoginSuccess = (currentUser: User) => {
    setUser(currentUser);
    registerPushQuietly(currentUser);
  };

  if (booting) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!user) {
    return (
      <SafeAreaProvider>
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
        <StatusBar style="auto" />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      {screen === 'dashboard' ? (
        <DashboardScreen
          user={user}
          onOpenAdd={() => navigateTo('add')}
          onOpenHistory={() => navigateTo('history')}
          onOpenReports={() => navigateTo('reports')}
          onOpenSettings={() => navigateTo('settings')}
          onLogout={handleLogout}
        />
      ) : null}
      {screen === 'add' ? (
        <AddTransactionScreen navigation={{ goBack }} />
      ) : null}
      {screen === 'history' ? (
        <HistoryScreen
          goBack={goBack}
          onOpenDashboard={resetToDashboard}
          onOpenReports={() => navigateTo('reports')}
          onOpenSettings={() => navigateTo('settings')}
          onOpenDetail={(id) => {
            setSelectedTransactionId(id);
            navigateTo('detail');
          }}
        />
      ) : null}
      {screen === 'detail' && selectedTransactionId ? (
        <TransactionDetailScreen transactionId={selectedTransactionId} goBack={goBack} />
      ) : null}
      {screen === 'reports' ? (
        <ReportScreen
          goBack={goBack}
          onOpenDashboard={resetToDashboard}
          onOpenHistory={resetToHistory}
          onOpenSettings={() => navigateTo('settings')}
        />
      ) : null}
      {screen === 'settings' ? (
        <SettingsScreen
          user={user}
          onOpenDashboard={resetToDashboard}
          onOpenHistory={resetToHistory}
          onOpenReports={() => navigateTo('reports')}
          onOpenCustomers={() => navigateTo('customers')}
          onOpenServices={() => navigateTo('services')}
          onLogout={handleLogout}
        />
      ) : null}
      {screen === 'customers' ? (
        <CustomerManagementScreen goBack={goBack} />
      ) : null}
      {screen === 'services' ? (
        <ServiceManagementScreen goBack={goBack} />
      ) : null}
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafa',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
});
