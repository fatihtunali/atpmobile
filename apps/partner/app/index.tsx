import { Redirect } from 'expo-router';
import { useAuth } from '@shared/hooks';
import { Loading } from '@shared/components';

export default function Index() {
  const { isAuthenticated, isLoading, partner } = useAuth();

  if (isLoading) {
    return <Loading fullScreen />;
  }

  // Partner app requires authentication
  if (!isAuthenticated || !partner) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)" />;
}
