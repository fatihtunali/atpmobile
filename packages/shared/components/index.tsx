import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

// ============================================
// Theme Constants
// ============================================

export const colors = {
  primary: '#0d9488', // teal-600
  primaryDark: '#0f766e', // teal-700
  primaryLight: '#14b8a6', // teal-500
  secondary: '#0891b2', // cyan-600
  background: '#f8fafc', // slate-50
  surface: '#ffffff',
  text: '#1e293b', // slate-800
  textSecondary: '#64748b', // slate-500
  textMuted: '#94a3b8', // slate-400
  border: '#e2e8f0', // slate-200
  error: '#ef4444', // red-500
  success: '#22c55e', // green-500
  warning: '#f59e0b', // amber-500
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34 },
  h2: { fontSize: 24, fontWeight: '600' as const, lineHeight: 30 },
  h3: { fontSize: 20, fontWeight: '600' as const, lineHeight: 26 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodySmall: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
};

// ============================================
// Button Component
// ============================================

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  style,
}) => {
  const buttonStyles = [
    styles.button,
    styles[`button_${variant}`],
    styles[`button_${size}`],
    fullWidth && styles.buttonFullWidth,
    disabled && styles.buttonDisabled,
    style,
  ];

  const textStyles = [
    styles.buttonText,
    styles[`buttonText_${variant}`],
    styles[`buttonText_${size}`],
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? '#fff' : colors.primary}
          size="small"
        />
      ) : (
        <>
          {icon && <View style={styles.buttonIcon}>{icon}</View>}
          <Text style={textStyles}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

// ============================================
// Input Component
// ============================================

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  multiline?: boolean;
  numberOfLines?: number;
  style?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'none',
  leftIcon,
  rightIcon,
  multiline,
  numberOfLines,
  style,
}) => {
  return (
    <View style={[styles.inputContainer, style]}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <View style={[styles.inputWrapper, error && styles.inputWrapperError]}>
        {leftIcon && <View style={styles.inputIcon}>{leftIcon}</View>}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            rightIcon && styles.inputWithRightIcon,
            multiline && styles.inputMultiline,
          ]}
        />
        {rightIcon && <View style={styles.inputIconRight}>{rightIcon}</View>}
      </View>
      {error && <Text style={styles.inputError}>{error}</Text>}
    </View>
  );
};

// ============================================
// Card Component
// ============================================

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof spacing;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = 'md',
  onPress,
}) => {
  const content = (
    <View style={[styles.card, { padding: spacing[padding] }, style]}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

// ============================================
// Badge Component
// ============================================

interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'default',
  size = 'md',
}) => {
  const variantColors = {
    default: { bg: colors.border, text: colors.textSecondary },
    success: { bg: '#dcfce7', text: '#166534' },
    warning: { bg: '#fef3c7', text: '#92400e' },
    error: { bg: '#fee2e2', text: '#991b1b' },
    info: { bg: '#e0f2fe', text: '#0369a1' },
  };

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: variantColors[variant].bg },
        size === 'sm' && styles.badgeSm,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          { color: variantColors[variant].text },
          size === 'sm' && styles.badgeTextSm,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

// ============================================
// Loading Component
// ============================================

interface LoadingProps {
  size?: 'small' | 'large';
  color?: string;
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'large',
  color = colors.primary,
  fullScreen = false,
}) => {
  if (fullScreen) {
    return (
      <View style={styles.loadingFullScreen}>
        <ActivityIndicator size={size} color={color} />
      </View>
    );
  }

  return <ActivityIndicator size={size} color={color} />;
};

// ============================================
// Divider Component
// ============================================

interface DividerProps {
  style?: ViewStyle;
}

export const Divider: React.FC<DividerProps> = ({ style }) => (
  <View style={[styles.divider, style]} />
);

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  // Button styles
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  button_primary: {
    backgroundColor: colors.primary,
  },
  button_secondary: {
    backgroundColor: colors.secondary,
  },
  button_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  button_ghost: {
    backgroundColor: 'transparent',
  },
  button_sm: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  button_md: {
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  button_lg: {
    paddingVertical: 18,
    paddingHorizontal: 32,
  },
  buttonFullWidth: {
    width: '100%',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontWeight: '600',
  },
  buttonText_primary: {
    color: '#ffffff',
  },
  buttonText_secondary: {
    color: '#ffffff',
  },
  buttonText_outline: {
    color: colors.primary,
  },
  buttonText_ghost: {
    color: colors.primary,
  },
  buttonText_sm: {
    fontSize: 14,
  },
  buttonText_md: {
    fontSize: 16,
  },
  buttonText_lg: {
    fontSize: 18,
  },
  buttonIcon: {
    marginRight: 8,
  },

  // Input styles
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
  },
  inputWrapperError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text,
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputIcon: {
    paddingLeft: 16,
  },
  inputIconRight: {
    paddingRight: 16,
  },
  inputError: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },

  // Card styles
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  // Badge styles
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgeTextSm: {
    fontSize: 10,
  },

  // Loading styles
  loadingFullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },

  // Divider styles
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
});
