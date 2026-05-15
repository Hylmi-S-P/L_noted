import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { saveDeviceToken } from '../api/integrationService';

export type PushRegistrationResult = {
  ok: boolean;
  message: string;
};

export async function registerDeviceForPushNotifications(): Promise<PushRegistrationResult> {
  try {
    if (!Device.isDevice) {
      return {
        ok: false,
        message: 'Notifikasi perlu dicoba di HP asli.',
      };
    }

    if (Platform.OS !== 'android') {
      return {
        ok: false,
        message: 'Notifikasi produksi saat ini disiapkan untuk Android.',
      };
    }

    const executionEnvironment = String(Constants.executionEnvironment ?? '');
    if (executionEnvironment.toLowerCase().includes('storeclient')) {
      return {
        ok: false,
        message: 'Expo Go belum bisa menerima push notification Android. Gunakan development build.',
      };
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'L-Note',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#0d7377',
      });
    }

    const existing = await Notifications.getPermissionsAsync();
    let finalStatus = existing.status;

    if (existing.status !== 'granted') {
      const requested = await Notifications.requestPermissionsAsync();
      finalStatus = requested.status;
    }

    if (finalStatus !== 'granted') {
      return {
        ok: false,
        message: 'Izin notifikasi belum diberikan.',
      };
    }

    const token = await Notifications.getDevicePushTokenAsync();
    const tokenValue = String(token.data ?? '');

    if (tokenValue.length < 20) {
      return {
        ok: false,
        message: 'Token perangkat belum tersedia.',
      };
    }

    await saveDeviceToken(tokenValue);

    return {
      ok: true,
      message: 'Perangkat ini sudah terdaftar untuk notifikasi.',
    };
  } catch {
    return {
      ok: false,
      message: 'Perangkat belum bisa didaftarkan. Coba lagi dari development build.',
    };
  }
}
