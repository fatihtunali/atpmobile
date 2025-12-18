import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Badge, Loading, colors, spacing } from '@shared/components';
import { customerApi } from '@shared/api';
import { useBookingsStore } from '@shared/stores';
import {
  formatDate,
  formatTime,
  getBookingStatusLabel,
  getBookingStatusColor,
} from '@shared/utils';
import type { Booking } from '@shared/types';

export default function BookingsScreen() {
  const { bookings, setBookings, isLoading, setLoading } = useBookingsStore();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBookings();
  }, [activeTab]);

  const loadBookings = async () => {
    setLoading(true);
    const response = await customerApi.getBookings(activeTab);
    if (response.success && response.data) {
      setBookings(response.data);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const renderBooking = ({ item }: { item: Booking }) => (
    <Card
      style={styles.bookingCard}
      onPress={() => router.push(`/tracking/${item.publicCode}`)}
    >
      <View style={styles.bookingHeader}>
        <Badge
          label={getBookingStatusLabel(item.status)}
          variant={
            item.status === 'COMPLETED'
              ? 'success'
              : item.status === 'CANCELLED'
              ? 'error'
              : 'info'
          }
        />
        <Text style={styles.bookingCode}>{item.publicCode}</Text>
      </View>

      <View style={styles.routeContainer}>
        <View style={styles.routePoint}>
          <View style={styles.routeDot} />
          <View style={styles.routeInfo}>
            <Text style={styles.routeLabel}>Pickup</Text>
            <Text style={styles.routeText} numberOfLines={1}>
              {item.pickupLocation.name}
            </Text>
          </View>
        </View>

        <View style={styles.routeLine} />

        <View style={styles.routePoint}>
          <View style={[styles.routeDot, styles.routeDotEnd]} />
          <View style={styles.routeInfo}>
            <Text style={styles.routeLabel}>Dropoff</Text>
            <Text style={styles.routeText} numberOfLines={1}>
              {item.dropoffLocation.name}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.bookingFooter}>
        <View style={styles.bookingDetail}>
          <Ionicons name="calendar-outline" size={16} color={colors.textMuted} />
          <Text style={styles.bookingDetailText}>
            {formatDate(item.pickupDate)}
          </Text>
        </View>
        <View style={styles.bookingDetail}>
          <Ionicons name="time-outline" size={16} color={colors.textMuted} />
          <Text style={styles.bookingDetailText}>
            {formatTime(item.pickupTime)}
          </Text>
        </View>
        <Text style={styles.bookingPrice}>
          {item.currency} {item.price.toFixed(2)}
        </Text>
      </View>
    </Card>
  );

  if (isLoading && bookings.length === 0) {
    return <Loading fullScreen />;
  }

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'upcoming' && styles.tabTextActive,
            ]}
          >
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.tabActive]}
          onPress={() => setActiveTab('past')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'past' && styles.tabTextActive,
            ]}
          >
            Past
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bookings List */}
      <FlatList
        data={bookings}
        renderItem={renderBooking}
        keyExtractor={(item) => item.publicCode}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={64} color={colors.border} />
            <Text style={styles.emptyTitle}>No bookings yet</Text>
            <Text style={styles.emptyText}>
              {activeTab === 'upcoming'
                ? "You don't have any upcoming trips"
                : "You haven't taken any trips yet"}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    paddingVertical: spacing.md,
    marginRight: spacing.lg,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.primary,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  bookingCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  bookingCode: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: colors.textMuted,
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
    marginRight: spacing.sm,
    marginTop: 4,
  },
  routeDotEnd: {
    backgroundColor: colors.secondary,
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: colors.border,
    marginLeft: 5,
    marginVertical: 2,
  },
  routeInfo: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 2,
  },
  routeText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  bookingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  bookingDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  bookingDetailText: {
    marginLeft: 4,
    fontSize: 13,
    color: colors.textSecondary,
  },
  bookingPrice: {
    marginLeft: 'auto',
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
