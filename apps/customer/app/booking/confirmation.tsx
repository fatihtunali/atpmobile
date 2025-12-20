import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Share,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Loading, Badge, colors, spacing } from '@shared/components';
import { customerApi } from '@shared/api';
import { formatCurrency, formatDate, formatTime, getBookingStatusLabel } from '@shared/utils';
import { scale, verticalScale, scaleFontSize } from '@shared/utils/responsive';
import { useAuthStore } from '@shared/stores';
import type { Booking } from '@shared/types';

export default function ConfirmationScreen() {
  const params = useLocalSearchParams();
  const bookingCode = params.bookingCode as string;
  const customerEmail = params.email as string;
  const customerName = params.name as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  // Account creation state
  const { isAuthenticated } = useAuthStore();
  const [accountStep, setAccountStep] = useState<'prompt' | 'form' | 'login' | 'success' | 'hidden'>(
    isAuthenticated ? 'hidden' : 'prompt'
  );
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountError, setAccountError] = useState('');

  useEffect(() => {
    fetchBooking();
  }, [bookingCode]);

  const fetchBooking = async () => {
    if (!bookingCode || !customerEmail) return;

    try {
      const response = await customerApi.getBooking(bookingCode, customerEmail);
      if (response.success && response.data) {
        setBooking(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `My airport transfer booking: ${bookingCode}\nTrack it at: https://airporttransferportal.com/track/${bookingCode}`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleTrack = () => {
    router.push({
      pathname: '/tracking/[code]',
      params: { code: bookingCode },
    });
  };

  const handleDone = () => {
    router.replace('/(tabs)');
  };

  const handleCreateAccount = async () => {
    if (password.length < 8) {
      setAccountError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setAccountError('Passwords do not match');
      return;
    }

    setAccountLoading(true);
    setAccountError('');

    try {
      const response = await customerApi.convertGuest({
        bookingCode,
        email: customerEmail,
        password,
        name: customerName,
      });

      if (response.success && response.data?.success) {
        setAccountStep('success');
      } else if (response.data?.accountExists) {
        setAccountStep('login');
      } else {
        setAccountError(response.data?.error || response.error || 'Failed to create account');
      }
    } catch (error) {
      setAccountError('Something went wrong. Please try again.');
    } finally {
      setAccountLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    router.push({
      pathname: '/auth/login',
      params: { email: customerEmail },
    });
  };

  const renderAccountPrompt = () => {
    if (accountStep === 'hidden') return null;

    return (
      <Card style={styles.accountCard}>
        {accountStep === 'prompt' && (
          <>
            <View style={styles.accountHeader}>
              <View style={styles.accountIconContainer}>
                <Ionicons name="person-add" size={24} color={colors.primary} />
              </View>
              <Text style={styles.accountTitle}>Create Your Account</Text>
            </View>
            <Text style={styles.accountSubtitle}>
              Save your details for faster bookings next time
            </Text>

            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <Ionicons name="time-outline" size={18} color={colors.success} />
                <Text style={styles.benefitText}>Track all your bookings in one place</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="flash-outline" size={18} color={colors.success} />
                <Text style={styles.benefitText}>Faster checkout with saved details</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="star-outline" size={18} color={colors.success} />
                <Text style={styles.benefitText}>Earn loyalty points on bookings</Text>
              </View>
            </View>

            <Button
              title="Create Account"
              onPress={() => setAccountStep('form')}
              fullWidth
              size="lg"
            />
            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => setAccountStep('hidden')}
            >
              <Text style={styles.skipText}>Maybe Later</Text>
            </TouchableOpacity>
          </>
        )}

        {accountStep === 'form' && (
          <>
            <Text style={styles.accountTitle}>Set Your Password</Text>
            <Text style={styles.accountSubtitle}>
              We'll use {customerEmail} for your account
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                autoCapitalize="none"
              />
            </View>

            {accountError ? (
              <Text style={styles.errorText}>{accountError}</Text>
            ) : null}

            <Button
              title={accountLoading ? 'Creating...' : 'Create Account'}
              onPress={handleCreateAccount}
              fullWidth
              size="lg"
              disabled={accountLoading}
            />
            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => setAccountStep('prompt')}
            >
              <Text style={styles.skipText}>Back</Text>
            </TouchableOpacity>
          </>
        )}

        {accountStep === 'login' && (
          <>
            <View style={styles.accountHeader}>
              <View style={styles.accountIconContainer}>
                <Ionicons name="information-circle" size={24} color={colors.warning} />
              </View>
              <Text style={styles.accountTitle}>Account Exists</Text>
            </View>
            <Text style={styles.accountSubtitle}>
              An account with this email already exists. Please login to link this booking.
            </Text>

            <Button
              title="Login"
              onPress={handleLoginRedirect}
              fullWidth
              size="lg"
            />
            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => setAccountStep('hidden')}
            >
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </>
        )}

        {accountStep === 'success' && (
          <>
            <View style={styles.accountHeader}>
              <View style={[styles.accountIconContainer, { backgroundColor: `${colors.success}15` }]}>
                <Ionicons name="checkmark-circle" size={24} color={colors.success} />
              </View>
              <Text style={styles.accountTitle}>Account Created!</Text>
            </View>
            <Text style={styles.accountSubtitle}>
              Your account has been created. You can now login to manage your bookings.
            </Text>

            <Button
              title="Login Now"
              onPress={handleLoginRedirect}
              fullWidth
              size="lg"
            />
            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => setAccountStep('hidden')}
            >
              <Text style={styles.skipText}>Continue as Guest</Text>
            </TouchableOpacity>
          </>
        )}
      </Card>
    );
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Success Header */}
      <View style={styles.successHeader}>
        <View style={styles.checkCircle}>
          <Ionicons name="checkmark" size={48} color="#fff" />
        </View>
        <Text style={styles.successTitle}>Booking Confirmed!</Text>
        <Text style={styles.bookingCode}>#{bookingCode}</Text>
      </View>

      {/* Booking Details */}
      <Card style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>Booking Details</Text>

        {booking && (
          <>
            <View style={styles.statusRow}>
              <Text style={styles.label}>Status</Text>
              <Badge
                label={getBookingStatusLabel(booking.status)}
                variant="success"
              />
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Pickup</Text>
              <Text style={styles.value}>{booking.pickupLocation.name}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Dropoff</Text>
              <Text style={styles.value}>{booking.dropoffLocation.name}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Date</Text>
              <Text style={styles.value}>{formatDate(booking.pickupDate)}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Time</Text>
              <Text style={styles.value}>{formatTime(booking.pickupTime)}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Vehicle</Text>
              <Text style={styles.value}>{booking.vehicleType}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Passengers</Text>
              <Text style={styles.value}>{booking.passengers}</Text>
            </View>

            {booking.flightNumber && (
              <View style={styles.row}>
                <Text style={styles.label}>Flight</Text>
                <Text style={styles.value}>{booking.flightNumber}</Text>
              </View>
            )}

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(booking.price, booking.currency)}
              </Text>
            </View>
          </>
        )}
      </Card>

      {/* What's Next */}
      <Card style={styles.nextCard}>
        <Text style={styles.sectionTitle}>What's Next?</Text>

        <View style={styles.nextItem}>
          <View style={styles.nextIcon}>
            <Ionicons name="mail" size={20} color={colors.primary} />
          </View>
          <View style={styles.nextContent}>
            <Text style={styles.nextTitle}>Confirmation Email</Text>
            <Text style={styles.nextText}>
              You'll receive a confirmation email with all the details
            </Text>
          </View>
        </View>

        <View style={styles.nextItem}>
          <View style={styles.nextIcon}>
            <Ionicons name="person" size={20} color={colors.primary} />
          </View>
          <View style={styles.nextContent}>
            <Text style={styles.nextTitle}>Driver Assignment</Text>
            <Text style={styles.nextText}>
              A driver will be assigned before your pickup time
            </Text>
          </View>
        </View>

        <View style={styles.nextItem}>
          <View style={styles.nextIcon}>
            <Ionicons name="navigate" size={20} color={colors.primary} />
          </View>
          <View style={styles.nextContent}>
            <Text style={styles.nextTitle}>Track Your Ride</Text>
            <Text style={styles.nextText}>
              Use the tracking feature to see your driver's location
            </Text>
          </View>
        </View>
      </Card>

      {/* Account Creation Prompt */}
      {renderAccountPrompt()}

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          title="Track Booking"
          onPress={handleTrack}
          fullWidth
          size="lg"
        />
        <View style={styles.buttonRow}>
          <Button
            title="Share"
            onPress={handleShare}
            variant="outline"
            style={styles.halfButton}
            icon={<Ionicons name="share-outline" size={20} color={colors.primary} />}
          />
          <Button
            title="Done"
            onPress={handleDone}
            variant="ghost"
            style={styles.halfButton}
          />
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
  successHeader: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.surface,
  },
  checkCircle: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  successTitle: {
    fontSize: scaleFontSize(24),
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  bookingCode: {
    fontSize: scaleFontSize(16),
    color: colors.primary,
    fontWeight: '600',
  },
  detailsCard: {
    margin: spacing.md,
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: scaleFontSize(16),
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    textAlign: 'right',
    flex: 1,
    marginLeft: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
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
  nextCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  nextItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  nextIcon: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  nextContent: {
    flex: 1,
  },
  nextTitle: {
    fontSize: scaleFontSize(14),
    fontWeight: '600',
    color: colors.text,
    marginBottom: scale(2),
  },
  nextText: {
    fontSize: scaleFontSize(13),
    color: colors.textSecondary,
  },
  buttonContainer: {
    padding: spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  halfButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  // Account prompt styles
  accountCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  accountIconContainer: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  accountTitle: {
    fontSize: scaleFontSize(18),
    fontWeight: '600',
    color: colors.text,
  },
  accountSubtitle: {
    fontSize: scaleFontSize(14),
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  benefitsList: {
    marginBottom: spacing.lg,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  benefitText: {
    fontSize: scaleFontSize(14),
    color: colors.text,
    marginLeft: spacing.sm,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: scale(8),
    padding: spacing.md,
    fontSize: scaleFontSize(16),
    color: colors.text,
  },
  errorText: {
    fontSize: scaleFontSize(13),
    color: colors.error,
    marginBottom: spacing.md,
  },
  skipButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  skipText: {
    fontSize: scaleFontSize(14),
    color: colors.textSecondary,
  },
});
