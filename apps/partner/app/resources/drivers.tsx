import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Badge, Button, Loading, colors, spacing } from '@shared/components';
import { partnerApi } from '@shared/api';
import { scale, verticalScale, scaleFontSize } from '@shared/utils/responsive';

interface Driver {
  id: number;
  name: string;
  phone: string;
  email: string;
  photoUrl: string | null;
  licenseNumber: string;
  isActive: boolean;
  isAvailable: boolean;
  rating: number;
  totalRides: number;
  vehicleId: number | null;
  vehicleInfo: string | null;
}

export default function DriversScreen() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    const response = await partnerApi.getDrivers();
    if (response.success && response.data) {
      setDrivers(response.data);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDrivers();
    setRefreshing(false);
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleToggleStatus = async (driver: Driver) => {
    Alert.alert(
      driver.isActive ? 'Deactivate Driver' : 'Activate Driver',
      `Are you sure you want to ${driver.isActive ? 'deactivate' : 'activate'} ${driver.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            const response = await partnerApi.updateDriverStatus(
              driver.id,
              !driver.isActive
            );
            if (response.success) {
              loadDrivers();
            } else {
              Alert.alert('Error', response.error || 'Failed to update driver status');
            }
          },
        },
      ]
    );
  };

  const renderDriver = ({ item: driver }: { item: Driver }) => (
    <Card style={styles.driverCard}>
      <View style={styles.driverHeader}>
        <View style={styles.driverAvatar}>
          {driver.photoUrl ? (
            <Ionicons name="person" size={30} color={colors.primary} />
          ) : (
            <Ionicons name="person" size={30} color={colors.primary} />
          )}
        </View>
        <View style={styles.driverInfo}>
          <Text style={styles.driverName}>{driver.name}</Text>
          <Text style={styles.driverPhone}>{driver.phone}</Text>
          {driver.vehicleInfo && (
            <Text style={styles.vehicleInfo}>{driver.vehicleInfo}</Text>
          )}
        </View>
        <View style={styles.statusBadges}>
          <Badge
            label={driver.isActive ? 'Active' : 'Inactive'}
            variant={driver.isActive ? 'success' : 'error'}
            size="sm"
          />
          {driver.isActive && (
            <Badge
              label={driver.isAvailable ? 'Available' : 'Busy'}
              variant={driver.isAvailable ? 'info' : 'warning'}
              size="sm"
            />
          )}
        </View>
      </View>

      <View style={styles.driverStats}>
        <View style={styles.statItem}>
          <Ionicons name="star" size={16} color="#FFB800" />
          <Text style={styles.statValue}>{driver.rating.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="car" size={16} color={colors.primary} />
          <Text style={styles.statValue}>{driver.totalRides}</Text>
          <Text style={styles.statLabel}>Rides</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="document-text" size={16} color={colors.textMuted} />
          <Text style={styles.statValue} numberOfLines={1}>{driver.licenseNumber}</Text>
          <Text style={styles.statLabel}>License</Text>
        </View>
      </View>

      <View style={styles.driverActions}>
        <Button
          title="Call"
          variant="outline"
          size="sm"
          onPress={() => handleCall(driver.phone)}
          icon={<Ionicons name="call" size={16} color={colors.primary} />}
          style={styles.actionButton}
        />
        <Button
          title={driver.isActive ? 'Deactivate' : 'Activate'}
          variant="outline"
          size="sm"
          onPress={() => handleToggleStatus(driver)}
          icon={
            <Ionicons
              name={driver.isActive ? 'pause-circle' : 'play-circle'}
              size={16}
              color={driver.isActive ? colors.error : colors.success}
            />
          }
          style={[
            styles.actionButton,
            driver.isActive ? styles.deactivateButton : styles.activateButton,
          ]}
          textStyle={driver.isActive ? styles.deactivateText : styles.activateText}
        />
      </View>
    </Card>
  );

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={drivers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderDriver}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={60} color={colors.border} />
            <Text style={styles.emptyText}>No drivers yet</Text>
            <Text style={styles.emptySubtext}>
              Add drivers from the web dashboard
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
  listContent: {
    padding: spacing.md,
  },
  driverCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  driverHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  driverAvatar: {
    width: scale(60),
    height: verticalScale(60),
    borderRadius: scale(30),
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: scaleFontSize(18),
    fontWeight: '600',
    color: colors.text,
  },
  driverPhone: {
    fontSize: scaleFontSize(14),
    color: colors.textMuted,
    marginTop: verticalScale(2),
  },
  vehicleInfo: {
    fontSize: scaleFontSize(12),
    color: colors.textMuted,
    marginTop: verticalScale(4),
  },
  statusBadges: {
    alignItems: 'flex-end',
    gap: verticalScale(4),
  },
  driverStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    borderTopWidth: scale(1),
    borderBottomWidth: scale(1),
    borderColor: colors.border,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: scaleFontSize(16),
    fontWeight: '600',
    color: colors.text,
    marginTop: verticalScale(4),
  },
  statLabel: {
    fontSize: scaleFontSize(11),
    color: colors.textMuted,
    marginTop: verticalScale(2),
  },
  statDivider: {
    width: scale(1),
    backgroundColor: colors.border,
  },
  driverActions: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  deactivateButton: {
    borderColor: colors.error,
  },
  activateButton: {
    borderColor: colors.success,
  },
  deactivateText: {
    color: colors.error,
  },
  activateText: {
    color: colors.success,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    fontSize: scaleFontSize(18),
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: scaleFontSize(14),
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
