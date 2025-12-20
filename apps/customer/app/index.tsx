import { useEffect, useState } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';
import { Redirect } from 'expo-router';
import { colors } from '@shared/components';
import { scale } from '@shared/utils/responsive';

export default function SplashScreen() {
  const [isReady, setIsReady] = useState(false);
  const fadeAnim = new Animated.Value(1);

  useEffect(() => {
    // Show splash for 1.5 seconds then fade out
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIsReady(true);
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isReady) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Image
        source={require('../assets/icon.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  logo: {
    width: scale(150),
    height: scale(150),
  },
});
