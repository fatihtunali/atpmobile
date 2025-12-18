import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Badge, Button, Loading, colors, spacing } from '@shared/components';
import { partnerApi } from '@shared/api';

interface Vehicle {
  id: number;
  type: string;
  make: string;
  model: string;
  year: number;
  color: string;
  plateNumber: string;
  capacity: number;
  luggageCapacity: number;
  isActive: boolean;
  driverId: number | null;
  driverName: string | null;
  photoUrl: string | null;
}

const VEHICLE_ICONS: Record<string, string> = {
  sedan: 'car-sport',
  suv: 'car',
  van: 'bus',
  minibus: 'bus',
  luxury: 'car-sport',
  default: 'car',
};

export default function VehiclesScreen() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    const response = await partnerApi.getVehicles();
    if (response.success && response.data) {
      setVehicles(response.data);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVehicles();
    setRefreshing(false);
  };

  const handleToggleStatus = async (vehicle: Vehicle) => {
    Alert.alert(
      vehicle.isActive ? 'Deactivate Vehicle' : 'Activate Vehicle',
      `Are you sure you want to ${vehicle.isActive ? 'deactivate' : 'activate'} this vehicle?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            const response = await partnerApi.updateVehicleStatus(
              vehicle.id,
              !vehicle.isActive
            );
            if (response.success) {
              loadVehicles();
            } else {
              Alert.alert('Error', response.error || 'Failed to update vehicle status');
            }
          },
        },
      ]
    );
  };

  const getVehicleIcon = (type: string) => {
    return VEHICLE_ICONS[type.toLowerCase()] || VEHICLE_ICONS.default;
  };

  const renderVehicle = ({ item: vehicle }: { item: Vehicle }) => (
    <Card style={styles.vehicleCard}>
      <View style={styles.vehicleHeader}>
        <View style={styles.vehicleIcon}>
          <Ionicons
            name={getVehicleIcon(vehicle.type) as any}
            size={30}
            color={colors.primary}
          />
        </View>
        <View style={styles.vehicleInfo}>
          <Text style={styles.vehicleName}>
            {vehicle.make} {vehicle.model}
          </Text>
          <Text style={styles.vehicleDetails}>
            {vehicle.year} • {vehicle.color}
          </Text>
          <Text style={styles.plateNumber}>{vehicle.plateNumber}</Text>
        </View>
        <Badge
          label={vehicle.isActive ? 'Active' : 'Inactive'}
          variant={vehicle.isActive ? 'success' : 'error'}
          size="sm"
        />
      </View>

      <View style={styles.vehicleSpecs}>
        <View style={styles.specItem}>
          <Ionicons name="car" size={18} color={colors.textMuted} />
          <Text style={styles.specValue}>{vehicle.type}</Text>
        </View>
        <View style={styles.specItem}>
          <Ionicons name="people" size={18} color={colors.textMuted} />
          <Text style={styles.specValue}>{vehicle.capacity} seats</Text>
        </View>
        <View style={styles.specItem}>
          <Ionicons name="briefcase" size={18} color={colors.textMuted} />
          <Text style={styles.specValue}>{vehicle.luggageCapacity} bags</Text>
        </View>
      </View>

      {vehicle.driverName && (
        <View style={styles.assignedDriver}>
          <Ionicons name="person" size={16} color={colors.primary} />
          <Text style={styles.assignedDriverText}>
            Assigned to: {vehicle.driverName}
          </Text>
        </View>
      )}

      {!vehicle.driverName && (
        <View style={styles.unassigned}>
          <Ionicons name="alert-circle" size={16} color={colors.warning} />
          <Text style={styles.unassignedText}>Not assigned to any driver</Text>
        </View>
      )}

      <View style={styles.vehicleActions}>
        <Button
          title={vehicle.isActive ? 'Deactivate' : 'Activate'}
          variant="outline"
          size="sm"
          onPress={() => handleToggleStatus(vehicle)}
          icon={
            <Ionicons
              name={vehicle.isActive ? 'pause-circle' : 'play-circle'}
              size={16}
              color={vehicle.isActive ? colors.error : colors.success}
            />
          }
          style={[
            styles.actionButton,
            vehicle.isActive ? styles.deactivateButton : styles.activateButton,
          ]}
          textStyle={vehicle.isActive ? styles.deactivateText : styles.activateText}
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
        data={vehicles}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderVehicle}
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
            <Ionicons name="car-outline" size={60} color={colors.border} />
            <Text style={styles.emptyText}>No vehicles yet</Text>
            <Text style={styles.emptySubtext}>
              Add vehicles from the web dashboard
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
  vehicleCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  vehicleIcon: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  vehicleDetails: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
  plateNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 4,
    fontFamily: 'monospace',
  },
  vehicleSpecs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  specValue: {
    fontSize: 14,
    color: colors.text,
  },
  assignedDriver: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    gap: spacing.sm,
  },
  assignedDriverText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  unassigned: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderRadius: 8,
    gap: spacing.sm,
  },
  unassignedText: {
    fontSize: 14,
    color: colors.warning,
    fontWeight: '500',
  },
  vehicleActions: {
    marginTop: spacing.md,
  },
  actionButton: {
    width: '100%',
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
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
