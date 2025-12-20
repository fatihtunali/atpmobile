import type { BookingStatus, PaymentStatus } from '@shared/types';
// Export all responsive utilities
export * from './responsive';

// ============================================
// Date & Time Formatters
// ============================================

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  });
}

export function formatTime(time: string): string {
  // Convert "14:30" to "2:30 PM"
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function formatDateTime(date: string | Date, time?: string): string {
  const formattedDate = formatDate(date);
  if (time) {
    return `${formattedDate} at ${formatTime(time)}`;
  }
  return formattedDate;
}

export function getRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffMins = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);

  if (diffMins < 0) {
    // Past
    if (diffMins > -60) return `${Math.abs(diffMins)} min ago`;
    if (diffHours > -24) return `${Math.abs(diffHours)} hours ago`;
    return formatDate(d);
  } else {
    // Future
    if (diffMins < 60) return `In ${diffMins} min`;
    if (diffHours < 24) return `In ${diffHours} hours`;
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;
    return formatDate(d);
  }
}

// ============================================
// Currency Formatters
// ============================================

export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-GB').format(num);
}

// ============================================
// Status Helpers
// ============================================

export function getBookingStatusLabel(status: BookingStatus): string {
  const labels: Record<BookingStatus, string> = {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    DRIVER_ASSIGNED: 'Driver Assigned',
    ON_THE_WAY: 'Driver On The Way',
    ARRIVED: 'Driver Arrived',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  };
  return labels[status] || status;
}

export function getBookingStatusColor(status: BookingStatus): string {
  const colors: Record<BookingStatus, string> = {
    PENDING: '#f59e0b', // amber
    CONFIRMED: '#3b82f6', // blue
    DRIVER_ASSIGNED: '#8b5cf6', // purple
    ON_THE_WAY: '#0891b2', // cyan
    ARRIVED: '#0d9488', // teal
    IN_PROGRESS: '#0d9488', // teal
    COMPLETED: '#22c55e', // green
    CANCELLED: '#ef4444', // red
  };
  return colors[status] || '#64748b';
}

export function getPaymentStatusLabel(status: PaymentStatus): string {
  const labels: Record<PaymentStatus, string> = {
    PENDING: 'Pending',
    PAID: 'Paid',
    REFUNDED: 'Refunded',
    FAILED: 'Failed',
  };
  return labels[status] || status;
}

export function getPaymentStatusColor(status: PaymentStatus): string {
  const colors: Record<PaymentStatus, string> = {
    PENDING: '#f59e0b',
    PAID: '#22c55e',
    REFUNDED: '#3b82f6',
    FAILED: '#ef4444',
  };
  return colors[status] || '#64748b';
}

// ============================================
// Validation Helpers
// ============================================

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s-]{10,}$/;
  return phoneRegex.test(phone);
}

export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

// ============================================
// String Helpers
// ============================================

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ============================================
// Distance & Duration Helpers
// ============================================

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours} hr`;
  }
  return `${hours} hr ${mins} min`;
}

// ============================================
// Map Helpers
// ============================================

export function getMapRegion(
  coords: { latitude: number; longitude: number }[],
  padding: number = 0.02
) {
  if (coords.length === 0) return null;

  const lats = coords.map((c) => c.latitude);
  const lngs = coords.map((c) => c.longitude);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(maxLat - minLat + padding, 0.02),
    longitudeDelta: Math.max(maxLng - minLng + padding, 0.02),
  };
}

export function openNavigation(
  latitude: number,
  longitude: number,
  label?: string,
  app: 'google' | 'waze' | 'apple' = 'google'
) {
  const { Linking, Platform } = require('react-native');

  let url: string;

  switch (app) {
    case 'waze':
      url = `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;
      break;
    case 'apple':
      url = `http://maps.apple.com/?daddr=${latitude},${longitude}`;
      break;
    default:
      url = Platform.select({
        ios: `comgooglemaps://?daddr=${latitude},${longitude}&directionsmode=driving`,
        android: `google.navigation:q=${latitude},${longitude}`,
      });
  }

  Linking.openURL(url).catch(() => {
    // Fallback to web Google Maps
    Linking.openURL(
      `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
    );
  });
}
