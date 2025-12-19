import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input, Card, colors, spacing } from '@shared/components';
import { partnerApi, setAuthToken } from '@shared/api';
import { useAuth } from '@shared/hooks';

type PartnerType = 'affiliate' | 'supplier';

export default function LoginScreen() {
  const { saveAuth } = useAuth();
  const [partnerType, setPartnerType] = useState<PartnerType>('supplier');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const response = await partnerApi.login(email.toLowerCase().trim(), password, partnerType);

      if (response.success && response.data) {
        await saveAuth('partner', response.data.user, response.data.token);
        setAuthToken(response.data.token);
        router.replace('/(tabs)');
      } else {
        Alert.alert('Login Failed', response.error || 'Invalid credentials');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo and Title */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="car-sport" size={50} color={colors.primary} />
          </View>
          <Text style={styles.title}>Partner Portal</Text>
          <Text style={styles.subtitle}>
            Manage your transfers and earnings
          </Text>
        </View>

        {/* Partner Type Selector */}
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              partnerType === 'supplier' && styles.typeButtonActive,
            ]}
            onPress={() => setPartnerType('supplier')}
          >
            <Ionicons
              name="business"
              size={24}
              color={partnerType === 'supplier' ? colors.primary : colors.textMuted}
            />
            <Text
              style={[
                styles.typeButtonText,
                partnerType === 'supplier' && styles.typeButtonTextActive,
              ]}
            >
              Supplier
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeButton,
              partnerType === 'affiliate' && styles.typeButtonActive,
            ]}
            onPress={() => setPartnerType('affiliate')}
          >
            <Ionicons
              name="people"
              size={24}
              color={partnerType === 'affiliate' ? colors.primary : colors.textMuted}
            />
            <Text
              style={[
                styles.typeButtonText,
                partnerType === 'affiliate' && styles.typeButtonTextActive,
              ]}
            >
              Affiliate
            </Text>
          </TouchableOpacity>
        </View>

        {/* Login Form */}
        <Card style={styles.formCard}>
          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            leftIcon={
              <Ionicons name="mail-outline" size={20} color={colors.textMuted} />
            }
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            leftIcon={
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={colors.textMuted}
              />
            }
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            }
          />

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <Button
            title="Login"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginButton}
          />
        </Card>

        {/* Register Link */}
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <TouchableOpacity>
            <Text style={styles.registerLink}>
              Register on our website
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Ionicons name="shield-checkmark" size={16} color={colors.success} />
            <Text style={styles.infoText}>Secure login</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="lock-closed" size={16} color={colors.success} />
            <Text style={styles.infoText}>256-bit encryption</Text>
          </View>
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
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  typeButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textMuted,
  },
  typeButtonTextActive: {
    color: colors.primary,
  },
  formCard: {
    padding: spacing.lg,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  loginButton: {
    marginTop: spacing.sm,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  registerText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  registerLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
    gap: spacing.lg,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
