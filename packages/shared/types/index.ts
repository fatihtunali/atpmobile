// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ============================================
// Auth Types
// ============================================

export interface CustomerUser {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  profileImage?: string;
  loyaltyPoints: number;
  createdAt: string;
}

export interface DriverUser {
  id: number;
  supplierId: number;
  supplierName: string;
  name: string;
  email: string;
  phone: string;
  profileImage?: string;
  vehicleId?: number;
  isOnline: boolean;
  rating: number;
  totalRides: number;
}

export interface AffiliateUser {
  id: number;
  affiliateCode: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  commissionRate: number;
  isVerified: boolean;
}

export interface SupplierUser {
  id: number;
  companyName: string;
  contactName: string;
  contactEmail: string;
  phone?: string;
  isVerified: boolean;
  rating: number;
}

export type PartnerUser =
  | { type: 'affiliate'; data: AffiliateUser }
  | { type: 'supplier'; data: SupplierUser };

// ============================================
// Booking Types
// ============================================

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'DRIVER_ASSIGNED'
  | 'ON_THE_WAY'
  | 'ARRIVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type PaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'REFUNDED'
  | 'FAILED';

export type PaymentMethodType = 'CARD' | 'BANK_TRANSFER' | 'CRYPTO';

export interface PaymentMethod {
  id: PaymentMethodType;
  title: string;
  subtitle: string;
  icon: string;
  isEnabled: boolean;
  processingFee?: number;
  minAmount?: number;
  maxAmount?: number;
}

export interface Location {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  placeId?: string;
}

export interface Airport {
  id: number;
  code: string;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface Vehicle {
  id: number;
  type: string;
  name: string;
  description: string;
  maxPassengers: number;
  maxLuggage: number;
  image?: string;
}

export interface Booking {
  id: number;
  publicCode: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;

  // Route
  pickupLocation: Location;
  dropoffLocation: Location;
  pickupDate: string;
  pickupTime: string;
  flightNumber?: string;

  // Vehicle & Passengers
  vehicleType: string;
  passengers: number;
  luggage: number;

  // Pricing
  price: number;
  currency: string;

  // Customer
  customerName: string;
  customerEmail: string;
  customerPhone: string;

  // Driver (when assigned)
  driver?: {
    id: number;
    name: string;
    phone: string;
    photo?: string;
    vehicleMake?: string;
    vehicleModel?: string;
    vehiclePlate?: string;
  };

  // Tracking
  driverLocation?: {
    latitude: number;
    longitude: number;
    updatedAt: string;
  };

  createdAt: string;
  updatedAt: string;
}

// ============================================
// Search Types
// ============================================

export interface SearchRequest {
  pickupType: 'airport' | 'address';
  dropoffType: 'airport' | 'address';
  pickupAirportCode?: string;
  dropoffAirportCode?: string;
  pickupAddress?: string;
  dropoffAddress?: string;
  pickupLatitude?: number;
  pickupLongitude?: number;
  dropoffLatitude?: number;
  dropoffLongitude?: number;
  pickupDate: string;
  pickupTime: string;
  passengers: number;
  returnDate?: string;
  returnTime?: string;
}

export interface SearchResult {
  supplierId: number;
  supplierName: string;
  supplierRating: number;
  supplierReviews: number;
  vehicleType: string;
  vehicleName: string;
  vehicleDescription: string;
  maxPassengers: number;
  maxLuggage: number;
  vehicleImage?: string;
  price: number;
  currency: string;
  duration: number; // minutes
  distance: number; // km
  features: string[];
  airportId?: number;
  zoneId?: number;
  routeId?: number;
}

// ============================================
// Driver Ride Types
// ============================================

export interface DriverRide {
  id: number;
  bookingCode: string;
  status: BookingStatus;

  pickupLocation: Location;
  dropoffLocation: Location;
  pickupDate: string;
  pickupTime: string;
  flightNumber?: string;

  customerName: string;
  customerPhone: string;
  passengers: number;
  luggage: number;

  price: number;
  driverEarnings: number;
  currency: string;

  notes?: string;
  createdAt: string;
}

export type RideStatusUpdate =
  | 'ACCEPT'
  | 'REJECT'
  | 'ON_THE_WAY'
  | 'ARRIVED'
  | 'START_RIDE'
  | 'COMPLETE';

// ============================================
// Earnings Types
// ============================================

export interface EarningsSummary {
  today: number;
  thisWeek: number;
  thisMonth: number;
  total: number;
  currency: string;
  pendingPayout: number;
  completedRides: number;
}

export interface EarningsTransaction {
  id: number;
  type: 'RIDE' | 'PAYOUT' | 'BONUS' | 'DEDUCTION';
  amount: number;
  currency: string;
  description: string;
  bookingCode?: string;
  createdAt: string;
}

// ============================================
// Notification Types
// ============================================

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  read: boolean;
  createdAt: string;
}

export type NotificationType =
  | 'BOOKING_CONFIRMED'
  | 'DRIVER_ASSIGNED'
  | 'DRIVER_ON_WAY'
  | 'DRIVER_ARRIVED'
  | 'RIDE_COMPLETED'
  | 'NEW_RIDE_REQUEST'
  | 'RIDE_CANCELLED'
  | 'PAYOUT_PROCESSED';
