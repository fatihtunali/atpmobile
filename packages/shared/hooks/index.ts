import { useEffect, useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { useAuthStore, useLocationStore } from '@shared/stores';
import { setAuthToken, commonApi } from '@shared/api';

// ============================================
// useAuth Hook
// ============================================

export function useAuth() {
  const {
    isAuthenticated,
    isLoading,
    token,
    customer,
    driver,
    partner,
    setCustomer,
    setDriver,
    setPartner,
    setLoading,
    logout: storeLogout,
  } = useAuthStore();

  // Load stored token on mount
  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('authToken');
        const userType = await SecureStore.getItemAsync('userType');
        const userData = await SecureStore.getItemAsync('userData');

        if (storedToken && userType && userData) {
          setAuthToken(storedToken);
          const user = JSON.parse(userData);

          switch (userType) {
            case 'customer':
              setCustomer(user, storedToken);
              break;
            case 'driver':
              setDriver(user, storedToken);
              break;
            case 'partner':
              setPartner(user, storedToken);
              break;
          }
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to load auth token:', error);
        setLoading(false);
      }
    };

    loadToken();
  }, []);

  const saveAuth = async (
    userType: 'customer' | 'driver' | 'partner',
    user: unknown,
    authToken: string
  ) => {
    await SecureStore.setItemAsync('authToken', authToken);
    await SecureStore.setItemAsync('userType', userType);
    await SecureStore.setItemAsync('userData', JSON.stringify(user));
    setAuthToken(authToken);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('authToken');
    await SecureStore.deleteItemAsync('userType');
    await SecureStore.deleteItemAsync('userData');
    setAuthToken(null);
    storeLogout();
  };

  return {
    isAuthenticated,
    isLoading,
    token,
    customer,
    driver,
    partner,
    saveAuth,
    logout,
  };
}

// ============================================
// useLocation Hook
// ============================================

export function useLocation() {
  const { currentLocation, heading, isTracking, setLocation, setHeading, setTracking } =
    useLocationStore();
  const [permissionStatus, setPermissionStatus] = useState<Location.PermissionStatus | null>(null);

  const requestPermission = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setPermissionStatus(status);
    return status === 'granted';
  }, []);

  const getCurrentLocation = useCallback(async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return null;

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const coords = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };

    setLocation(coords);
    if (location.coords.heading) {
      setHeading(location.coords.heading);
    }

    return coords;
  }, [requestPermission, setLocation, setHeading]);

  const startTracking = useCallback(async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    setTracking(true);

    await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: 10, // Update every 10 meters
        timeInterval: 5000, // Or every 5 seconds
      },
      (location) => {
        setLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        if (location.coords.heading) {
          setHeading(location.coords.heading);
        }
      }
    );
  }, [requestPermission, setLocation, setHeading, setTracking]);

  const stopTracking = useCallback(() => {
    setTracking(false);
  }, [setTracking]);

  return {
    currentLocation,
    heading,
    isTracking,
    permissionStatus,
    requestPermission,
    getCurrentLocation,
    startTracking,
    stopTracking,
  };
}

// ============================================
// usePushNotifications Hook
// ============================================

export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);

  useEffect(() => {
    registerForPushNotifications();

    // Handle notifications received while app is foregrounded
    const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });

    // Handle notifications when user taps on them
    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      // Handle navigation based on notification data
      console.log('Notification tapped:', data);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  const registerForPushNotifications = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Push notification permission not granted');
      return;
    }

    const token = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    });

    setExpoPushToken(token.data);

    // Register token with backend
    const platform = (await import('react-native')).Platform.OS as 'ios' | 'android';
    await commonApi.registerPushToken(token.data, platform);
  };

  return {
    expoPushToken,
    notification,
  };
}

// ============================================
// useDebounce Hook
// ============================================

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ============================================
// useRefresh Hook
// ============================================

export function useRefresh(callback: () => Promise<void>) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await callback();
    } finally {
      setRefreshing(false);
    }
  }, [callback]);

  return { refreshing, onRefresh };
}
