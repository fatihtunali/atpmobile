import { Dimensions, PixelRatio, Platform } from 'react-native';

// Base dimensions (iPhone 11/12/13 - common design base)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

// Get current screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Scale factor based on screen width
const widthScale = SCREEN_WIDTH / BASE_WIDTH;
const heightScale = SCREEN_HEIGHT / BASE_HEIGHT;

/**
 * Scale a value based on screen width
 * Use for horizontal dimensions (width, marginHorizontal, paddingHorizontal)
 */
export function scale(size: number): number {
  return Math.round(size * widthScale);
}

/**
 * Scale a value based on screen height
 * Use for vertical dimensions (height, marginVertical, paddingVertical)
 */
export function verticalScale(size: number): number {
  return Math.round(size * heightScale);
}

/**
 * Moderate scale - less aggressive scaling
 * Good for fonts and elements that shouldn't scale too dramatically
 * @param size - The size to scale
 * @param factor - How much to scale (0.5 = half the normal scaling, default)
 */
export function moderateScale(size: number, factor: number = 0.5): number {
  return Math.round(size + (scale(size) - size) * factor);
}

/**
 * Moderate vertical scale
 */
export function moderateVerticalScale(size: number, factor: number = 0.5): number {
  return Math.round(size + (verticalScale(size) - size) * factor);
}

/**
 * Scale font size with consideration for accessibility settings
 * Respects user's font size preferences on device
 */
export function scaleFontSize(size: number): number {
  const scaledSize = moderateScale(size, 0.3);
  // Allow font scaling but cap it to prevent extreme sizes
  const maxScale = 1.3;
  const minScale = 0.85;
  const fontScale = Math.min(Math.max(PixelRatio.getFontScale(), minScale), maxScale);
  return Math.round(scaledSize * fontScale);
}

/**
 * Check if device is a small screen (iPhone SE, older Androids)
 */
export function isSmallDevice(): boolean {
  return SCREEN_WIDTH < 375;
}

/**
 * Check if device is a large screen (tablets, large phones)
 */
export function isLargeDevice(): boolean {
  return SCREEN_WIDTH >= 768;
}

/**
 * Check if device is a tablet
 */
export function isTablet(): boolean {
  const aspectRatio = SCREEN_HEIGHT / SCREEN_WIDTH;
  return (
    (Platform.OS === 'ios' && Platform.isPad) ||
    (SCREEN_WIDTH >= 600 && aspectRatio < 1.6)
  );
}

/**
 * Get responsive value based on device size
 */
export function responsive<T>(small: T, medium: T, large?: T): T {
  if (isSmallDevice()) return small;
  if (isLargeDevice()) return large ?? medium;
  return medium;
}

// Screen dimensions for external use
export const screenWidth = SCREEN_WIDTH;
export const screenHeight = SCREEN_HEIGHT;

// ============================================
// Responsive Spacing
// ============================================

export const responsiveSpacing = {
  xs: scale(4),
  sm: scale(8),
  md: scale(16),
  lg: scale(24),
  xl: scale(32),
  xxl: scale(48),
};

// ============================================
// Responsive Typography
// ============================================

export const responsiveTypography = {
  // Headings
  h1: {
    fontSize: scaleFontSize(28),
    fontWeight: '700' as const,
    lineHeight: scaleFontSize(34),
  },
  h2: {
    fontSize: scaleFontSize(24),
    fontWeight: '600' as const,
    lineHeight: scaleFontSize(30),
  },
  h3: {
    fontSize: scaleFontSize(20),
    fontWeight: '600' as const,
    lineHeight: scaleFontSize(26),
  },
  h4: {
    fontSize: scaleFontSize(18),
    fontWeight: '600' as const,
    lineHeight: scaleFontSize(24),
  },
  // Body text
  body: {
    fontSize: scaleFontSize(16),
    fontWeight: '400' as const,
    lineHeight: scaleFontSize(24),
  },
  bodySmall: {
    fontSize: scaleFontSize(14),
    fontWeight: '400' as const,
    lineHeight: scaleFontSize(20),
  },
  // Caption/small text
  caption: {
    fontSize: scaleFontSize(12),
    fontWeight: '400' as const,
    lineHeight: scaleFontSize(16),
  },
  tiny: {
    fontSize: scaleFontSize(10),
    fontWeight: '400' as const,
    lineHeight: scaleFontSize(14),
  },
};

// ============================================
// Responsive Component Sizes
// ============================================

export const responsiveSizes = {
  // Icon sizes
  iconSmall: scale(16),
  iconMedium: scale(20),
  iconLarge: scale(24),
  iconXLarge: scale(32),

  // Button heights
  buttonSmall: verticalScale(36),
  buttonMedium: verticalScale(48),
  buttonLarge: verticalScale(56),

  // Input heights
  inputHeight: verticalScale(48),

  // Avatar sizes
  avatarSmall: scale(32),
  avatarMedium: scale(48),
  avatarLarge: scale(64),

  // Border radius
  radiusSmall: scale(8),
  radiusMedium: scale(12),
  radiusLarge: scale(16),
  radiusRound: scale(100),

  // Touch targets (minimum 44pt for accessibility)
  touchTarget: Math.max(scale(44), 44),
};

// ============================================
// Helper hook for dimension updates
// ============================================

// Note: For dimension change handling, use this in your component:
// import { useWindowDimensions } from 'react-native';
// const { width, height } = useWindowDimensions();
