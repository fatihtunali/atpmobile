import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  Clipboard,
  TouchableOpacity,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { Button, Card, Loading, colors, spacing } from '@shared/components';
import { customerApi } from '@shared/api';
import { useSearchStore } from '@shared/stores';
import { formatCurrency } from '@shared/utils';
import { scaleFontSize } from '@shared/utils/responsive';

export default function ProcessPaymentScreen() {
  const params = useLocalSearchParams();
  const searchStore = useSearchStore();

  const bookingCode = params.bookingCode as string;
  const paymentMethod = params.paymentMethod as string;
  const amount = parseFloat(params.amount as string);
  const currency = params.currency as string;
  const customerEmail = params.email as string;
  const customerName = params.name as string;

  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<{
    clientSecret?: string;
    bankDetails?: { bankName: string; iban: string; accountName: string; reference: string };
    cryptoAddress?: string;
    cryptoCurrency?: string;
    paymentUrl?: string;
  } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  useEffect(() => {
    initializePayment();
  }, []);

  // Open payment page in in-app browser (stays within the app)
  const openPaymentBrowser = async (url: string) => {
    try {
      const result = await WebBrowser.openBrowserAsync(url, {
        showTitle: true,
        enableBarCollapsing: true,
        dismissButtonStyle: 'close',
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
      });

      // When user closes the browser, check if they completed payment
      if (result.type === 'cancel' || result.type === 'dismiss') {
        // User closed the browser - they may have completed payment
        setPaymentCompleted(true);
      }
    } catch (error) {
      console.error('Failed to open browser:', error);
    }
  };

  const initializePayment = async () => {
    try {
      const response = await customerApi.createPaymentIntent(
        bookingCode,
        paymentMethod as 'CARD' | 'BANK_TRANSFER' | 'CRYPTO'
      );

      if (response.success && response.data) {
        setPaymentData(response.data);

        // For card payments, automatically open the in-app payment browser
        if (paymentMethod === 'CARD' && response.data.paymentUrl) {
          openPaymentBrowser(response.data.paymentUrl);
        }
      } else {
        Alert.alert('Error', response.error || 'Failed to initialize payment');
        router.back();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to initialize payment');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    Clipboard.setString(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const handlePaymentComplete = () => {
    searchStore.reset();
    router.replace({
      pathname: '/booking/confirmation',
      params: { bookingCode, email: customerEmail, name: customerName },
    });
  };

  const handleOpenPaymentPage = () => {
    // For card payments, open the payment page in in-app browser
    const paymentUrl = `https://airporttransferportal.com/pay/${bookingCode}`;
    openPaymentBrowser(paymentUrl);
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons
          name={paymentMethod === 'CARD' ? 'card' : paymentMethod === 'CRYPTO' ? 'logo-bitcoin' : 'business'}
          size={48}
          color={colors.primary}
        />
        <Text style={styles.headerTitle}>Complete Payment</Text>
        <Text style={styles.headerSubtitle}>Booking #{bookingCode}</Text>
      </View>

      <Card style={styles.amountCard}>
        <Text style={styles.amountLabel}>Amount Due</Text>
        <Text style={styles.amountValue}>{formatCurrency(amount, currency)}</Text>
      </Card>

      {/* Card Payment Instructions */}
      {paymentMethod === 'CARD' && (
        <Card style={styles.instructionsCard}>
          <Text style={styles.sectionTitle}>Credit Card Payment</Text>
          <Text style={styles.instructionText}>
            Click the button below to open the secure payment page. After completing payment, return here and tap "Payment Complete".
          </Text>

          <Button
            title="Open Payment Page"
            onPress={handleOpenPaymentPage}
            fullWidth
            style={styles.actionButton}
            icon={<Ionicons name="open-outline" size={20} color="#fff" />}
          />
        </Card>
      )}

      {/* Bank Transfer Instructions */}
      {paymentMethod === 'BANK_TRANSFER' && paymentData?.bankDetails && (
        <Card style={styles.instructionsCard}>
          <Text style={styles.sectionTitle}>Bank Transfer Details</Text>
          <Text style={styles.instructionText}>
            Please transfer the exact amount to the following account:
          </Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Bank Name</Text>
            <TouchableOpacity
              style={styles.detailValueContainer}
              onPress={() => copyToClipboard(paymentData.bankDetails!.bankName, 'bankName')}
            >
              <Text style={styles.detailValue}>{paymentData.bankDetails.bankName}</Text>
              <Ionicons
                name={copied === 'bankName' ? 'checkmark' : 'copy-outline'}
                size={16}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Account Name</Text>
            <TouchableOpacity
              style={styles.detailValueContainer}
              onPress={() => copyToClipboard(paymentData.bankDetails!.accountName, 'accountName')}
            >
              <Text style={styles.detailValue}>{paymentData.bankDetails.accountName}</Text>
              <Ionicons
                name={copied === 'accountName' ? 'checkmark' : 'copy-outline'}
                size={16}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>IBAN</Text>
            <TouchableOpacity
              style={styles.detailValueContainer}
              onPress={() => copyToClipboard(paymentData.bankDetails!.iban, 'iban')}
            >
              <Text style={styles.detailValue}>{paymentData.bankDetails.iban}</Text>
              <Ionicons
                name={copied === 'iban' ? 'checkmark' : 'copy-outline'}
                size={16}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Reference</Text>
            <TouchableOpacity
              style={styles.detailValueContainer}
              onPress={() => copyToClipboard(paymentData.bankDetails!.reference, 'reference')}
            >
              <Text style={[styles.detailValue, styles.referenceValue]}>{paymentData.bankDetails.reference}</Text>
              <Ionicons
                name={copied === 'reference' ? 'checkmark' : 'copy-outline'}
                size={16}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.warningText}>
            Important: Include the reference number in your transfer description.
          </Text>
        </Card>
      )}

      {/* Crypto Payment Instructions */}
      {paymentMethod === 'CRYPTO' && paymentData?.cryptoAddress && (
        <Card style={styles.instructionsCard}>
          <Text style={styles.sectionTitle}>Cryptocurrency Payment</Text>
          <Text style={styles.instructionText}>
            Send the exact amount in {paymentData.cryptoCurrency || 'USDT'} to the following address:
          </Text>

          <View style={styles.cryptoAddressContainer}>
            <Text style={styles.cryptoAddress}>{paymentData.cryptoAddress}</Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() => copyToClipboard(paymentData.cryptoAddress!, 'crypto')}
            >
              <Ionicons
                name={copied === 'crypto' ? 'checkmark' : 'copy-outline'}
                size={20}
                color={colors.primary}
              />
              <Text style={styles.copyButtonText}>
                {copied === 'crypto' ? 'Copied!' : 'Copy'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.warningText}>
            Only send {paymentData.cryptoCurrency || 'USDT'} (TRC20) to this address. Sending other currencies will result in loss of funds.
          </Text>
        </Card>
      )}

      {/* Complete Button */}
      <View style={styles.buttonContainer}>
        <Button
          title="I've Completed Payment"
          onPress={handlePaymentComplete}
          fullWidth
          size="lg"
        />
        <Text style={styles.helperText}>
          Your booking will be confirmed once payment is verified.
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
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.surface,
  },
  headerTitle: {
    fontSize: scaleFontSize(22),
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.md,
  },
  headerSubtitle: {
    fontSize: scaleFontSize(14),
    color: colors.primary,
    marginTop: spacing.xs,
  },
  amountCard: {
    margin: spacing.md,
    padding: spacing.lg,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: scaleFontSize(14),
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  amountValue: {
    fontSize: scaleFontSize(32),
    fontWeight: '700',
    color: colors.primary,
  },
  instructionsCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: scaleFontSize(16),
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  instructionText: {
    fontSize: scaleFontSize(14),
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  actionButton: {
    marginTop: spacing.sm,
  },
  detailRow: {
    marginBottom: spacing.md,
  },
  detailLabel: {
    fontSize: scaleFontSize(12),
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  detailValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: 8,
  },
  detailValue: {
    fontSize: scaleFontSize(14),
    fontWeight: '500',
    color: colors.text,
    flex: 1,
  },
  referenceValue: {
    fontFamily: 'monospace',
    color: colors.primary,
    fontWeight: '700',
  },
  warningText: {
    fontSize: scaleFontSize(12),
    color: colors.warning,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
  cryptoAddressContainer: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  cryptoAddress: {
    fontSize: scaleFontSize(12),
    fontFamily: 'monospace',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    backgroundColor: `${colors.primary}15`,
    borderRadius: 8,
  },
  copyButtonText: {
    marginLeft: spacing.xs,
    fontSize: scaleFontSize(14),
    color: colors.primary,
    fontWeight: '500',
  },
  buttonContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  helperText: {
    marginTop: spacing.sm,
    fontSize: scaleFontSize(12),
    color: colors.textMuted,
    textAlign: 'center',
  },
});
