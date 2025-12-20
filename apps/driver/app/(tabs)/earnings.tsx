import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Loading, colors, spacing } from '@shared/components';
import { driverApi } from '@shared/api';
import { formatCurrency, formatDate } from '@shared/utils';
import { scale, verticalScale, scaleFontSize } from '@shared/utils/responsive';
import type { EarningsSummary, EarningsTransaction } from '@shared/types';

export default function EarningsScreen() {
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [transactions, setTransactions] = useState<EarningsTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadEarnings();
  }, []);

  const loadEarnings = async () => {
    const [summaryRes, transactionsRes] = await Promise.all([
      driverApi.getEarnings(),
      driverApi.getTransactions(),
    ]);

    if (summaryRes.success && summaryRes.data) {
      setSummary(summaryRes.data);
    }
    if (transactionsRes.success && transactionsRes.data) {
      setTransactions(transactionsRes.data.transactions);
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
      {/* Summary Cards */}
      {summary && (
        <View style={styles.summaryContainer}>
          <Card style={styles.mainCard}>
            <Text style={styles.mainCardLabel}>Today's Earnings</Text>
            <Text style={styles.mainCardValue}>
              {formatCurrency(summary.today, summary.currency)}
            </Text>
            <View style={styles.mainCardStats}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{summary.completedRides}</Text>
                <Text style={styles.statLabel}>Rides</Text>
              </View>
            </View>
          </Card>

          <View style={styles.statsRow}>
            <Card style={styles.statCard}>
              <Text style={styles.statCardLabel}>This Week</Text>
              <Text style={styles.statCardValue}>
                {formatCurrency(summary.thisWeek, summary.currency)}
              </Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={styles.statCardLabel}>This Month</Text>
              <Text style={styles.statCardValue}>
                {formatCurrency(summary.thisMonth, summary.currency)}
              </Text>
            </Card>
          </View>

          {summary.pendingPayout > 0 && (
            <Card style={styles.pendingCard}>
              <View style={styles.pendingInfo}>
                <Ionicons name="wallet-outline" size={24} color={colors.warning} />
                <View style={styles.pendingText}>
                  <Text style={styles.pendingLabel}>Pending Payout</Text>
                  <Text style={styles.pendingValue}>
                    {formatCurrency(summary.pendingPayout, summary.currency)}
                  </Text>
                </View>
              </View>
            </Card>
          )}
        </View>
      )}

      {/* Transactions */}
      <View style={styles.transactionsSection}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>

        {transactions.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No transactions yet</Text>
          </Card>
        ) : (
          transactions.map((transaction) => (
            <Card key={transaction.id} style={styles.transactionCard}>
              <View style={styles.transactionIcon}>
                <Ionicons
                  name={
                    transaction.type === 'RIDE'
                      ? 'car'
                      : transaction.type === 'PAYOUT'
                      ? 'arrow-down'
                      : 'gift'
                  }
                  size={20}
                  color={
                    transaction.type === 'PAYOUT'
                      ? colors.error
                      : colors.success
                  }
                />
              </View>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionDescription}>
                  {transaction.description}
                </Text>
                <Text style={styles.transactionDate}>
                  {formatDate(transaction.createdAt)}
                </Text>
              </View>
              <Text
                style={[
                  styles.transactionAmount,
                  transaction.type === 'PAYOUT' && styles.transactionAmountNegative,
                ]}
              >
                {transaction.type === 'PAYOUT' ? '-' : '+'}
                {formatCurrency(transaction.amount, transaction.currency)}
              </Text>
            </Card>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  summaryContainer: {
    padding: spacing.md,
  },
  mainCard: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  mainCardLabel: {
    fontSize: scaleFontSize(14),
    color: 'rgba(255,255,255,0.8)',
    marginBottom: spacing.xs,
  },
  mainCardValue: {
    fontSize: scaleFontSize(36),
    fontWeight: '700',
    color: '#fff',
  },
  mainCardStats: {
    flexDirection: 'row',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: scaleFontSize(24),
    fontWeight: '700',
    color: '#fff',
  },
  statLabel: {
    fontSize: scaleFontSize(12),
    color: 'rgba(255,255,255,0.8)',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    padding: spacing.md,
  },
  statCardLabel: {
    fontSize: scaleFontSize(12),
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  statCardValue: {
    fontSize: scaleFontSize(20),
    fontWeight: '700',
    color: colors.text,
  },
  pendingCard: {
    backgroundColor: '#fef3c7',
    padding: spacing.md,
  },
  pendingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pendingText: {
    marginLeft: spacing.md,
  },
  pendingLabel: {
    fontSize: scaleFontSize(12),
    color: '#92400e',
  },
  pendingValue: {
    fontSize: scaleFontSize(18),
    fontWeight: '700',
    color: '#92400e',
  },
  transactionsSection: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: scaleFontSize(18),
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  emptyCard: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: scaleFontSize(14),
    color: colors.textMuted,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  transactionIcon: {
    width: scale(40),
    height: verticalScale(40),
    borderRadius: scale(20),
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  transactionDescription: {
    fontSize: scaleFontSize(14),
    fontWeight: '500',
    color: colors.text,
  },
  transactionDate: {
    fontSize: scaleFontSize(12),
    color: colors.textMuted,
    marginTop: verticalScale(2),
  },
  transactionAmount: {
    fontSize: scaleFontSize(16),
    fontWeight: '700',
    color: colors.success,
  },
  transactionAmountNegative: {
    color: colors.error,
  },
});
