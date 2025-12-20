import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Share,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Loading, Badge, colors, spacing } from '@shared/components';
import { customerApi } from '@shared/api';
import { formatCurrency, formatDate, formatTime, getBookingStatusLabel } from '@shared/utils';
import { scale, verticalScale, scaleFontSize } from '@shared/utils/responsive';
import type { Booking } from '@shared/types';

export default function ConfirmationScreen() {
  const params = useLocalSearchParams();
  const bookingCode = params.bookingCode as string;
  const customerEmail = params.email as string;
  const customerName = params.name as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooking();
  }, [bookingCode]);

  const fetchBooking = async () => {
    if (!bookingCode || !customerEmail) return;

    try {
      const response = await customerApi.getBooking(bookingCode, customerEmail);
      if (response.success && response.data) {
        setBooking(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `My airport transfer booking: ${bookingCode}\nTrack it at: https://airporttransferportal.com/track/${bookingCode}`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleTrack = () => {
    router.push({
      pathname: '/tracking/[code]',
      params: { code: bookingCode },
    });
  };

  const handleDone = () => {
    router.replace('/(tabs)');
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Success Header */}
      <View style={styles.successHeader}>
        <View style={styles.checkCircle}>
          <Ionicons name="checkmark" size={48} color="#fff" />
        </View>
        <Text style={styles.successTitle}>Booking Confirmed!</Text>
        <Text style={styles.bookingCode}>#{bookingCode}</Text>
      </View>

      {/* Booking Details */}
      <Card style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>Booking Details</Text>

        {booking && (
          <>
            <View style={styles.statusRow}>
              <Text style={styles.label}>Status</Text>
              <Badge
                label={getBookingStatusLabel(booking.status)}
                variant="success"
              />
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Pickup</Text>
              <Text style={styles.value}>{booking.pickupLocation.name}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Dropoff</Text>
              <Text style={styles.value}>{booking.dropoffLocation.name}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Date</Text>
              <Text style={styles.value}>{formatDate(booking.pickupDate)}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Time</Text>
              <Text style={styles.value}>{formatTime(booking.pickupTime)}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Vehicle</Text>
              <Text style={styles.value}>{booking.vehicleType}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Passengers</Text>
              <Text style={styles.value}>{booking.passengers}</Text>
            </View>

            {booking.flightNumber && (
              <View style={styles.row}>
                <Text style={styles.label}>Flight</Text>
                <Text style={styles.value}>{booking.flightNumber}</Text>
              </View>
            )}

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(booking.price, booking.currency)}
              </Text>
            </View>
          </>
        )}
      </Card>

      {/* What's Next */}
      <Card style={styles.nextCard}>
        <Text style={styles.sectionTitle}>What's Next?</Text>

        <View style={styles.nextItem}>
          <View style={styles.nextIcon}>
            <Ionicons name="mail" size={20} color={colors.primary} />
          </View>
          <View style={styles.nextContent}>
            <Text style={styles.nextTitle}>Confirmation Email</Text>
            <Text style={styles.nextText}>
              You'll receive a confirmation email with all the details
            </Text>
          </View>
        </View>

        <View style={styles.nextItem}>
          <View style={styles.nextIcon}>
            <Ionicons name="person" size={20} color={colors.primary} />
          </View>
          <View style={styles.nextContent}>
            <Text style={styles.nextTitle}>Driver Assignment</Text>
            <Text style={styles.nextText}>
              A driver will be assigned before your pickup time
            </Text>
          </View>
        </View>

        <View style={styles.nextItem}>
          <View style={styles.nextIcon}>
            <Ionicons name="navigate" size={20} color={colors.primary} />
          </View>
          <View style={styles.nextContent}>
            <Text style={styles.nextTitle}>Track Your Ride</Text>
            <Text style={styles.nextText}>
              Use the tracking feature to see your driver's location
            </Text>
          </View>
        </View>
      </Card>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          title="Track Booking"
          onPress={handleTrack}
          fullWidth
          size="lg"
        />
        <View style={styles.buttonRow}>
          <Button
            title="Share"
            onPress={handleShare}
            variant="outline"
            style={styles.halfButton}
            icon={<Ionicons name="share-outline" size={20} color={colors.primary} />}
          />
          <Button
            title="Done"
            onPress={handleDone}
            variant="ghost"
            style={styles.halfButton}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  successHeader: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.surface,
  },
  checkCircle: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  successTitle: {
    fontSize: scaleFontSize(24),
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  bookingCode: {
    fontSize: scaleFontSize(16),
    color: colors.primary,
    fontWeight: '600',
  },
  detailsCard: {
    margin: spacing.md,
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: scaleFontSize(16),
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: scaleFontSize(14),
    color: colors.textSecondary,
  },
  value: {
    fontSize: scaleFontSize(14),
    color: colors.text,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginLeft: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: scaleFontSize(18),
    fontWeight: '600',
    color: colors.text,
  },
  totalValue: {
    fontSize: scaleFontSize(24),
    fontWeight: '700',
    color: colors.primary,
  },
  nextCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  nextItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  nextIcon: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  nextContent: {
    flex: 1,
  },
  nextTitle: {
    fontSize: scaleFontSize(14),
    fontWeight: '600',
    color: colors.text,
    marginBottom: scale(2),
  },
  nextText: {
    fontSize: scaleFontSize(13),
    color: colors.textSecondary,
  },
  buttonContainer: {
    padding: spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  halfButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
});
