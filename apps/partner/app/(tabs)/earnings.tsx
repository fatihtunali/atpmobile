import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Loading, colors, spacing } from '@shared/components';
import { partnerApi } from '@shared/api';
import { formatCurrency, formatDate } from '@shared/utils';
import type { EarningsSummary, Transaction } from '@shared/types';

type PeriodFilter = 'today' | 'week' | 'month' | 'year';

const PERIODS: { key: PeriodFilter; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'year', label: 'Year' },
];

interface EarningsData {
  summary: EarningsSummary;
  transactions: Transaction[];
}

export default function EarningsScreen() {
  const [data, setData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<PeriodFilter>('month');

  useEffect(() => {
    loadEarnings();
  }, [period]);

  const loadEarnings = async () => {
    const response = await partnerApi.getEarnings(period);
    if (response.success && response.data) {
      setData(response.data);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEarnings();
    setRefreshing(false);
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {PERIODS.map((p) => (
          <TouchableOpacity
            key={p.key}
            style={[
              styles.periodButton,
              period === p.key && styles.periodButtonActive,
            ]}
            onPress={() => {
              setPeriod(p.key);
              setLoading(true);
            }}
          >
            <Text
              style={[
                styles.periodButtonText,
                period === p.key && styles.periodButtonTextActive,
              ]}
            >
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Earnings Summary */}
      {data?.summary && (
        <>
          <Card style={styles.mainEarningsCard}>
            <Text style={styles.mainEarningsLabel}>
              {period === 'today'
                ? "Today's Earnings"
                : period === 'week'
                ? 'This Week'
                : period === 'month'
                ? 'This Month'
                : 'This Year'}
            </Text>
            <Text style={styles.mainEarningsValue}>
              {formatCurrency(
                period === 'today'
                  ? data.summary.today
                  : period === 'week'
                  ? data.summary.thisWeek
                  : period === 'month'
                  ? data.summary.thisMonth
                  : data.summary.total,
                data.summary.currency
              )}
            </Text>
          </Card>

          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <Ionicons name="cash-outline" size={24} color={colors.success} />
              <Text style={styles.statValue}>
                {formatCurrency(data.summary.total, data.summary.currency)}
              </Text>
              <Text style={styles.statLabel}>Total Earned</Text>
            </Card>
            <Card style={styles.statCard}>
              <Ionicons name="time-outline" size={24} color={colors.warning} />
              <Text style={styles.statValue}>
                {formatCurrency(data.summary.pendingPayout, data.summary.currency)}
              </Text>
              <Text style={styles.statLabel}>Pending Payout</Text>
            </Card>
          </View>
        </>
      )}

      {/* Transactions */}
      <View style={styles.transactionsSection}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>

        {data?.transactions && data.transactions.length > 0 ? (
          data.transactions.map((transaction) => (
            <Card key={transaction.id} style={styles.transactionCard}>
              <View style={styles.transactionIcon}>
                <Ionicons
                  name={
                    transaction.type === 'earning'
                      ? 'arrow-down'
                      : transaction.type === 'payout'
                      ? 'arrow-up'
                      : 'remove'
                  }
                  size={20}
                  color={
                    transaction.type === 'earning'
                      ? colors.success
                      : transaction.type === 'payout'
                      ? colors.primary
                      : colors.error
                  }
                />
              </View>
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionDescription}>
                  {transaction.description}
                </Text>
                <Text style={styles.transactionDate}>
                  {formatDate(transaction.date)}
                </Text>
              </View>
              <Text
                style={[
                  styles.transactionAmount,
                  transaction.type === 'earning' && styles.amountPositive,
                  transaction.type === 'deduction' && styles.amountNegative,
                ]}
              >
                {transaction.type === 'earning' ? '+' : '-'}
                {formatCurrency(transaction.amount, transaction.currency)}
              </Text>
            </Card>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Ionicons name="wallet-outline" size={40} color={colors.border} />
            <Text style={styles.emptyText}>No transactions yet</Text>
          </Card>
        )}
      </View>

      {/* Payout Info */}
      <Card style={styles.payoutInfoCard}>
        <View style={styles.payoutInfoHeader}>
          <Ionicons name="information-circle" size={20} color={colors.primary} />
          <Text style={styles.payoutInfoTitle}>Payout Information</Text>
        </View>
        <Text style={styles.payoutInfoText}>
          Payouts are processed weekly on Mondays. Minimum payout amount is €50.
          Make sure your bank details are up to date in your profile.
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  periodSelector: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
  },
  periodButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  periodButtonActive: {
    backgroundColor: colors.primary,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textMuted,
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  mainEarningsCard: {
    margin: spacing.md,
    marginTop: 0,
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  mainEarningsLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  mainEarningsValue: {
    fontSize: 42,
    fontWeight: '700',
    color: '#fff',
    marginTop: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.lg,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  transactionsSection: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  transactionDate: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  amountPositive: {
    color: colors.success,
  },
  amountNegative: {
    color: colors.error,
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  payoutInfoCard: {
    margin: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.primaryLight,
  },
  payoutInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  payoutInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: spacing.sm,
  },
  payoutInfoText: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 20,
  },
});
