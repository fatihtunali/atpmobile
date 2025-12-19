import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Input, colors, spacing } from '@shared/components';
import { useSearchStore } from '@shared/stores';
import { formatCurrency, formatDate, formatTime, isValidEmail, isValidPhone } from '@shared/utils';
import type { SearchResult } from '@shared/types';

export default function BookingDetailsScreen() {
  const params = useLocalSearchParams();
  const searchStore = useSearchStore();

  const result: SearchResult = params.result
    ? JSON.parse(params.result as string)
    : null;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [flightNumber, setFlightNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!result) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Invalid booking data</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    }
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!isValidPhone(phone)) {
      newErrors.phone = 'Invalid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) return;

    router.push({
      pathname: '/booking/payment',
      params: {
        result: JSON.stringify(result),
        passenger: JSON.stringify({
          name,
          email,
          phone,
          flightNumber,
          notes,
        }),
      },
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.scrollView}>
        {/* Trip Summary */}
        <Card style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Trip Summary</Text>

          <View style={styles.routeRow}>
            <View style={styles.routePoint}>
              <View style={styles.routeDot} />
              <Text style={styles.routeLabel}>Pickup</Text>
            </View>
            <Text style={styles.routeValue} numberOfLines={2}>
              {searchStore.pickupType === 'airport'
                ? searchStore.pickupAirport?.name
                : searchStore.pickupAddress}
            </Text>
          </View>

          <View style={styles.routeRow}>
            <View style={styles.routePoint}>
              <View style={[styles.routeDot, styles.routeDotDest]} />
              <Text style={styles.routeLabel}>Dropoff</Text>
            </View>
            <Text style={styles.routeValue} numberOfLines={2}>
              {searchStore.dropoffType === 'airport'
                ? searchStore.dropoffAirport?.name
                : searchStore.dropoffAddress}
            </Text>
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.detail}>
              <Ionicons name="calendar" size={18} color={colors.primary} />
              <Text style={styles.detailText}>{formatDate(searchStore.pickupDate)}</Text>
            </View>
            <View style={styles.detail}>
              <Ionicons name="time" size={18} color={colors.primary} />
              <Text style={styles.detailText}>{formatTime(searchStore.pickupTime)}</Text>
            </View>
            <View style={styles.detail}>
              <Ionicons name="people" size={18} color={colors.primary} />
              <Text style={styles.detailText}>{searchStore.passengers}</Text>
            </View>
          </View>
        </Card>

        {/* Vehicle Info */}
        <Card style={styles.vehicleCard}>
          <View style={styles.vehicleRow}>
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleName}>{result.vehicleName}</Text>
              <Text style={styles.supplierName}>{result.supplierName}</Text>
            </View>
            <View style={styles.priceInfo}>
              <Text style={styles.price}>
                {formatCurrency(result.price, result.currency)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Passenger Details */}
        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Passenger Details</Text>

          <Input
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="Enter full name"
            autoCapitalize="words"
            error={errors.name}
          />

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email address"
            keyboardType="email-address"
            error={errors.email}
          />

          <Input
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            placeholder="+1 234 567 8900"
            keyboardType="phone-pad"
            error={errors.phone}
          />

          <Input
            label="Flight Number (Optional)"
            value={flightNumber}
            onChangeText={setFlightNumber}
            placeholder="e.g., TK1234"
            autoCapitalize="characters"
          />

          <Input
            label="Special Requests (Optional)"
            value={notes}
            onChangeText={setNotes}
            placeholder="Child seat, extra luggage, etc."
            multiline
            numberOfLines={3}
          />
        </Card>

        {/* Continue Button */}
        <View style={styles.buttonContainer}>
          <Button
            title="Continue to Payment"
            onPress={handleContinue}
            fullWidth
            size="lg"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
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
  routeRow: {
    marginBottom: spacing.md,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
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
  routeLabel: {
    fontSize: 12,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  routeValue: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 18,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 6,
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  vehicleCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  vehicleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  supplierName: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  formCard: {
    marginHorizontal: spacing.md,
    padding: spacing.md,
  },
  buttonContainer: {
    padding: spacing.md,
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
