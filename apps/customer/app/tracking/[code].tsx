import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Linking,
  Platform,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Loading, Badge, colors, spacing } from '@shared/components';
import { customerApi } from '@shared/api';
import {
  formatDate,
  formatTime,
  getBookingStatusLabel,
  getBookingStatusColor,
} from '@shared/utils';
import type { Booking } from '@shared/types';

export default function TrackingScreen() {
  const params = useLocalSearchParams();
  const code = params.code as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [driverLocation, setDriverLocation] = useState<{
    latitude: number;
    longitude: number;
    updatedAt: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchTracking();

    // Poll for updates every 30 seconds
    intervalRef.current = setInterval(fetchTracking, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [code]);

  const fetchTracking = async () => {
    if (!code) return;

    try {
      const response = await customerApi.trackBooking(code);
      if (response.success && response.data) {
        setBooking(response.data.booking);
        if (response.data.driverLocation) {
          setDriverLocation(response.data.driverLocation);
        }
        setError(null);
      } else {
        setError(response.error || 'Booking not found');
      }
    } catch (err) {
      setError('Failed to fetch tracking info');
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (booking?.driver?.phone) {
      Linking.openURL(`tel:${booking.driver.phone}`);
    }
  };

  const handleMessage = () => {
    if (booking?.driver?.phone) {
      const url = Platform.select({
        ios: `sms:${booking.driver.phone}`,
        android: `sms:${booking.driver.phone}`,
      });
      if (url) Linking.openURL(url);
    }
  };

  const handleNavigate = () => {
    if (booking?.pickupLocation) {
      const { latitude, longitude } = booking.pickupLocation;
      const url = Platform.select({
        ios: `maps:?daddr=${latitude},${longitude}`,
        android: `google.navigation:q=${latitude},${longitude}`,
      });
      if (url) Linking.openURL(url);
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  if (error || !booking) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.textMuted} />
        <Text style={styles.errorText}>{error || 'Booking not found'}</Text>
        <Button title="Try Again" onPress={fetchTracking} variant="outline" />
      </View>
    );
  }

  const getStatusIcon = () => {
    switch (booking.status) {
      case 'PENDING':
      case 'CONFIRMED':
        return 'time-outline';
      case 'DRIVER_ASSIGNED':
        return 'person-outline';
      case 'ON_THE_WAY':
        return 'car-outline';
      case 'ARRIVED':
        return 'location-outline';
      case 'IN_PROGRESS':
        return 'navigate-outline';
      case 'COMPLETED':
        return 'checkmark-circle-outline';
      case 'CANCELLED':
        return 'close-circle-outline';
      default:
        return 'help-outline';
    }
  };

  const getStatusMessage = () => {
    switch (booking.status) {
      case 'PENDING':
        return 'Your booking is being processed';
      case 'CONFIRMED':
        return 'Your booking is confirmed';
      case 'DRIVER_ASSIGNED':
        return 'A driver has been assigned';
      case 'ON_THE_WAY':
        return 'Your driver is on the way';
      case 'ARRIVED':
        return 'Your driver has arrived';
      case 'IN_PROGRESS':
        return 'Your ride is in progress';
      case 'COMPLETED':
        return 'Your ride is complete';
      case 'CANCELLED':
        return 'This booking was cancelled';
      default:
        return '';
    }
  };

  return (
    <View style={styles.container}>
      {/* Status Header */}
      <View style={styles.statusHeader}>
        <View
          style={[
            styles.statusIcon,
            { backgroundColor: `${getBookingStatusColor(booking.status)}20` },
          ]}
        >
          <Ionicons
            name={getStatusIcon() as any}
            size={32}
            color={getBookingStatusColor(booking.status)}
          />
        </View>
        <Text style={styles.statusTitle}>{getBookingStatusLabel(booking.status)}</Text>
        <Text style={styles.statusMessage}>{getStatusMessage()}</Text>
      </View>

      {/* Driver Card (if assigned) */}
      {booking.driver && (
        <Card style={styles.driverCard}>
          <View style={styles.driverHeader}>
            <View style={styles.driverAvatar}>
              <Ionicons name="person" size={32} color={colors.primary} />
            </View>
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>{booking.driver.name}</Text>
              {booking.driver.vehicleMake && (
                <Text style={styles.vehicleInfo}>
                  {booking.driver.vehicleMake} {booking.driver.vehicleModel}
                </Text>
              )}
              {booking.driver.vehiclePlate && (
                <Badge label={booking.driver.vehiclePlate} variant="default" size="sm" />
              )}
            </View>
          </View>

          <View style={styles.driverActions}>
            <Button
              title="Call"
              onPress={handleCall}
              variant="outline"
              size="sm"
              icon={<Ionicons name="call" size={18} color={colors.primary} />}
              style={styles.actionButton}
            />
            <Button
              title="Message"
              onPress={handleMessage}
              variant="outline"
              size="sm"
              icon={<Ionicons name="chatbubble" size={18} color={colors.primary} />}
              style={styles.actionButton}
            />
          </View>
        </Card>
      )}

      {/* Trip Details */}
      <Card style={styles.tripCard}>
        <Text style={styles.sectionTitle}>Trip Details</Text>

        <View style={styles.routeContainer}>
          <View style={styles.routePoint}>
            <View style={styles.routeDot} />
            <View style={styles.routeTextContainer}>
              <Text style={styles.routeLabel}>Pickup</Text>
              <Text style={styles.routeAddress}>{booking.pickupLocation.name}</Text>
            </View>
          </View>

          <View style={styles.routeLine} />

          <View style={styles.routePoint}>
            <View style={[styles.routeDot, styles.routeDotDest]} />
            <View style={styles.routeTextContainer}>
              <Text style={styles.routeLabel}>Dropoff</Text>
              <Text style={styles.routeAddress}>{booking.dropoffLocation.name}</Text>
            </View>
          </View>
        </View>

        <View style={styles.tripMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar" size={18} color={colors.textMuted} />
            <Text style={styles.metaText}>{formatDate(booking.pickupDate)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time" size={18} color={colors.textMuted} />
            <Text style={styles.metaText}>{formatTime(booking.pickupTime)}</Text>
          </View>
        </View>
      </Card>

      {/* Booking Code */}
      <View style={styles.codeContainer}>
        <Text style={styles.codeLabel}>Booking Reference</Text>
        <Text style={styles.codeValue}>{booking.publicCode}</Text>
      </View>

      {/* Navigate Button */}
      {['ON_THE_WAY', 'ARRIVED'].includes(booking.status) && (
        <View style={styles.navigateContainer}>
          <Button
            title="Navigate to Pickup"
            onPress={handleNavigate}
            fullWidth
            size="lg"
            icon={<Ionicons name="navigate" size={20} color="#fff" />}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  statusHeader: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.surface,
  },
  statusIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  statusMessage: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  driverCard: {
    margin: spacing.md,
    padding: spacing.md,
  },
  driverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  driverAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  vehicleInfo: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  driverActions: {
    flexDirection: 'row',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  tripCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  routeContainer: {
    marginBottom: spacing.md,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    marginTop: 4,
  },
  routeDotDest: {
    backgroundColor: colors.secondary,
  },
  routeLine: {
    width: 2,
    height: 24,
    backgroundColor: colors.border,
    marginLeft: 5,
    marginVertical: 4,
  },
  routeTextContainer: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  routeLabel: {
    fontSize: 11,
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  routeAddress: {
    fontSize: 14,
    color: colors.text,
  },
  tripMeta: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  metaText: {
    marginLeft: 6,
    fontSize: 14,
    color: colors.textSecondary,
  },
  codeContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  codeLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
  },
  codeValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
  },
  navigateContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
});
