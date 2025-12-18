import React from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Badge, Button, colors, spacing } from '@shared/components';
import { useAuthStore } from '@shared/stores';

interface MenuItem {
  icon: string;
  label: string;
  onPress: () => void;
  showChevron?: boolean;
  badge?: string;
  supplierOnly?: boolean;
}

export default function ProfileScreen() {
  const { partner, logout } = useAuthStore();
  const partnerType = partner?.type;
  const partnerData = partner?.data;

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const menuItems: MenuItem[] = [
    {
      icon: 'business',
      label: 'Company Information',
      onPress: () => router.push('/settings/company'),
      showChevron: true,
    },
    {
      icon: 'card',
      label: 'Payment Settings',
      onPress: () => router.push('/settings/payment'),
      showChevron: true,
    },
    {
      icon: 'people',
      label: 'Manage Drivers',
      onPress: () => router.push('/resources/drivers'),
      showChevron: true,
      supplierOnly: true,
    },
    {
      icon: 'car',
      label: 'Manage Vehicles',
      onPress: () => router.push('/resources/vehicles'),
      showChevron: true,
      supplierOnly: true,
    },
    {
      icon: 'notifications',
      label: 'Notifications',
      onPress: () => router.push('/settings/notifications'),
      showChevron: true,
    },
    {
      icon: 'document-text',
      label: 'Documents',
      onPress: () => router.push('/settings/documents'),
      showChevron: true,
      supplierOnly: true,
    },
    {
      icon: 'link',
      label: 'Affiliate Link',
      onPress: () => router.push('/settings/affiliate-link'),
      showChevron: true,
      supplierOnly: false,
    },
    {
      icon: 'help-circle',
      label: 'Help & Support',
      onPress: () => router.push('/support'),
      showChevron: true,
    },
    {
      icon: 'shield-checkmark',
      label: 'Terms & Privacy',
      onPress: () => router.push('/legal'),
      showChevron: true,
    },
  ];

  const filteredMenuItems = menuItems.filter((item) => {
    if (item.supplierOnly === true && partnerType !== 'supplier') return false;
    if (item.supplierOnly === false && partnerType !== 'affiliate') return false;
    return true;
  });

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="business" size={40} color={colors.primary} />
          </View>
          <Badge
            label={partnerType === 'affiliate' ? 'Affiliate' : 'Supplier'}
            variant="info"
            size="sm"
          />
        </View>
        <Text style={styles.companyName}>
          {(partnerData as any)?.companyName || 'Company Name'}
        </Text>
        <Text style={styles.contactName}>
          {(partnerData as any)?.contactName || 'Contact Name'}
        </Text>
        <Text style={styles.email}>
          {(partnerData as any)?.contactEmail || 'email@example.com'}
        </Text>

        {partnerType === 'affiliate' && (partnerData as any)?.affiliateCode && (
          <View style={styles.affiliateCodeContainer}>
            <Text style={styles.affiliateCodeLabel}>Affiliate Code</Text>
            <Text style={styles.affiliateCode}>
              {(partnerData as any).affiliateCode}
            </Text>
          </View>
        )}

        {partnerType === 'supplier' && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFB800" />
            <Text style={styles.ratingText}>
              {(partnerData as any)?.rating?.toFixed(1) || '5.0'}
            </Text>
          </View>
        )}

        {!(partnerData as any)?.isVerified && (
          <View style={styles.verificationBanner}>
            <Ionicons name="warning" size={20} color={colors.warning} />
            <Text style={styles.verificationText}>
              Your account is pending verification
            </Text>
          </View>
        )}
      </View>

      {/* Stats */}
      {partnerType === 'affiliate' && (
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>
              {(partnerData as any)?.commissionRate || 10}%
            </Text>
            <Text style={styles.statLabel}>Commission Rate</Text>
          </Card>
        </View>
      )}

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {filteredMenuItems.map((item, index) => (
          <Card
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <View style={styles.menuItemContent}>
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIconContainer}>
                  <Ionicons
                    name={item.icon as any}
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <Text style={styles.menuItemLabel}>{item.label}</Text>
              </View>
              {item.badge && (
                <Badge label={item.badge} variant="warning" size="sm" />
              )}
              {item.showChevron && (
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.textMuted}
                />
              )}
            </View>
          </Card>
        ))}
      </View>

      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <Button
          title="Logout"
          variant="outline"
          onPress={handleLogout}
          icon={<Ionicons name="log-out-outline" size={20} color={colors.error} />}
          style={styles.logoutButton}
          textStyle={styles.logoutButtonText}
        />
      </View>

      {/* App Version */}
      <Text style={styles.versionText}>Version 1.0.0</Text>
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
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  companyName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  contactName: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 2,
  },
  email: {
    fontSize: 14,
    color: colors.textMuted,
  },
  affiliateCodeContainer: {
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    alignItems: 'center',
  },
  affiliateCodeLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  affiliateCode: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    fontFamily: 'monospace',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  verificationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderRadius: 8,
    gap: spacing.sm,
  },
  verificationText: {
    fontSize: 13,
    color: colors.warning,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  menuContainer: {
    padding: spacing.md,
  },
  menuItem: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuItemLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  logoutContainer: {
    padding: spacing.md,
    paddingTop: spacing.sm,
  },
  logoutButton: {
    borderColor: colors.error,
  },
  logoutButtonText: {
    color: colors.error,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textMuted,
    paddingBottom: spacing.xl,
  },
});
