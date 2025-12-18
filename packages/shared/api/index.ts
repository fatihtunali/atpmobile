import type {
  ApiResponse,
  CustomerUser,
  DriverUser,
  PartnerUser,
  Booking,
  SearchRequest,
  SearchResult,
  DriverRide,
  RideStatusUpdate,
  EarningsSummary,
  EarningsTransaction,
} from '@shared/types';

// ============================================
// Configuration
// ============================================

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://airporttransferportal.com';

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthToken = () => authToken;

// ============================================
// Base Fetch Helper
// ============================================

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (authToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Request failed',
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// ============================================
// Customer API
// ============================================

export const customerApi = {
  // Auth
  register: (email: string, password: string, fullName: string, phone?: string) =>
    apiRequest<{ user: CustomerUser; token: string }>('/api/mobile/customer/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName, phone }),
    }),

  login: (email: string, password: string) =>
    apiRequest<{ user: CustomerUser; token: string }>('/api/mobile/customer/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  loginWithOTP: (phone: string) =>
    apiRequest<{ message: string }>('/api/mobile/customer/otp/send', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),

  verifyOTP: (phone: string, code: string) =>
    apiRequest<{ user: CustomerUser; token: string }>('/api/mobile/customer/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ phone, code }),
    }),

  getProfile: () =>
    apiRequest<CustomerUser>('/api/mobile/customer/profile'),

  updateProfile: (data: Partial<CustomerUser>) =>
    apiRequest<CustomerUser>('/api/mobile/customer/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Search & Booking
  searchTransfers: (data: SearchRequest) =>
    apiRequest<SearchResult[]>('/api/mobile/customer/search', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  createBooking: (data: {
    searchResult: SearchResult;
    searchRequest: SearchRequest;
    passengerDetails: {
      name: string;
      email: string;
      phone: string;
    };
    flightNumber?: string;
    notes?: string;
    promoCode?: string;
  }) =>
    apiRequest<Booking>('/api/mobile/customer/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getBookings: (type?: 'upcoming' | 'past', page?: number, limit?: number) =>
    apiRequest<{ bookings: Booking[]; page: number; limit: number }>(
      `/api/mobile/customer/bookings?type=${type || 'upcoming'}${page ? `&page=${page}` : ''}${limit ? `&limit=${limit}` : ''}`
    ),

  getBooking: (publicCode: string) =>
    apiRequest<Booking>(`/api/mobile/customer/bookings/${publicCode}`),

  cancelBooking: (publicCode: string, reason?: string) =>
    apiRequest<{ message: string }>(`/api/mobile/customer/bookings/${publicCode}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  // Tracking
  trackBooking: (publicCode: string) =>
    apiRequest<{
      booking: Booking;
      driverLocation?: { latitude: number; longitude: number; updatedAt: string };
    }>(`/api/mobile/tracking/${publicCode}`),

  // Payments
  createPaymentIntent: (bookingCode: string) =>
    apiRequest<{ clientSecret: string }>(`/api/mobile/customer/bookings/${bookingCode}/payment`, {
      method: 'POST',
    }),
};

// ============================================
// Driver API
// ============================================

export const driverApi = {
  // Auth
  login: (email: string, password: string) =>
    apiRequest<{ driver: DriverUser; token: string }>('/api/mobile/driver/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getProfile: () =>
    apiRequest<DriverUser>('/api/mobile/driver/profile'),

  updateProfile: (data: Partial<DriverUser>) =>
    apiRequest<DriverUser>('/api/mobile/driver/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Status
  getStatus: () =>
    apiRequest<{ isActive: boolean; isAvailable: boolean }>('/api/mobile/driver/status'),

  setAvailability: (isAvailable: boolean) =>
    apiRequest<{ success: boolean; isAvailable: boolean }>('/api/mobile/driver/status', {
      method: 'PATCH',
      body: JSON.stringify({ isAvailable }),
    }),

  // Rides
  getRides: (filter?: 'today' | 'upcoming' | 'past') =>
    apiRequest<{ rides: DriverRide[] }>(`/api/mobile/driver/rides${filter ? `?filter=${filter}` : ''}`),

  getRide: (rideId: number) =>
    apiRequest<DriverRide>(`/api/mobile/driver/rides/${rideId}`),

  updateRideStatus: (rideId: number, status: RideStatusUpdate) =>
    apiRequest<{ success: boolean; status: string }>(`/api/mobile/driver/rides/${rideId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // Location
  updateLocation: (latitude: number, longitude: number, heading?: number, speed?: number, accuracy?: number) =>
    apiRequest<{ success: boolean }>('/api/mobile/driver/location', {
      method: 'POST',
      body: JSON.stringify({ latitude, longitude, heading, speed, accuracy }),
    }),

  getLocation: () =>
    apiRequest<{
      latitude: number;
      longitude: number;
      heading: number | null;
      speed: number | null;
      updatedAt: string;
    }>('/api/mobile/driver/location'),

  // Earnings
  getEarnings: () =>
    apiRequest<EarningsSummary>('/api/mobile/driver/earnings'),

  getTransactions: (page?: number) =>
    apiRequest<{ transactions: EarningsTransaction[]; hasMore: boolean }>(
      `/api/mobile/driver/earnings/transactions${page ? `?page=${page}` : ''}`
    ),
};

// ============================================
// Partner API (Affiliate + Supplier)
// ============================================

interface Driver {
  id: number;
  name: string;
  phone: string;
  email: string;
  photoUrl: string | null;
  licenseNumber: string;
  isActive: boolean;
  isAvailable: boolean;
  rating: number;
  totalRides: number;
  vehicleId: number | null;
  vehicleInfo: string | null;
}

interface Vehicle {
  id: number;
  type: string;
  make: string;
  model: string;
  year: number;
  color: string;
  plateNumber: string;
  capacity: number;
  luggageCapacity: number;
  isActive: boolean;
  photoUrl: string | null;
  driverId: number | null;
  driverName: string | null;
}

interface Transaction {
  id: number;
  bookingCode: string;
  date: string;
  amount: number;
  currency: string;
  description: string;
  type: 'earning' | 'payout' | 'deduction';
}

export const partnerApi = {
  // Auth
  login: (email: string, password: string, type: 'affiliate' | 'supplier') =>
    apiRequest<{ user: PartnerUser; token: string; success: boolean }>('/api/mobile/partner/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, type }),
    }),

  getProfile: () =>
    apiRequest<PartnerUser>('/api/mobile/partner/profile'),

  // Dashboard
  getDashboard: () =>
    apiRequest<{
      summary: EarningsSummary;
      recentBookings: Booking[];
      stats: {
        totalBookings: number;
        pendingBookings: number;
        completedBookings: number;
      };
    }>('/api/mobile/partner/dashboard'),

  // Bookings
  getBookings: (params?: { status?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    const queryString = searchParams.toString();
    return apiRequest<{ bookings: Booking[]; page: number; limit: number }>(
      `/api/mobile/partner/bookings${queryString ? `?${queryString}` : ''}`
    );
  },

  getBookingDetails: (id: number) =>
    apiRequest<Booking>(`/api/mobile/partner/bookings/${id}`),

  updateBookingStatus: (id: number, status: string) =>
    apiRequest<{ success: boolean }>(`/api/mobile/partner/bookings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  assignDriverToBooking: (bookingId: number, driverId: number) =>
    apiRequest<{ success: boolean }>(`/api/mobile/partner/bookings/${bookingId}`, {
      method: 'PATCH',
      body: JSON.stringify({ driverId }),
    }),

  // Earnings
  getEarnings: (period?: 'today' | 'week' | 'month' | 'year') =>
    apiRequest<{
      summary: EarningsSummary;
      transactions: Transaction[];
    }>(`/api/mobile/partner/earnings${period ? `?period=${period}` : ''}`),

  requestPayout: (amount: number) =>
    apiRequest<{ message: string; payoutId: number }>('/api/mobile/partner/payouts', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),

  // Supplier-specific: Drivers
  getDrivers: () =>
    apiRequest<Driver[]>('/api/mobile/partner/drivers'),

  getDriver: (id: number) =>
    apiRequest<Driver>(`/api/mobile/partner/drivers/${id}`),

  updateDriverStatus: (id: number, isActive: boolean) =>
    apiRequest<{ success: boolean }>(`/api/mobile/partner/drivers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    }),

  updateDriverAvailability: (id: number, isAvailable: boolean) =>
    apiRequest<{ success: boolean }>(`/api/mobile/partner/drivers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isAvailable }),
    }),

  // Supplier-specific: Vehicles
  getVehicles: () =>
    apiRequest<Vehicle[]>('/api/mobile/partner/vehicles'),

  getVehicle: (id: number) =>
    apiRequest<Vehicle>(`/api/mobile/partner/vehicles/${id}`),

  updateVehicleStatus: (id: number, isActive: boolean) =>
    apiRequest<{ success: boolean }>(`/api/mobile/partner/vehicles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    }),
};

// ============================================
// Common API
// ============================================

export const commonApi = {
  // Airports
  getAirports: (search?: string) =>
    apiRequest<{ id: number; code: string; name: string; city: string; country: string }[]>(
      `/api/mobile/airports${search ? `?search=${encodeURIComponent(search)}` : ''}`
    ),

  // Notifications
  registerPushToken: (token: string, platform: 'ios' | 'android') =>
    apiRequest<{ success: boolean }>('/api/mobile/notifications/register', {
      method: 'POST',
      body: JSON.stringify({ token, platform }),
    }),

  unregisterPushToken: (token: string) =>
    apiRequest<{ success: boolean }>('/api/mobile/notifications/unregister', {
      method: 'DELETE',
      body: JSON.stringify({ token }),
    }),
};
