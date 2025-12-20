import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Input, Loading, colors, spacing } from '@shared/components';
import { useSearchStore } from '@shared/stores';
import { customerApi } from '@shared/api';
import { formatCurrency, formatDate, formatTime } from '@shared/utils';
import { scale, verticalScale, scaleFontSize } from '@shared/utils/responsive';
import type { SearchResult, PaymentMethod, PaymentMethodType } from '@shared/types';

// Icon mapping for payment methods
const PAYMENT_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  card: 'card',
  bank: 'business',
  crypto: 'logo-bitcoin',
  CARD: 'card',
  BANK_TRANSFER: 'business',
  CRYPTO: 'logo-bitcoin',
};

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
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(true);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType | null>(null);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await customerApi.getPaymentMethods();
        if (response.success && response.data) {
          const enabledMethods = response.data.filter((m) => m.isEnabled);
          setPaymentMethods(enabledMethods);
          if (enabledMethods.length > 0) {
            setSelectedPaymentMethod(enabledMethods[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch payment methods:', error);
      } finally {
        setLoadingPaymentMethods(false);
      }
    };

    fetchPaymentMethods();
  }, []);

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
        paymentMethod: selectedPaymentMethod || undefined,
      });

      if (response.success && response.data) {
        const bookingCode = response.data.publicCode;
        
        // Check if payment is required
        if (response.data.status === 'AWAITING_PAYMENT' || response.data.paymentStatus === 'PENDING') {
          // Navigate to payment processing page with booking code and payment method
          router.replace({
            pathname: '/booking/process-payment',
            params: {
              bookingCode,
              email: passenger.email,
              name: passenger.name,
              paymentMethod: selectedPaymentMethod,
              amount: result.price.toString(),
              currency: result.currency,
            },
          });
        } else {
          // Already paid/confirmed - go to confirmation
          searchStore.reset();
          router.replace({
            pathname: '/booking/confirmation',
            params: { bookingCode, email: passenger.email, name: passenger.name },
          });
        }
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

      {/* Payment Method Selection */}
      <Card style={styles.paymentMethodCard}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        {loadingPaymentMethods ? (
          <View style={styles.loadingContainer}>
            <Loading />
          </View>
        ) : paymentMethods.length === 0 ? (
          <Text style={styles.noMethodsText}>No payment methods available</Text>
        ) : (
          paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentOption,
                selectedPaymentMethod === method.id && styles.paymentOptionSelected,
              ]}
              onPress={() => setSelectedPaymentMethod(method.id)}
            >
              <View style={styles.paymentOptionLeft}>
                <View style={[
                  styles.paymentIconContainer,
                  selectedPaymentMethod === method.id && styles.paymentIconContainerSelected,
                ]}>
                  <Ionicons
                    name={PAYMENT_ICONS[method.icon] || PAYMENT_ICONS[method.id] || 'card'}
                    size={24}
                    color={selectedPaymentMethod === method.id ? colors.primary : colors.textSecondary}
                  />
                </View>
                <View style={styles.paymentOptionText}>
                  <Text style={[
                    styles.paymentOptionTitle,
                    selectedPaymentMethod === method.id && styles.paymentOptionTitleSelected,
                  ]}>
                    {method.title}
                  </Text>
                  <Text style={styles.paymentOptionSubtitle}>{method.subtitle}</Text>
                </View>
              </View>
              <View style={[
                styles.radioOuter,
                selectedPaymentMethod === method.id && styles.radioOuterSelected,
              ]}>
                {selectedPaymentMethod === method.id && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          ))
        )}
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
          <Ionicons name="lock-closed" size={20} color={colors.success} />
          <Text style={styles.featureText}>Secure payment processing</Text>
        </View>
      </Card>

      {/* Book Button */}
      <View style={styles.buttonContainer}>
        <Button
          title={loading ? 'Processing...' : 'Confirm Booking'}
          onPress={handlePayment}
          loading={loading}
          disabled={loading || !selectedPaymentMethod || loadingPaymentMethods}
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
    fontSize: scaleFontSize(16),
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
    fontSize: scaleFontSize(14),
    color: colors.textSecondary,
  },
  value: {
    fontSize: scaleFontSize(14),
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
  paymentMethodCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  loadingContainer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  noMethodsText: {
    fontSize: scaleFontSize(14),
    color: colors.textMuted,
    textAlign: 'center',
    padding: spacing.md,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  paymentOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}08`,
  },
  paymentOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  paymentIconContainerSelected: {
    backgroundColor: `${colors.primary}15`,
  },
  paymentOptionText: {
    flex: 1,
  },
  paymentOptionTitle: {
    fontSize: scaleFontSize(15),
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  paymentOptionTitleSelected: {
    color: colors.primary,
  },
  paymentOptionSubtitle: {
    fontSize: scaleFontSize(12),
    color: colors.textSecondary,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
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
    fontSize: scaleFontSize(18),
    fontWeight: '600',
    color: colors.text,
  },
  totalValue: {
    fontSize: scaleFontSize(24),
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
    fontSize: scaleFontSize(14),
    color: colors.text,
  },
  buttonContainer: {
    padding: spacing.md,
  },
  termsText: {
    marginTop: spacing.md,
    fontSize: scaleFontSize(12),
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
    fontSize: scaleFontSize(16),
    color: colors.error,
    marginBottom: spacing.md,
  },
});
