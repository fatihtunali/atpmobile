import { Stack } from 'expo-router';
import { colors } from '@shared/components';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          title: 'Driver Login',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
