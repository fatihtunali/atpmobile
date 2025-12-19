import { Redirect } from 'expo-router';
import { useAuth } from '@shared/hooks';
import { Loading } from '@shared/components';

export default function Index() {
  const { isAuthenticated, isLoading, driver } = useAuth();

  if (isLoading) {
    return <Loading fullScreen />;
  }

  // Driver app requires authentication
  if (!isAuthenticated || !driver) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)" />;
}
