import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Loading, Badge, colors, spacing } from '@shared/components';
import { useSearchStore, useBookingsStore } from '@shared/stores';
import { customerApi } from '@shared/api';
import { formatCurrency, formatDuration, formatDate, formatTime } from '@shared/utils';
import type { SearchResult } from '@shared/types';

export default function SearchResultsScreen() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchStore = useSearchStore();
  const { setCurrentBooking } = useBookingsStore();

  const fetchResults = async () => {
    try {
      setError(null);
      const response = await customerApi.searchTransfers({
        pickupType: searchStore.pickupType,
        dropoffType: searchStore.dropoffType,
        pickupAirportCode: searchStore.pickupAirport?.code,
        dropoffAirportCode: searchStore.dropoffAirport?.code,
        pickupAddress: searchStore.pickupAddress,
        dropoffAddress: searchStore.dropoffAddress,
        pickupLatitude: searchStore.pickupCoords?.lat,
        pickupLongitude: searchStore.pickupCoords?.lng,
        dropoffLatitude: searchStore.dropoffCoords?.lat,
        dropoffLongitude: searchStore.dropoffCoords?.lng,
        pickupDate: searchStore.pickupDate.toISOString().split('T')[0],
        pickupTime: searchStore.pickupTime,
        passengers: searchStore.passengers,
      });

      if (response.success && response.data) {
        setResults(response.data);
      } else {
        setError(response.error || 'No results found');
      }
    } catch (err) {
      setError('Failed to search transfers');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchResults();
  };

  const handleSelect = (result: SearchResult) => {
    router.push({
      pathname: '/booking/details',
      params: { result: JSON.stringify(result) },
    });
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'SEDAN':
        return 'car-sport';
      case 'VAN':
        return 'bus';
      case 'MINIBUS':
        return 'bus';
      case 'BUS':
        return 'bus';
      case 'VIP':
        return 'car-sport';
      default:
        return 'car';
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Route Summary */}
      <Card style={styles.summaryCard}>
        <View style={styles.routeInfo}>
          <View style={styles.routePoint}>
            <View style={styles.routeDot} />
            <Text style={styles.routeText} numberOfLines={1}>
              {searchStore.pickupType === 'airport'
                ? searchStore.pickupAirport?.name
                : searchStore.pickupAddress || 'Pickup location'}
            </Text>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.routePoint}>
            <View style={[styles.routeDot, styles.routeDotDest]} />
            <Text style={styles.routeText} numberOfLines={1}>
              {searchStore.dropoffType === 'airport'
                ? searchStore.dropoffAirport?.name
                : searchStore.dropoffAddress || 'Dropoff location'}
            </Text>
          </View>
        </View>
        <View style={styles.tripDetails}>
          <View style={styles.tripDetail}>
            <Ionicons name="calendar-outline" size={16} color={colors.textMuted} />
            <Text style={styles.tripDetailText}>
              {formatDate(searchStore.pickupDate)}
            </Text>
          </View>
          <View style={styles.tripDetail}>
            <Ionicons name="time-outline" size={16} color={colors.textMuted} />
            <Text style={styles.tripDetailText}>
              {formatTime(searchStore.pickupTime)}
            </Text>
          </View>
          <View style={styles.tripDetail}>
            <Ionicons name="people-outline" size={16} color={colors.textMuted} />
            <Text style={styles.tripDetailText}>{searchStore.passengers}</Text>
          </View>
        </View>
      </Card>

      {/* Results */}
      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.textMuted} />
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Try Again" onPress={handleRefresh} variant="outline" />
        </View>
      ) : results.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="car-outline" size={48} color={colors.textMuted} />
          <Text style={styles.emptyText}>No transfers available for this route</Text>
          <Button title="Modify Search" onPress={() => router.back()} variant="outline" />
        </View>
      ) : (
        <>
          <Text style={styles.resultsCount}>
            {results.length} vehicle{results.length !== 1 ? 's' : ''} available
          </Text>

          {results.map((result, index) => (
            <Card key={index} style={styles.resultCard} onPress={() => handleSelect(result)}>
              <View style={styles.vehicleHeader}>
                <View style={styles.vehicleIconContainer}>
                  <Ionicons
                    name={getVehicleIcon(result.vehicleType) as any}
                    size={32}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.vehicleInfo}>
                  <Text style={styles.vehicleName}>{result.vehicleName}</Text>
                  <Text style={styles.vehicleDesc}>{result.vehicleDescription}</Text>
                </View>
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>
                    {formatCurrency(result.price, result.currency)}
                  </Text>
                  <Text style={styles.priceLabel}>Total</Text>
                </View>
              </View>

              <View style={styles.vehicleSpecs}>
                <View style={styles.spec}>
                  <Ionicons name="people" size={16} color={colors.textMuted} />
                  <Text style={styles.specText}>Up to {result.maxPassengers}</Text>
                </View>
                <View style={styles.spec}>
                  <Ionicons name="briefcase" size={16} color={colors.textMuted} />
                  <Text style={styles.specText}>{result.maxLuggage} bags</Text>
                </View>
                <View style={styles.spec}>
                  <Ionicons name="time" size={16} color={colors.textMuted} />
                  <Text style={styles.specText}>{formatDuration(result.duration)}</Text>
                </View>
              </View>

              <View style={styles.supplierRow}>
                <Text style={styles.supplierName}>{result.supplierName}</Text>
                {result.supplierRating > 0 && (
                  <View style={styles.rating}>
                    <Ionicons name="star" size={14} color="#f59e0b" />
                    <Text style={styles.ratingText}>
                      {result.supplierRating.toFixed(1)} ({result.supplierReviews})
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.features}>
                {result.features.slice(0, 3).map((feature, i) => (
                  <Badge key={i} label={feature} variant="success" size="sm" />
                ))}
              </View>

              <Button
                title="Select"
                onPress={() => handleSelect(result)}
                fullWidth
                size="md"
              />
            </Card>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  summaryCard: {
    margin: spacing.md,
    padding: spacing.md,
  },
  routeInfo: {
    marginBottom: spacing.md,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginRight: spacing.sm,
  },
  routeDotDest: {
    backgroundColor: colors.secondary,
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: colors.border,
    marginLeft: 4,
    marginVertical: 4,
  },
  routeText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  tripDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tripDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tripDetailText: {
    marginLeft: 4,
    fontSize: 13,
    color: colors.textSecondary,
  },
  resultsCount: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    fontSize: 14,
    color: colors.textSecondary,
  },
  resultCard: {
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.md,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  vehicleIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  vehicleDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  priceLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  vehicleSpecs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  spec: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  specText: {
    marginLeft: 4,
    fontSize: 13,
    color: colors.textSecondary,
  },
  supplierRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  supplierName: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 13,
    color: colors.textSecondary,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
});
