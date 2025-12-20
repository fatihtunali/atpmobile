import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Badge, Loading, colors, spacing } from '@shared/components';
import { driverApi } from '@shared/api';
import { useDriverRidesStore, useAuthStore } from '@shared/stores';
import {
  formatDate,
  formatTime,
  getRelativeTime,
  formatCurrency,
} from '@shared/utils';
import { scale, verticalScale, scaleFontSize } from '@shared/utils/responsive';
import type { DriverRide } from '@shared/types';

export default function RidesScreen() {
  const { driver } = useAuthStore();
  const { rides, isOnline, setRides, setOnline, isLoading, setLoading } =
    useDriverRidesStore();
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming'>('today');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRides();
  }, [activeTab]);

  const loadRides = async () => {
    setLoading(true);
    const response = await driverApi.getRides(activeTab);
    if (response.success && response.data) {
      setRides(response.data as unknown as any[]);
    }
    setLoading(false);
  };

  const toggleOnline = async () => {
    const newStatus = !isOnline;
    const response = await driverApi.setAvailability(newStatus);
    if (response.success) {
      setOnline(newStatus);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRides();
    setRefreshing(false);
  };

  const renderRide = ({ item }: { item: DriverRide }) => (
    <Card
      style={styles.rideCard}
      onPress={() => router.push(`/ride/${item.id}`)}
    >
      <View style={styles.rideHeader}>
        <View style={styles.rideTime}>
          <Ionicons name="time-outline" size={16} color={colors.primary} />
          <Text style={styles.rideTimeText}>
            {formatTime(item.pickupTime)}
          </Text>
        </View>
        <Text style={styles.rideDate}>{getRelativeTime(item.pickupDate)}</Text>
      </View>

      <View style={styles.routeContainer}>
        <View style={styles.routePoint}>
          <View style={styles.routeDot} />
          <Text style={styles.routeText} numberOfLines={1}>
            {item.pickupLocation.name}
          </Text>
        </View>

        <View style={styles.routeLine} />

        <View style={styles.routePoint}>
          <View style={[styles.routeDot, styles.routeDotEnd]} />
          <Text style={styles.routeText} numberOfLines={1}>
            {item.dropoffLocation.name}
          </Text>
        </View>
      </View>

      <View style={styles.rideFooter}>
        <View style={styles.rideDetail}>
          <Ionicons name="person" size={16} color={colors.textMuted} />
          <Text style={styles.rideDetailText}>{item.customerName}</Text>
        </View>
        <View style={styles.rideDetail}>
          <Ionicons name="people" size={16} color={colors.textMuted} />
          <Text style={styles.rideDetailText}>{item.passengers}</Text>
        </View>
        <Text style={styles.rideEarnings}>
          {formatCurrency(item.driverEarnings, item.currency)}
        </Text>
      </View>

      {item.flightNumber && (
        <View style={styles.flightInfo}>
          <Ionicons name="airplane" size={14} color={colors.textMuted} />
          <Text style={styles.flightText}>Flight {item.flightNumber}</Text>
        </View>
      )}
    </Card>
  );

  if (isLoading && rides.length === 0) {
    return <Loading fullScreen />;
  }

  return (
    <View style={styles.container}>
      {/* Online Status */}
      <View style={styles.statusBar}>
        <View style={styles.statusInfo}>
          <View
            style={[
              styles.statusDot,
              isOnline ? styles.statusDotOnline : styles.statusDotOffline,
            ]}
          />
          <Text style={styles.statusText}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>
        <Switch
          value={isOnline}
          onValueChange={toggleOnline}
          trackColor={{ false: colors.border, true: `${colors.primary}50` }}
          thumbColor={isOnline ? colors.primary : colors.textMuted}
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'today' && styles.tabActive]}
          onPress={() => setActiveTab('today')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'today' && styles.tabTextActive,
            ]}
          >
            Today
          </Text>
        </TouchableOpacity>
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
      </View>

      {/* Rides List */}
      <FlatList
        data={rides}
        renderItem={renderRide}
        keyExtractor={(item) => item.id.toString()}
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
            <Ionicons name="car-outline" size={64} color={colors.border} />
            <Text style={styles.emptyTitle}>No rides</Text>
            <Text style={styles.emptyText}>
              {activeTab === 'today'
                ? "You don't have any rides scheduled for today"
                : 'No upcoming rides scheduled'}
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
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: scale(10),
    height: scale(10),
    borderRadius: scale(5),
    marginRight: spacing.sm,
  },
  statusDotOnline: {
    backgroundColor: colors.success,
  },
  statusDotOffline: {
    backgroundColor: colors.textMuted,
  },
  statusText: {
    fontSize: scaleFontSize(15),
    fontWeight: '600',
    color: colors.text,
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
    fontSize: scaleFontSize(15),
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
  rideCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  rideTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rideTimeText: {
    marginLeft: spacing.xs,
    fontSize: scaleFontSize(18),
    fontWeight: '700',
    color: colors.primary,
  },
  rideDate: {
    fontSize: scaleFontSize(13),
    color: colors.textMuted,
  },
  routeContainer: {
    marginBottom: spacing.md,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeDot: {
    width: scale(10),
    height: scale(10),
    borderRadius: scale(5),
    backgroundColor: colors.primary,
    marginRight: spacing.sm,
  },
  routeDotEnd: {
    backgroundColor: colors.secondary,
  },
  routeLine: {
    width: scale(2),
    height: verticalScale(16),
    backgroundColor: colors.border,
    marginLeft: scale(4),
    marginVertical: scale(2),
  },
  routeText: {
    flex: 1,
    fontSize: scaleFontSize(14),
    color: colors.text,
  },
  rideFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rideDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  rideDetailText: {
    marginLeft: scale(4),
    fontSize: scaleFontSize(13),
    color: colors.textSecondary,
  },
  rideEarnings: {
    marginLeft: 'auto',
    fontSize: scaleFontSize(16),
    fontWeight: '700',
    color: colors.success,
  },
  flightInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  flightText: {
    marginLeft: spacing.xs,
    fontSize: scaleFontSize(12),
    color: colors.textMuted,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyTitle: {
    fontSize: scaleFontSize(18),
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: scaleFontSize(14),
    color: colors.textMuted,
    textAlign: 'center',
  },
});
