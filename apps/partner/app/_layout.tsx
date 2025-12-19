import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@shared/hooks';
import { setAuthToken } from '@shared/api';
import { Loading, colors } from '@shared/components';

export default function RootLayout() {
  const { isLoading, token } = useAuth();

  useEffect(() => {
    if (token) {
      setAuthToken(token);
    }
  }, [token]);

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '600' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="bookings/[id]"
          options={{ title: 'Booking Details', presentation: 'card' }}
        />
        <Stack.Screen
          name="resources/drivers"
          options={{ title: 'Drivers' }}
        />
        <Stack.Screen
          name="resources/vehicles"
          options={{ title: 'Vehicles' }}
        />
      </Stack>
    </>
  );
}
