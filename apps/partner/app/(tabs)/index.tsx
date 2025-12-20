import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Badge, Loading, colors, spacing } from '@shared/components';
import { partnerApi } from '@shared/api';
import { useAuthStore } from '@shared/stores';
import { formatCurrency, formatDate, getBookingStatusLabel, scale, verticalScale, scaleFontSize } from '@shared/utils';
import type { Booking, EarningsSummary } from '@shared/types';

interface DashboardData {
  summary: EarningsSummary;
  recentBookings: Booking[];
  stats: {
    totalBookings: number;
    pendingBookings: number;
    completedBookings: number;
  };
}

export default function DashboardScreen() {
  const { partner } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const partnerType = partner?.type;
  const partnerData = partner?.data;

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    const response = await partnerApi.getDashboard();
    if (response.success && response.data) {
      setData(response.data);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      {/* Welcome Header */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.companyName}>
          {partnerType === 'affiliate'
            ? (partnerData as any)?.companyName
            : (partnerData as any)?.companyName}
        </Text>
        <Badge
          label={partnerType === 'affiliate' ? 'Affiliate' : 'Supplier'}
          variant="info"
          size="sm"
        />
      </View>

      {/* Earnings Summary */}
      {data?.summary && (
        <Card style={styles.earningsCard}>
          <View style={styles.earningsHeader}>
            <Text style={styles.earningsLabel}>This Month</Text>
            <Ionicons name="trending-up" size={20} color={colors.success} />
          </View>
          <Text style={styles.earningsValue}>
            {formatCurrency(data.summary.thisMonth, data.summary.currency)}
          </Text>
          <View style={styles.earningsStats}>
            <View style={styles.earningStat}>
              <Text style={styles.earningStatValue}>
                {formatCurrency(data.summary.today, data.summary.currency)}
              </Text>
              <Text style={styles.earningStatLabel}>Today</Text>
            </View>
            <View style={styles.earningStatDivider} />
            <View style={styles.earningStat}>
              <Text style={styles.earningStatValue}>
                {formatCurrency(data.summary.thisWeek, data.summary.currency)}
              </Text>
              <Text style={styles.earningStatLabel}>This Week</Text>
            </View>
            <View style={styles.earningStatDivider} />
            <View style={styles.earningStat}>
              <Text style={styles.earningStatValue}>
                {formatCurrency(data.summary.pendingPayout, data.summary.currency)}
              </Text>
              <Text style={styles.earningStatLabel}>Pending</Text>
            </View>
          </View>
        </Card>
      )}

      {/* Quick Stats */}
      {data?.stats && (
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Ionicons name="calendar-outline" size={24} color={colors.primary} />
            <Text style={styles.statValue}>{data.stats.totalBookings}</Text>
            <Text style={styles.statLabel}>Total Bookings</Text>
          </Card>
          <Card style={styles.statCard}>
            <Ionicons name="time-outline" size={24} color={colors.warning} />
            <Text style={styles.statValue}>{data.stats.pendingBookings}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </Card>
          <Card style={styles.statCard}>
            <Ionicons name="checkmark-circle-outline" size={24} color={colors.success} />
            <Text style={styles.statValue}>{data.stats.completedBookings}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </Card>
        </View>
      )}

      {/* Supplier Quick Actions */}
      {partnerType === 'supplier' && (
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            <Card
              style={styles.actionCard}
              onPress={() => router.push('/resources/drivers')}
            >
              <Ionicons name="people" size={28} color={colors.primary} />
              <Text style={styles.actionLabel}>Drivers</Text>
            </Card>
            <Card
              style={styles.actionCard}
              onPress={() => router.push('/resources/vehicles')}
            >
              <Ionicons name="car" size={28} color={colors.primary} />
              <Text style={styles.actionLabel}>Vehicles</Text>
            </Card>
          </View>
        </View>
      )}

      {/* Recent Bookings */}
      <View style={styles.recentSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Bookings</Text>
          <Text
            style={styles.viewAll}
            onPress={() => router.push('/(tabs)/bookings')}
          >
            View All
          </Text>
        </View>

        {data?.recentBookings && data.recentBookings.length > 0 ? (
          data.recentBookings.slice(0, 5).map((booking) => (
            <Card
              key={booking.publicCode}
              style={styles.bookingCard}
              onPress={() => router.push(`/bookings/${booking.id}`)}
            >
              <View style={styles.bookingHeader}>
                <Badge
                  label={getBookingStatusLabel(booking.status)}
                  variant={
                    booking.status === 'COMPLETED'
                      ? 'success'
                      : booking.status === 'CANCELLED'
                      ? 'error'
                      : 'info'
                  }
                  size="sm"
                />
                <Text style={styles.bookingCode}>{booking.publicCode}</Text>
              </View>
              <Text style={styles.bookingRoute} numberOfLines={1}>
                {booking.pickupLocation.name} → {booking.dropoffLocation.name}
              </Text>
              <View style={styles.bookingFooter}>
                <Text style={styles.bookingDate}>
                  {formatDate(booking.pickupDate)}
                </Text>
                <Text style={styles.bookingPrice}>
                  {formatCurrency(booking.price, booking.currency)}
                </Text>
              </View>
            </Card>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Ionicons name="calendar-outline" size={40} color={colors.border} />
            <Text style={styles.emptyText}>No recent bookings</Text>
          </Card>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  welcomeText: {
    fontSize: scaleFontSize(14),
    color: colors.textMuted,
  },
  companyName: {
    fontSize: scaleFontSize(24),
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  earningsCard: {
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.lg,
    backgroundColor: colors.primary,
  },
  earningsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  earningsLabel: {
    fontSize: scaleFontSize(14),
    color: 'rgba(255,255,255,0.8)',
  },
  earningsValue: {
    fontSize: scaleFontSize(36),
    fontWeight: '700',
    color: '#fff',
    marginTop: spacing.xs,
  },
  earningsStats: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: scale(1),
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  earningStat: {
    flex: 1,
    alignItems: 'center',
  },
  earningStatValue: {
    fontSize: scaleFontSize(16),
    fontWeight: '600',
    color: '#fff',
  },
  earningStatLabel: {
    fontSize: scaleFontSize(11),
    color: 'rgba(255,255,255,0.7)',
    marginTop: verticalScale(2),
  },
  earningStatDivider: {
    width: scale(1),
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
  },
  statValue: {
    fontSize: scaleFontSize(24),
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: scaleFontSize(11),
    color: colors.textMuted,
    marginTop: verticalScale(2),
  },
  quickActions: {
    padding: spacing.md,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.lg,
  },
  actionLabel: {
    fontSize: scaleFontSize(14),
    fontWeight: '500',
    color: colors.text,
    marginTop: spacing.sm,
  },
  recentSection: {
    padding: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: scaleFontSize(18),
    fontWeight: '600',
    color: colors.text,
  },
  viewAll: {
    fontSize: scaleFontSize(14),
    color: colors.primary,
    fontWeight: '500',
  },
  bookingCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  bookingCode: {
    fontSize: scaleFontSize(12),
    fontFamily: 'monospace',
    color: colors.textMuted,
  },
  bookingRoute: {
    fontSize: scaleFontSize(14),
    color: colors.text,
    marginBottom: spacing.sm,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookingDate: {
    fontSize: scaleFontSize(12),
    color: colors.textMuted,
  },
  bookingPrice: {
    fontSize: scaleFontSize(16),
    fontWeight: '700',
    color: colors.primary,
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: scaleFontSize(14),
    color: colors.textMuted,
    marginTop: spacing.md,
  },
});
