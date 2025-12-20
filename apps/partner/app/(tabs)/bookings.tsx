import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Badge, Loading, colors, spacing } from '@shared/components';
import { partnerApi } from '@shared/api';
import { formatCurrency, formatDate, getBookingStatusLabel, scale, verticalScale, scaleFontSize } from '@shared/utils';
import type { Booking } from '@shared/types';

type FilterStatus = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

const FILTERS: { key: FilterStatus; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function BookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadBookings(true);
  }, [filter]);

  const loadBookings = async (reset = false) => {
    const currentPage = reset ? 1 : page;
    const response = await partnerApi.getBookings({
      page: currentPage,
      limit: 20,
      status: filter === 'all' ? undefined : filter.toUpperCase(),
    });

    if (response.success && response.data) {
      if (reset) {
        setBookings(response.data.bookings);
        setPage(2);
      } else {
        setBookings((prev) => [...prev, ...response.data!.bookings]);
        setPage(currentPage + 1);
      }
      setHasMore(response.data.bookings.length === 20);
    }
    setLoading(false);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBookings(true);
    setRefreshing(false);
  }, [filter]);

  const loadMore = () => {
    if (!loading && hasMore) {
      loadBookings(false);
    }
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

  const renderBooking = ({ item: booking }: { item: Booking }) => (
    <Card
      style={styles.bookingCard}
      onPress={() => router.push(`/bookings/${booking.id}`)}
    >
      <View style={styles.bookingHeader}>
        <Badge
          label={getBookingStatusLabel(booking.status)}
          variant={getStatusVariant(booking.status)}
          size="sm"
        />
        <Text style={styles.bookingCode}>{booking.publicCode}</Text>
      </View>

      <View style={styles.routeContainer}>
        <View style={styles.routePoint}>
          <View style={[styles.dot, { backgroundColor: colors.success }]} />
          <Text style={styles.routeText} numberOfLines={1}>
            {booking.pickupLocation.name}
          </Text>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.routePoint}>
          <View style={[styles.dot, { backgroundColor: colors.error }]} />
          <Text style={styles.routeText} numberOfLines={1}>
            {booking.dropoffLocation.name}
          </Text>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
          <Text style={styles.detailText}>{formatDate(booking.pickupDate)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={14} color={colors.textMuted} />
          <Text style={styles.detailText}>{booking.pickupTime}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="people-outline" size={14} color={colors.textMuted} />
          <Text style={styles.detailText}>{booking.passengers} pax</Text>
        </View>
      </View>

      <View style={styles.bookingFooter}>
        <Text style={styles.customerName}>{booking.customerName}</Text>
        <Text style={styles.price}>
          {formatCurrency(booking.price, booking.currency)}
        </Text>
      </View>
    </Card>
  );

  if (loading && bookings.length === 0) {
    return <Loading fullScreen />;
  }

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          data={FILTERS}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterTab,
                filter === item.key && styles.filterTabActive,
              ]}
              onPress={() => {
                setFilter(item.key);
                setLoading(true);
              }}
            >
              <Text
                style={[
                  styles.filterTabText,
                  filter === item.key && styles.filterTabTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Bookings List */}
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.publicCode}
        renderItem={renderBooking}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={60} color={colors.border} />
            <Text style={styles.emptyText}>No bookings found</Text>
          </View>
        }
        ListFooterComponent={
          loading && bookings.length > 0 ? (
            <View style={styles.loadingFooter}>
              <Loading />
            </View>
          ) : null
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
  filterContainer: {
    backgroundColor: colors.surface,
    borderBottomWidth: scale(1),
    borderBottomColor: colors.border,
  },
  filterList: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  filterTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: scale(20),
    backgroundColor: colors.background,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
  },
  filterTabText: {
    fontSize: scaleFontSize(14),
    fontWeight: '500',
    color: colors.textMuted,
  },
  filterTabTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: spacing.md,
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
    fontSize: scaleFontSize(12),
    fontFamily: 'monospace',
    color: colors.textMuted,
  },
  routeContainer: {
    marginBottom: spacing.md,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: scale(8),
    height: verticalScale(8),
    borderRadius: scale(4),
    marginRight: spacing.sm,
  },
  routeLine: {
    width: scale(1),
    height: verticalScale(16),
    backgroundColor: colors.border,
    marginLeft: scale(3.5),
    marginVertical: verticalScale(2),
  },
  routeText: {
    flex: 1,
    fontSize: scaleFontSize(14),
    color: colors.text,
  },
  bookingDetails: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  detailText: {
    fontSize: scaleFontSize(12),
    color: colors.textMuted,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: scale(1),
    borderTopColor: colors.border,
  },
  customerName: {
    fontSize: scaleFontSize(14),
    color: colors.text,
    fontWeight: '500',
  },
  price: {
    fontSize: scaleFontSize(18),
    fontWeight: '700',
    color: colors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    fontSize: scaleFontSize(16),
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  loadingFooter: {
    paddingVertical: spacing.lg,
  },
});
