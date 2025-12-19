import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Input, Loading, colors, spacing } from '@shared/components';
import { useSearchStore } from '@shared/stores';
import { customerApi } from '@shared/api';
import { formatCurrency, formatDate, formatTime } from '@shared/utils';
import type { SearchResult } from '@shared/types';

export default function PaymentScreen() {
  const params = useLocalSearchParams();
  const searchStore = useSearchStore();

  const result: SearchResult = params.result
    ? JSON.parse(params.result as string)
    : null;
  const passenger = params.passenger
    ? JSON.parse(params.passenger as string)
    : null;

  const [loading, setLoading] = useState(false);
  const [promoCode, setPromoCode] = useState('');

  if (!result || !passenger) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Invalid booking data</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await customerApi.createBooking({
        searchResult: result,
        searchRequest: {
          pickupType: searchStore.pickupType,
          dropoffType: searchStore.dropoffType,
          pickupAirportCode: searchStore.pickupAirport?.code,
          dropoffAirportCode: searchStore.dropoffAirport?.code,
          pickupAddress: searchStore.pickupAddress,
          dropoffAddress: searchStore.dropoffAddress,
          pickupDate: searchStore.pickupDate.toISOString().split('T')[0],
          pickupTime: searchStore.pickupTime,
          passengers: searchStore.passengers,
        },
        passengerDetails: {
          name: passenger.name,
          email: passenger.email,
          phone: passenger.phone,
        },
        flightNumber: passenger.flightNumber,
        notes: passenger.notes,
        promoCode: promoCode || undefined,
      });

      if (response.success && response.data) {
        // Reset search store
        searchStore.reset();

        // Navigate to confirmation
        router.replace({
          pathname: '/booking/confirmation',
          params: { bookingCode: response.data.publicCode },
        });
      } else {
        Alert.alert('Error', response.error || 'Failed to create booking');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Order Summary */}
      <Card style={styles.summaryCard}>
        <Text style={styles.sectionTitle}>Order Summary</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Vehicle</Text>
          <Text style={styles.value}>{result.vehicleName}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Supplier</Text>
          <Text style={styles.value}>{result.supplierName}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>{formatDate(searchStore.pickupDate)}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Time</Text>
          <Text style={styles.value}>{formatTime(searchStore.pickupTime)}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Passengers</Text>
          <Text style={styles.value}>{searchStore.passengers}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>Passenger</Text>
          <Text style={styles.value}>{passenger.name}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Contact</Text>
          <Text style={styles.value}>{passenger.phone}</Text>
        </View>

        {passenger.flightNumber && (
          <View style={styles.row}>
            <Text style={styles.label}>Flight</Text>
            <Text style={styles.value}>{passenger.flightNumber}</Text>
          </View>
        )}
      </Card>

      {/* Promo Code */}
      <Card style={styles.promoCard}>
        <Input
          label="Promo Code"
          value={promoCode}
          onChangeText={setPromoCode}
          placeholder="Enter promo code (optional)"
          autoCapitalize="characters"
        />
      </Card>

      {/* Price Breakdown */}
      <Card style={styles.priceCard}>
        <Text style={styles.sectionTitle}>Price Breakdown</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Transfer Fee</Text>
          <Text style={styles.value}>
            {formatCurrency(result.price, result.currency)}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>
            {formatCurrency(result.price, result.currency)}
          </Text>
        </View>
      </Card>

      {/* Features */}
      <Card style={styles.featuresCard}>
        <View style={styles.feature}>
          <Ionicons name="shield-checkmark" size={20} color={colors.success} />
          <Text style={styles.featureText}>Free cancellation up to 24h before</Text>
        </View>
        <View style={styles.feature}>
          <Ionicons name="airplane" size={20} color={colors.success} />
          <Text style={styles.featureText}>Flight tracking included</Text>
        </View>
        <View style={styles.feature}>
          <Ionicons name="card" size={20} color={colors.success} />
          <Text style={styles.featureText}>Pay on arrival</Text>
        </View>
      </Card>

      {/* Book Button */}
      <View style={styles.buttonContainer}>
        <Button
          title={loading ? 'Processing...' : 'Confirm Booking'}
          onPress={handlePayment}
          loading={loading}
          disabled={loading}
          fullWidth
          size="lg"
        />
        <Text style={styles.termsText}>
          By booking, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  value: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  promoCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  priceCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  featuresCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  featureText: {
    marginLeft: spacing.sm,
    fontSize: 14,
    color: colors.text,
  },
  buttonContainer: {
    padding: spacing.md,
  },
  termsText: {
    marginTop: spacing.md,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    marginBottom: spacing.md,
  },
});
