import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, colors, spacing } from '@shared/components';
import { useAuth } from '@shared/hooks';
import { getInitials } from '@shared/utils';
import { scale, verticalScale, scaleFontSize } from '@shared/utils/responsive';

export default function ProfileScreen() {
  const { isAuthenticated, customer, logout } = useAuth();

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

  if (!isAuthenticated || !customer) {
    return (
      <View style={styles.guestContainer}>
        <View style={styles.guestContent}>
          <Ionicons name="person-circle-outline" size={80} color={colors.border} />
          <Text style={styles.guestTitle}>Sign in to your account</Text>
          <Text style={styles.guestText}>
            Manage your bookings, save your details, and earn loyalty points.
          </Text>
          <Button
            title="Sign In"
            onPress={() => router.push('/(auth)/login')}
            style={{ marginTop: spacing.lg }}
          />
          <TouchableOpacity
            onPress={() => router.push('/(auth)/register')}
            style={{ marginTop: spacing.md }}
          >
            <Text style={styles.registerLink}>
              Don't have an account? <Text style={styles.registerLinkBold}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {getInitials(customer.fullName)}
          </Text>
        </View>
        <Text style={styles.name}>{customer.fullName}</Text>
        <Text style={styles.email}>{customer.email}</Text>

        {customer.loyaltyPoints > 0 && (
          <View style={styles.pointsBadge}>
            <Ionicons name="star" size={16} color="#f59e0b" />
            <Text style={styles.pointsText}>
              {customer.loyaltyPoints} points
            </Text>
          </View>
        )}
      </View>

      {/* Menu Items */}
      <View style={styles.menu}>
        <Card style={styles.menuCard}>
          <MenuItem
            icon="person-outline"
            title="Edit Profile"
            onPress={() => {}}
          />
          <MenuItem
            icon="card-outline"
            title="Payment Methods"
            onPress={() => {}}
          />
          <MenuItem
            icon="location-outline"
            title="Saved Places"
            onPress={() => {}}
          />
          <MenuItem
            icon="notifications-outline"
            title="Notifications"
            onPress={() => {}}
            showBorder={false}
          />
        </Card>

        <Card style={styles.menuCard}>
          <MenuItem
            icon="help-circle-outline"
            title="Help & Support"
            onPress={() => {}}
          />
          <MenuItem
            icon="document-text-outline"
            title="Terms & Conditions"
            onPress={() => {}}
          />
          <MenuItem
            icon="shield-checkmark-outline"
            title="Privacy Policy"
            onPress={() => {}}
            showBorder={false}
          />
        </Card>

        <Card style={styles.menuCard}>
          <MenuItem
            icon="log-out-outline"
            title="Logout"
            onPress={handleLogout}
            showBorder={false}
            danger
          />
        </Card>
      </View>

      {/* App Version */}
      <Text style={styles.version}>Version 1.0.0</Text>
    </ScrollView>
  );
}

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: () => void;
  showBorder?: boolean;
  danger?: boolean;
}

function MenuItem({
  icon,
  title,
  onPress,
  showBorder = true,
  danger = false,
}: MenuItemProps) {
  return (
    <TouchableOpacity
      style={[styles.menuItem, showBorder && styles.menuItemBorder]}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={22}
        color={danger ? colors.error : colors.textSecondary}
      />
      <Text style={[styles.menuItemText, danger && styles.menuItemTextDanger]}>
        {title}
      </Text>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  guestContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  guestContent: {
    alignItems: 'center',
  },
  guestTitle: {
    fontSize: scaleFontSize(20),
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  guestText: {
    fontSize: scaleFontSize(14),
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: scaleFontSize(20),
  },
  registerLink: {
    fontSize: scaleFontSize(14),
    color: colors.textSecondary,
  },
  registerLinkBold: {
    color: colors.primary,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  avatar: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: scaleFontSize(28),
    fontWeight: '700',
    color: '#fff',
  },
  name: {
    fontSize: scaleFontSize(22),
    fontWeight: '700',
    color: colors.text,
    marginBottom: scale(4),
  },
  email: {
    fontSize: scaleFontSize(14),
    color: colors.textMuted,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingVertical: verticalScale(6),
    paddingHorizontal: scale(12),
    borderRadius: scale(20),
    marginTop: spacing.md,
  },
  pointsText: {
    marginLeft: scale(6),
    fontSize: scaleFontSize(14),
    fontWeight: '600',
    color: '#92400e',
  },
  menu: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  menuCard: {
    marginBottom: spacing.md,
    padding: 0,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemText: {
    flex: 1,
    marginLeft: spacing.md,
    fontSize: scaleFontSize(15),
    color: colors.text,
  },
  menuItemTextDanger: {
    color: colors.error,
  },
  version: {
    textAlign: 'center',
    fontSize: scaleFontSize(12),
    color: colors.textMuted,
    paddingBottom: spacing.xl,
  },
});
