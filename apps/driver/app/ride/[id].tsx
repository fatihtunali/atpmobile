import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Loading, Badge, colors, spacing } from '@shared/components';
import { driverApi } from '@shared/api';
import {
  formatDate,
  formatTime,
  formatCurrency,
  getBookingStatusLabel,
  getBookingStatusColor,
} from '@shared/utils';
import type { DriverRide } from '@shared/types';

export default function RideDetailsScreen() {
  const params = useLocalSearchParams();
  const rideId = Number(params.id);

  const [ride, setRide] = useState<DriverRide | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchRide();
  }, [rideId]);

  const fetchRide = async () => {
    try {
      const response = await driverApi.getRide(rideId);
      if (response.success && response.data) {
        setRide(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch ride:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (action: string) => {
    if (!ride) return;

    setActionLoading(true);
    try {
      const response = await driverApi.updateRideStatus(ride.id, action as any);
      if (response.success) {
        if (action === 'START_RIDE') {
          router.replace('/ride/active');
        } else {
          fetchRide();
        }
      } else {
        Alert.alert('Error', response.error || 'Failed to update status');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCall = () => {
    if (ride?.customerPhone) {
      Linking.openURL(`tel:${ride.customerPhone}`);
    }
  };

  const handleNavigate = () => {
    if (ride?.pickupLocation) {
      const { latitude, longitude } = ride.pickupLocation;
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

  if (!ride) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.textMuted} />
        <Text style={styles.errorText}>Ride not found</Text>
        <Button title="Go Back" onPress={() => router.back()} variant="outline" />
      </View>
    );
  }

  const renderActionButton = () => {
    switch (ride.status) {
      case 'CONFIRMED':
        return (
          <Button
            title="Accept Ride"
            onPress={() => handleStatusUpdate('ACCEPT')}
            loading={actionLoading}
            fullWidth
            size="lg"
          />
        );
      case 'DRIVER_ASSIGNED':
        return (
          <Button
            title="Start Trip to Pickup"
            onPress={() => handleStatusUpdate('ON_THE_WAY')}
            loading={actionLoading}
            fullWidth
            size="lg"
            icon={<Ionicons name="navigate" size={20} color="#fff" />}
          />
        );
      case 'ON_THE_WAY':
        return (
          <Button
            title="I've Arrived"
            onPress={() => handleStatusUpdate('ARRIVED')}
            loading={actionLoading}
            fullWidth
            size="lg"
            icon={<Ionicons name="location" size={20} color="#fff" />}
          />
        );
      case 'ARRIVED':
        return (
          <Button
            title="Start Ride"
            onPress={() => handleStatusUpdate('START_RIDE')}
            loading={actionLoading}
            fullWidth
            size="lg"
            icon={<Ionicons name="car" size={20} color="#fff" />}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Status Header */}
      <View style={styles.statusHeader}>
        <Badge
          label={getBookingStatusLabel(ride.status)}
          variant={ride.status === 'COMPLETED' ? 'success' : 'info'}
        />
        <Text style={styles.bookingCode}>#{ride.bookingCode}</Text>
      </View>

      {/* Customer Info */}
      <Card style={styles.customerCard}>
        <View style={styles.customerHeader}>
          <View style={styles.customerAvatar}>
            <Ionicons name="person" size={32} color={colors.primary} />
          </View>
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{ride.customerName}</Text>
            <Text style={styles.customerPhone}>{ride.customerPhone}</Text>
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

        <View style={styles.tripMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="people" size={18} color={colors.textMuted} />
            <Text style={styles.metaText}>{ride.passengers} passengers</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="briefcase" size={18} color={colors.textMuted} />
            <Text style={styles.metaText}>{ride.luggage} bags</Text>
          </View>
        </View>
      </Card>

      {/* Route Details */}
      <Card style={styles.routeCard}>
        <Text style={styles.sectionTitle}>Route Details</Text>

        <View style={styles.routeContainer}>
          <View style={styles.routePoint}>
            <View style={styles.routeDot} />
            <View style={styles.routeTextContainer}>
              <Text style={styles.routeLabel}>Pickup</Text>
              <Text style={styles.routeAddress}>{ride.pickupLocation.name}</Text>
              <Text style={styles.routeSubAddress}>{ride.pickupLocation.address}</Text>
            </View>
          </View>

          <View style={styles.routeLine} />

          <View style={styles.routePoint}>
            <View style={[styles.routeDot, styles.routeDotDest]} />
            <View style={styles.routeTextContainer}>
              <Text style={styles.routeLabel}>Dropoff</Text>
              <Text style={styles.routeAddress}>{ride.dropoffLocation.name}</Text>
              <Text style={styles.routeSubAddress}>{ride.dropoffLocation.address}</Text>
            </View>
          </View>
        </View>

        <View style={styles.dateTimeRow}>
          <View style={styles.dateTime}>
            <Ionicons name="calendar" size={18} color={colors.primary} />
            <Text style={styles.dateTimeText}>{formatDate(ride.pickupDate)}</Text>
          </View>
          <View style={styles.dateTime}>
            <Ionicons name="time" size={18} color={colors.primary} />
            <Text style={styles.dateTimeText}>{formatTime(ride.pickupTime)}</Text>
          </View>
        </View>

        {ride.flightNumber && (
          <View style={styles.flightRow}>
            <Ionicons name="airplane" size={18} color={colors.textMuted} />
            <Text style={styles.flightText}>Flight: {ride.flightNumber}</Text>
          </View>
        )}
      </Card>

      {/* Earnings */}
      <Card style={styles.earningsCard}>
        <View style={styles.earningsRow}>
          <View>
            <Text style={styles.earningsLabel}>Your Earnings</Text>
            <Text style={styles.earningsNote}>After platform fees</Text>
          </View>
          <Text style={styles.earningsAmount}>
            {formatCurrency(ride.driverEarnings, ride.currency)}
          </Text>
        </View>
      </Card>

      {/* Notes */}
      {ride.notes && (
        <Card style={styles.notesCard}>
          <Text style={styles.sectionTitle}>Special Requests</Text>
          <Text style={styles.notesText}>{ride.notes}</Text>
        </Card>
      )}

      {/* Navigate Button */}
      {['DRIVER_ASSIGNED', 'ON_THE_WAY'].includes(ride.status) && (
        <View style={styles.navigateContainer}>
          <Button
            title="Navigate to Pickup"
            onPress={handleNavigate}
            variant="outline"
            fullWidth
            size="md"
            icon={<Ionicons name="navigate" size={20} color={colors.primary} />}
          />
        </View>
      )}

      {/* Action Button */}
      <View style={styles.actionContainer}>
        {renderActionButton()}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  bookingCode: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  customerCard: {
    margin: spacing.md,
    marginBottom: 0,
    padding: spacing.md,
  },
  customerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  customerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  customerPhone: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  callButton: {
    width: 48,
    paddingHorizontal: 0,
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
  routeCard: {
    margin: spacing.md,
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
    height: 32,
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
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  routeSubAddress: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  dateTimeRow: {
    flexDirection: 'row',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  dateTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  dateTimeText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  flightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  flightText: {
    marginLeft: 6,
    fontSize: 14,
    color: colors.textSecondary,
  },
  earningsCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  earningsLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  earningsNote: {
    fontSize: 12,
    color: colors.textMuted,
  },
  earningsAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.success,
  },
  notesCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  notesText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  navigateContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  actionContainer: {
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
