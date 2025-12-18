import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Input, colors, spacing } from '@shared/components';
import { useSearchStore } from '@shared/stores';
import { formatDate } from '@shared/utils';

export default function HomeScreen() {
  const {
    pickupType,
    dropoffType,
    pickupAirport,
    dropoffAirport,
    pickupAddress,
    dropoffAddress,
    pickupDate,
    pickupTime,
    passengers,
    setPickupType,
    setDropoffType,
    swapLocations,
  } = useSearchStore();

  const handleSearch = () => {
    // Validate and navigate to results
    router.push('/search/results');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Book Your Airport Transfer</Text>
        <Text style={styles.heroSubtitle}>
          Reliable transfers to and from airports worldwide
        </Text>
      </View>

      {/* Search Card */}
      <Card style={styles.searchCard}>
        {/* Pickup */}
        <View style={styles.locationSection}>
          <View style={styles.locationHeader}>
            <View style={styles.locationDot} />
            <Text style={styles.locationLabel}>Pickup</Text>
          </View>

          <View style={styles.typeToggle}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                pickupType === 'airport' && styles.typeButtonActive,
              ]}
              onPress={() => setPickupType('airport')}
            >
              <Ionicons
                name="airplane"
                size={16}
                color={pickupType === 'airport' ? colors.primary : colors.textMuted}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  pickupType === 'airport' && styles.typeButtonTextActive,
                ]}
              >
                Airport
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                pickupType === 'address' && styles.typeButtonActive,
              ]}
              onPress={() => setPickupType('address')}
            >
              <Ionicons
                name="location"
                size={16}
                color={pickupType === 'address' ? colors.primary : colors.textMuted}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  pickupType === 'address' && styles.typeButtonTextActive,
                ]}
              >
                Address
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.locationInput}>
            <Ionicons name="search" size={20} color={colors.textMuted} />
            <Text style={styles.locationInputText}>
              {pickupType === 'airport'
                ? pickupAirport?.name || 'Select airport'
                : pickupAddress || 'Enter address'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Swap Button */}
        <TouchableOpacity style={styles.swapButton} onPress={swapLocations}>
          <Ionicons name="swap-vertical" size={20} color={colors.primary} />
        </TouchableOpacity>

        {/* Dropoff */}
        <View style={styles.locationSection}>
          <View style={styles.locationHeader}>
            <View style={[styles.locationDot, styles.locationDotDestination]} />
            <Text style={styles.locationLabel}>Dropoff</Text>
          </View>

          <View style={styles.typeToggle}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                dropoffType === 'airport' && styles.typeButtonActive,
              ]}
              onPress={() => setDropoffType('airport')}
            >
              <Ionicons
                name="airplane"
                size={16}
                color={dropoffType === 'airport' ? colors.primary : colors.textMuted}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  dropoffType === 'airport' && styles.typeButtonTextActive,
                ]}
              >
                Airport
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                dropoffType === 'address' && styles.typeButtonActive,
              ]}
              onPress={() => setDropoffType('address')}
            >
              <Ionicons
                name="location"
                size={16}
                color={dropoffType === 'address' ? colors.primary : colors.textMuted}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  dropoffType === 'address' && styles.typeButtonTextActive,
                ]}
              >
                Address
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.locationInput}>
            <Ionicons name="search" size={20} color={colors.textMuted} />
            <Text style={styles.locationInputText}>
              {dropoffType === 'airport'
                ? dropoffAirport?.name || 'Select airport'
                : dropoffAddress || 'Enter address'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Date, Time, Passengers */}
        <View style={styles.detailsRow}>
          <TouchableOpacity style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={20} color={colors.textMuted} />
            <Text style={styles.detailText}>{formatDate(pickupDate)}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.detailItem}>
            <Ionicons name="time-outline" size={20} color={colors.textMuted} />
            <Text style={styles.detailText}>{pickupTime}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.detailItem}>
            <Ionicons name="people-outline" size={20} color={colors.textMuted} />
            <Text style={styles.detailText}>{passengers}</Text>
          </TouchableOpacity>
        </View>

        {/* Search Button */}
        <Button
          title="Search Transfers"
          onPress={handleSearch}
          fullWidth
          size="lg"
        />
      </Card>

      {/* Features */}
      <View style={styles.features}>
        <View style={styles.feature}>
          <View style={styles.featureIcon}>
            <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
          </View>
          <Text style={styles.featureTitle}>Safe & Reliable</Text>
          <Text style={styles.featureText}>Licensed drivers & vehicles</Text>
        </View>

        <View style={styles.feature}>
          <View style={styles.featureIcon}>
            <Ionicons name="pricetag" size={24} color={colors.primary} />
          </View>
          <Text style={styles.featureTitle}>Fixed Prices</Text>
          <Text style={styles.featureText}>No hidden charges</Text>
        </View>

        <View style={styles.feature}>
          <View style={styles.featureIcon}>
            <Ionicons name="time" size={24} color={colors.primary} />
          </View>
          <Text style={styles.featureTitle}>24/7 Service</Text>
          <Text style={styles.featureText}>Flight monitoring</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hero: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  searchCard: {
    margin: spacing.md,
    padding: spacing.lg,
  },
  locationSection: {
    marginBottom: spacing.md,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    marginRight: spacing.sm,
  },
  locationDotDestination: {
    backgroundColor: colors.secondary,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  typeToggle: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: spacing.sm,
    backgroundColor: colors.background,
  },
  typeButtonActive: {
    backgroundColor: `${colors.primary}15`,
  },
  typeButtonText: {
    fontSize: 13,
    color: colors.textMuted,
    marginLeft: 4,
  },
  typeButtonTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 12,
  },
  locationInputText: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 15,
    color: colors.textSecondary,
  },
  swapButton: {
    position: 'absolute',
    right: spacing.lg,
    top: 120,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: spacing.xs,
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  feature: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
    textAlign: 'center',
  },
  featureText: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
