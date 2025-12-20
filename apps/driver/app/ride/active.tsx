import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Linking,
  Platform,
  Alert,
  AppState,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Button, Card, Loading, colors, spacing } from '@shared/components';
import { driverApi } from '@shared/api';
import { useDriverRidesStore, useLocationStore } from '@shared/stores';
import { formatDuration } from '@shared/utils';
import { scale, verticalScale, scaleFontSize } from '@shared/utils/responsive';

export default function ActiveRideScreen() {
  const { activeRide, setActiveRide } = useDriverRidesStore();
  const { setLocation, setTracking } = useLocationStore();

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date>(new Date());

  useEffect(() => {
    initializeRide();
    startTimer();

    return () => {
      stopLocationTracking();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        startLocationTracking();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const initializeRide = async () => {
    try {
      // Fetch current active ride
      const response = await driverApi.getRides('today');
      if (response.success && response.data) {
        const active = response.data.rides.find(
          (r) => r.status === 'IN_PROGRESS'
        );
        if (active) {
          setActiveRide(active as any);
          startLocationTracking();
        } else {
          // No active ride, go back
          router.replace('/(tabs)');
        }
      }
    } catch (error) {
      console.error('Failed to fetch ride:', error);
    } finally {
      setLoading(false);
    }
  };

  const startTimer = () => {
    startTimeRef.current = new Date();
    timerRef.current = setInterval(() => {
      const now = new Date();
      const elapsed = Math.floor(
        (now.getTime() - startTimeRef.current.getTime()) / 1000
      );
      setElapsedTime(elapsed);
    }, 1000);
  };

  const startLocationTracking = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for tracking');
        return;
      }

      setTracking(true);

      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000, // Update every 10 seconds
          distanceInterval: 50, // Or every 50 meters
        },
        (location) => {
          const { latitude, longitude, heading, speed, accuracy } = location.coords;
          setLocation({ latitude, longitude });

          // Send location to server
          driverApi.updateLocation(
            latitude,
            longitude,
            heading || undefined,
            speed || undefined,
            accuracy || undefined
          );
        }
      );
    } catch (error) {
      console.error('Location tracking error:', error);
    }
  };

  const stopLocationTracking = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
    setTracking(false);
  };

  const handleCompleteRide = async () => {
    Alert.alert(
      'Complete Ride',
      'Are you sure you want to complete this ride?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            if (!activeRide) return;

            setActionLoading(true);
            try {
              const response = await driverApi.updateRideStatus(
                activeRide.id,
                'COMPLETE'
              );
              if (response.success) {
                stopLocationTracking();
                setActiveRide(null);
                router.replace('/(tabs)');
              } else {
                Alert.alert('Error', response.error || 'Failed to complete ride');
              }
            } catch (error) {
              Alert.alert('Error', 'Something went wrong');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleNavigate = () => {
    if (activeRide?.dropoffLocation) {
      const { latitude, longitude } = activeRide.dropoffLocation;
      const url = Platform.select({
        ios: `maps:?daddr=${latitude},${longitude}`,
        android: `google.navigation:q=${latitude},${longitude}`,
      });
      if (url) Linking.openURL(url);
    }
  };

  const handleCall = () => {
    if (activeRide?.customerPhone) {
      Linking.openURL(`tel:${activeRide.customerPhone}`);
    }
  };

  const formatElapsedTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!activeRide) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No active ride</Text>
        <Button title="Go Back" onPress={() => router.replace('/(tabs)')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Timer Header */}
      <View style={styles.timerHeader}>
        <View style={styles.timerDot} />
        <Text style={styles.timerLabel}>RIDE IN PROGRESS</Text>
        <Text style={styles.timerValue}>{formatElapsedTime(elapsedTime)}</Text>
      </View>

      {/* Customer Info */}
      <Card style={styles.customerCard}>
        <View style={styles.customerRow}>
          <View style={styles.customerAvatar}>
            <Ionicons name="person" size={24} color={colors.primary} />
          </View>
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{activeRide.customerName}</Text>
            <Text style={styles.passengerCount}>
              {activeRide.passengers} passenger(s)
            </Text>
          </View>
          <Button
            title=""
            onPress={handleCall}
            variant="outline"
            size="sm"
            icon={<Ionicons name="call" size={20} color={colors.primary} />}
            style={styles.callButton}
          />
        </View>
      </Card>

      {/* Destination Card */}
      <Card style={styles.destinationCard}>
        <View style={styles.destinationHeader}>
          <View style={styles.destinationIcon}>
            <Ionicons name="flag" size={24} color={colors.secondary} />
          </View>
          <View style={styles.destinationInfo}>
            <Text style={styles.destinationLabel}>DESTINATION</Text>
            <Text style={styles.destinationName}>
              {activeRide.dropoffLocation.name}
            </Text>
            <Text style={styles.destinationAddress}>
              {activeRide.dropoffLocation.address}
            </Text>
          </View>
        </View>

        <Button
          title="Navigate to Destination"
          onPress={handleNavigate}
          variant="outline"
          fullWidth
          size="md"
          icon={<Ionicons name="navigate" size={20} color={colors.primary} />}
        />
      </Card>

      {/* Complete Button */}
      <View style={styles.completeContainer}>
        <Button
          title="Complete Ride"
          onPress={handleCompleteRide}
          loading={actionLoading}
          fullWidth
          size="lg"
          style={styles.completeButton}
        />
        <Text style={styles.completeNote}>
          Press when you've reached the destination
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  timerHeader: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.primary,
  },
  timerDot: {
    width: scale(12),
    height: verticalScale(12),
    borderRadius: scale(6),
    backgroundColor: '#fff',
    marginBottom: spacing.sm,
  },
  timerLabel: {
    fontSize: scaleFontSize(12),
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  timerValue: {
    fontSize: scaleFontSize(48),
    fontWeight: '700',
    color: '#fff',
  },
  customerCard: {
    margin: spacing.md,
    padding: spacing.md,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerAvatar: {
    width: scale(48),
    height: verticalScale(48),
    borderRadius: scale(24),
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  customerName: {
    fontSize: scaleFontSize(16),
    fontWeight: '600',
    color: colors.text,
  },
  passengerCount: {
    fontSize: scaleFontSize(13),
    color: colors.textSecondary,
    marginTop: verticalScale(2),
  },
  callButton: {
    width: scale(48),
    paddingHorizontal: 0,
  },
  destinationCard: {
    marginHorizontal: spacing.md,
    padding: spacing.md,
  },
  destinationHeader: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  destinationIcon: {
    width: scale(48),
    height: verticalScale(48),
    borderRadius: scale(24),
    backgroundColor: `${colors.secondary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  destinationInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  destinationLabel: {
    fontSize: scaleFontSize(11),
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: verticalScale(4),
  },
  destinationName: {
    fontSize: scaleFontSize(16),
    fontWeight: '600',
    color: colors.text,
  },
  destinationAddress: {
    fontSize: scaleFontSize(13),
    color: colors.textSecondary,
    marginTop: verticalScale(2),
  },
  completeContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    paddingBottom: spacing.xl,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  completeButton: {
    backgroundColor: colors.success,
  },
  completeNote: {
    marginTop: spacing.sm,
    fontSize: scaleFontSize(12),
    color: colors.textMuted,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: scaleFontSize(16),
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
});
