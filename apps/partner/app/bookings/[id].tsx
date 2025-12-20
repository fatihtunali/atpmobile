import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Badge, Button, Loading, Divider, colors, spacing } from '@shared/components';
import { partnerApi } from '@shared/api';
import { formatCurrency, formatDate, getBookingStatusLabel, openMapsNavigation, scale, verticalScale, scaleFontSize } from '@shared/utils';
import { useAuthStore } from '@shared/stores';
import type { Booking } from '@shared/types';

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { partner } = useAuthStore();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  const isSupplier = partner?.type === 'supplier';

  useEffect(() => {
    loadBooking();
  }, [id]);

  const loadBooking = async () => {
    if (!id) return;
    const response = await partnerApi.getBookingDetails(parseInt(id));
    if (response.success && response.data) {
      setBooking(response.data);
    }
    setLoading(false);
  };

  const handleCallCustomer = () => {
    if (booking?.customerPhone) {
      Linking.openURL(`tel:${booking.customerPhone}`);
    }
  };

  const handleEmailCustomer = () => {
    if (booking?.customerEmail) {
      Linking.openURL(`mailto:${booking.customerEmail}`);
    }
  };

  const handleNavigate = (type: 'pickup' | 'dropoff') => {
    if (!booking) return;
    const location = type === 'pickup' ? booking.pickupLocation : booking.dropoffLocation;
    if (location.latitude && location.longitude) {
      openMapsNavigation(location.latitude, location.longitude, location.name);
    }
  };

  const handleAssignDriver = () => {
    router.push(`/assign-driver/${id}`);
  };

  const handleUpdateStatus = async (newStatus: string) => {
    Alert.alert(
      'Update Status',
      `Are you sure you want to mark this booking as ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            const response = await partnerApi.updateBookingStatus(
              parseInt(id!),
              newStatus
            );
            if (response.success) {
              loadBooking();
            } else {
              Alert.alert('Error', response.error || 'Failed to update status');
            }
          },
        },
      ]
    );
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      case 'CONFIRMED':
      case 'DRIVER_ASSIGNED':
        return 'info';
      default:
        return 'warning';
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!booking) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={60} color={colors.error} />
        <Text style={styles.errorText}>Booking not found</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Status Header */}
      <View style={styles.statusHeader}>
        <Badge
          label={getBookingStatusLabel(booking.status)}
          variant={getStatusVariant(booking.status)}
          size="lg"
        />
        <Text style={styles.bookingCode}>{booking.publicCode}</Text>
      </View>

      {/* Route Card */}
      <Card style={styles.routeCard}>
        <View style={styles.routePoint}>
          <View style={[styles.dot, { backgroundColor: colors.success }]} />
          <View style={styles.routeInfo}>
            <Text style={styles.routeLabel}>Pickup</Text>
            <Text style={styles.routeAddress}>{booking.pickupLocation.name}</Text>
          </View>
          <Button
            title="Navigate"
            variant="outline"
            size="sm"
            onPress={() => handleNavigate('pickup')}
            icon={<Ionicons name="navigate" size={16} color={colors.primary} />}
          />
        </View>

        <View style={styles.routeLine} />

        <View style={styles.routePoint}>
          <View style={[styles.dot, { backgroundColor: colors.error }]} />
          <View style={styles.routeInfo}>
            <Text style={styles.routeLabel}>Dropoff</Text>
            <Text style={styles.routeAddress}>{booking.dropoffLocation.name}</Text>
          </View>
          <Button
            title="Navigate"
            variant="outline"
            size="sm"
            onPress={() => handleNavigate('dropoff')}
            icon={<Ionicons name="navigate" size={16} color={colors.primary} />}
          />
        </View>
      </Card>

      {/* Trip Details */}
      <Card style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>Trip Details</Text>

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar" size={18} color={colors.textMuted} />
            <View>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{formatDate(booking.pickupDate)}</Text>
            </View>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time" size={18} color={colors.textMuted} />
            <View>
              <Text style={styles.detailLabel}>Time</Text>
              <Text style={styles.detailValue}>{booking.pickupTime}</Text>
            </View>
          </View>
        </View>

        <Divider />

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="people" size={18} color={colors.textMuted} />
            <View>
              <Text style={styles.detailLabel}>Passengers</Text>
              <Text style={styles.detailValue}>{booking.passengers}</Text>
            </View>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="briefcase" size={18} color={colors.textMuted} />
            <View>
              <Text style={styles.detailLabel}>Luggage</Text>
              <Text style={styles.detailValue}>{booking.luggage}</Text>
            </View>
          </View>
        </View>

        <Divider />

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="car" size={18} color={colors.textMuted} />
            <View>
              <Text style={styles.detailLabel}>Vehicle</Text>
              <Text style={styles.detailValue}>{booking.vehicleType}</Text>
            </View>
          </View>
          {booking.flightNumber && (
            <View style={styles.detailItem}>
              <Ionicons name="airplane" size={18} color={colors.textMuted} />
              <View>
                <Text style={styles.detailLabel}>Flight</Text>
                <Text style={styles.detailValue}>{booking.flightNumber}</Text>
              </View>
            </View>
          )}
        </View>
      </Card>

      {/* Customer Info */}
      <Card style={styles.customerCard}>
        <Text style={styles.sectionTitle}>Customer</Text>
        <Text style={styles.customerName}>{booking.customerName}</Text>

        <View style={styles.customerActions}>
          <Button
            title="Call"
            variant="outline"
            size="sm"
            onPress={handleCallCustomer}
            icon={<Ionicons name="call" size={16} color={colors.primary} />}
            style={styles.actionButton}
          />
          <Button
            title="Email"
            variant="outline"
            size="sm"
            onPress={handleEmailCustomer}
            icon={<Ionicons name="mail" size={16} color={colors.primary} />}
            style={styles.actionButton}
          />
        </View>

        {booking.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>Notes</Text>
            <Text style={styles.notesText}>{booking.notes}</Text>
          </View>
        )}
      </Card>

      {/* Driver Info (for suppliers) */}
      {isSupplier && booking.driver && (
        <Card style={styles.driverCard}>
          <Text style={styles.sectionTitle}>Assigned Driver</Text>
          <View style={styles.driverInfo}>
            <View style={styles.driverAvatar}>
              <Ionicons name="person" size={24} color={colors.primary} />
            </View>
            <View style={styles.driverDetails}>
              <Text style={styles.driverName}>{booking.driver.name}</Text>
              <Text style={styles.driverPhone}>{booking.driver.phone}</Text>
              {booking.driver.vehiclePlate && (
                <Text style={styles.vehiclePlate}>
                  {booking.driver.vehicleMake} {booking.driver.vehicleModel} - {booking.driver.vehiclePlate}
                </Text>
              )}
            </View>
          </View>
        </Card>
      )}

      {/* Price */}
      <Card style={styles.priceCard}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>
            {partner?.type === 'affiliate' ? 'Commission' : 'Total Price'}
          </Text>
          <Text style={styles.priceValue}>
            {formatCurrency(booking.price, booking.currency)}
          </Text>
        </View>
      </Card>

      {/* Action Buttons (for suppliers) */}
      {isSupplier && (
        <View style={styles.actionsContainer}>
          {!booking.driver && booking.status === 'CONFIRMED' && (
            <Button
              title="Assign Driver"
              onPress={handleAssignDriver}
              icon={<Ionicons name="person-add" size={20} color="#fff" />}
              style={styles.mainButton}
            />
          )}

          {booking.status === 'DRIVER_ASSIGNED' && (
            <Button
              title="Mark as Completed"
              onPress={() => handleUpdateStatus('COMPLETED')}
              icon={<Ionicons name="checkmark-circle" size={20} color="#fff" />}
              style={styles.mainButton}
            />
          )}

          {['PENDING', 'CONFIRMED'].includes(booking.status) && (
            <Button
              title="Cancel Booking"
              variant="outline"
              onPress={() => handleUpdateStatus('CANCELLED')}
              icon={<Ionicons name="close-circle" size={20} color={colors.error} />}
              style={styles.cancelButton}
              textStyle={styles.cancelButtonText}
            />
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: scaleFontSize(18),
    color: colors.text,
    marginVertical: spacing.lg,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
  },
  bookingCode: {
    fontSize: scaleFontSize(16),
    fontFamily: 'monospace',
    fontWeight: '600',
    color: colors.text,
  },
  routeCard: {
    margin: spacing.md,
    padding: spacing.lg,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: scale(12),
    height: verticalScale(12),
    borderRadius: scale(6),
    marginRight: spacing.md,
  },
  routeInfo: {
    flex: 1,
  },
  routeLabel: {
    fontSize: scaleFontSize(12),
    color: colors.textMuted,
  },
  routeAddress: {
    fontSize: scaleFontSize(15),
    fontWeight: '500',
    color: colors.text,
  },
  routeLine: {
    width: scale(2),
    height: verticalScale(30),
    backgroundColor: colors.border,
    marginLeft: scale(5),
    marginVertical: spacing.sm,
  },
  detailsCard: {
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: scaleFontSize(16),
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  detailLabel: {
    fontSize: scaleFontSize(12),
    color: colors.textMuted,
  },
  detailValue: {
    fontSize: scaleFontSize(14),
    fontWeight: '500',
    color: colors.text,
  },
  customerCard: {
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.lg,
  },
  customerName: {
    fontSize: scaleFontSize(18),
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  customerActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  notesContainer: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: scale(8),
  },
  notesLabel: {
    fontSize: scaleFontSize(12),
    color: colors.textMuted,
    marginBottom: verticalScale(4),
  },
  notesText: {
    fontSize: scaleFontSize(14),
    color: colors.text,
  },
  driverCard: {
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.lg,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAvatar: {
    width: scale(50),
    height: verticalScale(50),
    borderRadius: scale(25),
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: scaleFontSize(16),
    fontWeight: '600',
    color: colors.text,
  },
  driverPhone: {
    fontSize: scaleFontSize(14),
    color: colors.textMuted,
  },
  vehiclePlate: {
    fontSize: scaleFontSize(12),
    color: colors.textMuted,
    marginTop: verticalScale(2),
  },
  priceCard: {
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.lg,
    backgroundColor: colors.primaryLight,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: scaleFontSize(16),
    color: colors.text,
  },
  priceValue: {
    fontSize: scaleFontSize(24),
    fontWeight: '700',
    color: colors.primary,
  },
  actionsContainer: {
    padding: spacing.md,
    gap: spacing.md,
  },
  mainButton: {
    marginBottom: 0,
  },
  cancelButton: {
    borderColor: colors.error,
  },
  cancelButtonText: {
    color: colors.error,
  },
});
