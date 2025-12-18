import { create } from 'zustand';
import type { CustomerUser, DriverUser, PartnerUser, Booking } from '@shared/types';

// ============================================
// Auth Store
// ============================================

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;

  // Customer
  customer: CustomerUser | null;
  setCustomer: (customer: CustomerUser | null, token?: string) => void;

  // Driver
  driver: DriverUser | null;
  setDriver: (driver: DriverUser | null, token?: string) => void;

  // Partner
  partner: PartnerUser | null;
  setPartner: (partner: PartnerUser | null, token?: string) => void;

  // Common
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLoading: true,
  token: null,
  customer: null,
  driver: null,
  partner: null,

  setCustomer: (customer, token) =>
    set({
      customer,
      token: token || null,
      isAuthenticated: !!customer,
      isLoading: false,
    }),

  setDriver: (driver, token) =>
    set({
      driver,
      token: token || null,
      isAuthenticated: !!driver,
      isLoading: false,
    }),

  setPartner: (partner, token) =>
    set({
      partner,
      token: token || null,
      isAuthenticated: !!partner,
      isLoading: false,
    }),

  setLoading: (isLoading) => set({ isLoading }),

  logout: () =>
    set({
      isAuthenticated: false,
      token: null,
      customer: null,
      driver: null,
      partner: null,
    }),
}));

// ============================================
// Search Store (Customer App)
// ============================================

interface SearchState {
  pickupType: 'airport' | 'address';
  dropoffType: 'airport' | 'address';
  pickupAirport: { code: string; name: string } | null;
  dropoffAirport: { code: string; name: string } | null;
  pickupAddress: string;
  dropoffAddress: string;
  pickupCoords: { lat: number; lng: number } | null;
  dropoffCoords: { lat: number; lng: number } | null;
  pickupDate: Date;
  pickupTime: string;
  passengers: number;
  isReturn: boolean;
  returnDate: Date | null;
  returnTime: string;

  setPickupType: (type: 'airport' | 'address') => void;
  setDropoffType: (type: 'airport' | 'address') => void;
  setPickupAirport: (airport: { code: string; name: string } | null) => void;
  setDropoffAirport: (airport: { code: string; name: string } | null) => void;
  setPickupAddress: (address: string, coords?: { lat: number; lng: number }) => void;
  setDropoffAddress: (address: string, coords?: { lat: number; lng: number }) => void;
  setPickupDate: (date: Date) => void;
  setPickupTime: (time: string) => void;
  setPassengers: (count: number) => void;
  setIsReturn: (isReturn: boolean) => void;
  setReturnDate: (date: Date | null) => void;
  setReturnTime: (time: string) => void;
  swapLocations: () => void;
  reset: () => void;
}

const initialSearchState = {
  pickupType: 'airport' as const,
  dropoffType: 'address' as const,
  pickupAirport: null,
  dropoffAirport: null,
  pickupAddress: '',
  dropoffAddress: '',
  pickupCoords: null,
  dropoffCoords: null,
  pickupDate: new Date(),
  pickupTime: '12:00',
  passengers: 2,
  isReturn: false,
  returnDate: null,
  returnTime: '12:00',
};

export const useSearchStore = create<SearchState>((set, get) => ({
  ...initialSearchState,

  setPickupType: (type) => set({ pickupType: type }),
  setDropoffType: (type) => set({ dropoffType: type }),
  setPickupAirport: (airport) => set({ pickupAirport: airport }),
  setDropoffAirport: (airport) => set({ dropoffAirport: airport }),
  setPickupAddress: (address, coords) =>
    set({ pickupAddress: address, pickupCoords: coords || null }),
  setDropoffAddress: (address, coords) =>
    set({ dropoffAddress: address, dropoffCoords: coords || null }),
  setPickupDate: (date) => set({ pickupDate: date }),
  setPickupTime: (time) => set({ pickupTime: time }),
  setPassengers: (count) => set({ passengers: count }),
  setIsReturn: (isReturn) => set({ isReturn }),
  setReturnDate: (date) => set({ returnDate: date }),
  setReturnTime: (time) => set({ returnTime: time }),

  swapLocations: () => {
    const state = get();
    set({
      pickupType: state.dropoffType,
      dropoffType: state.pickupType,
      pickupAirport: state.dropoffAirport,
      dropoffAirport: state.pickupAirport,
      pickupAddress: state.dropoffAddress,
      dropoffAddress: state.pickupAddress,
      pickupCoords: state.dropoffCoords,
      dropoffCoords: state.pickupCoords,
    });
  },

  reset: () => set(initialSearchState),
}));

// ============================================
// Bookings Store
// ============================================

interface BookingsState {
  bookings: Booking[];
  currentBooking: Booking | null;
  isLoading: boolean;
  error: string | null;

  setBookings: (bookings: Booking[]) => void;
  setCurrentBooking: (booking: Booking | null) => void;
  updateBooking: (publicCode: string, updates: Partial<Booking>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useBookingsStore = create<BookingsState>((set, get) => ({
  bookings: [],
  currentBooking: null,
  isLoading: false,
  error: null,

  setBookings: (bookings) => set({ bookings }),
  setCurrentBooking: (booking) => set({ currentBooking: booking }),
  updateBooking: (publicCode, updates) =>
    set({
      bookings: get().bookings.map((b) =>
        b.publicCode === publicCode ? { ...b, ...updates } : b
      ),
      currentBooking:
        get().currentBooking?.publicCode === publicCode
          ? { ...get().currentBooking!, ...updates }
          : get().currentBooking,
    }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

// ============================================
// Driver Rides Store
// ============================================

interface DriverRidesState {
  rides: Booking[];
  activeRide: Booking | null;
  isOnline: boolean;
  isLoading: boolean;

  setRides: (rides: Booking[]) => void;
  setActiveRide: (ride: Booking | null) => void;
  setOnline: (online: boolean) => void;
  setLoading: (loading: boolean) => void;
  updateRide: (id: number, updates: Partial<Booking>) => void;
}

export const useDriverRidesStore = create<DriverRidesState>((set, get) => ({
  rides: [],
  activeRide: null,
  isOnline: false,
  isLoading: false,

  setRides: (rides) => set({ rides }),
  setActiveRide: (ride) => set({ activeRide: ride }),
  setOnline: (isOnline) => set({ isOnline }),
  setLoading: (isLoading) => set({ isLoading }),
  updateRide: (id, updates) =>
    set({
      rides: get().rides.map((r) => (r.id === id ? { ...r, ...updates } : r)),
      activeRide:
        get().activeRide?.id === id
          ? { ...get().activeRide!, ...updates }
          : get().activeRide,
    }),
}));

// ============================================
// Location Store
// ============================================

interface LocationState {
  currentLocation: { latitude: number; longitude: number } | null;
  heading: number | null;
  isTracking: boolean;

  setLocation: (location: { latitude: number; longitude: number }) => void;
  setHeading: (heading: number) => void;
  setTracking: (tracking: boolean) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  currentLocation: null,
  heading: null,
  isTracking: false,

  setLocation: (location) => set({ currentLocation: location }),
  setHeading: (heading) => set({ heading }),
  setTracking: (isTracking) => set({ isTracking }),
}));
