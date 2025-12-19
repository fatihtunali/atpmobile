import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  FlatList,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button, Card, Loading, colors, spacing } from '@shared/components';
import { useSearchStore } from '@shared/stores';
import { commonApi } from '@shared/api';
import { formatDate } from '@shared/utils';

interface Airport {
  id: number;
  code: string;
  name: string;
  city: string;
  country: string;
}

interface PlacePrediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

export default function HomeScreen() {
  const {
    pickupType,
    dropoffType,
    pickupAirport,
    dropoffAirport,
    pickupAddress,
    dropoffAddress,
    pickupDate,
    pickupTime,
    passengers,
    setPickupType,
    setDropoffType,
    setPickupAirport,
    setDropoffAirport,
    setPickupAddress,
    setDropoffAddress,
    setPickupDate,
    setPickupTime,
    setPassengers,
    swapLocations,
  } = useSearchStore();

  // Modal states
  const [airportModalVisible, setAirportModalVisible] = useState(false);
  const [airportModalType, setAirportModalType] = useState<'pickup' | 'dropoff'>('pickup');
  const [airportSearch, setAirportSearch] = useState('');
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loadingAirports, setLoadingAirports] = useState(false);

  // Date/Time picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showPassengerPicker, setShowPassengerPicker] = useState(false);

  // Address modal state with Google Places
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [addressModalType, setAddressModalType] = useState<'pickup' | 'dropoff'>('pickup');
  const [addressInput, setAddressInput] = useState('');
  const [placePredictions, setPlacePredictions] = useState<PlacePrediction[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [sessionToken] = useState(() => Math.random().toString(36).substring(7));

  // Search airports
  useEffect(() => {
    if (airportModalVisible) {
      searchAirports(airportSearch);
    }
  }, [airportSearch, airportModalVisible]);

  // Search places with debounce
  useEffect(() => {
    if (!addressModalVisible) return;

    if (addressInput.length < 3) {
      setPlacePredictions([]);
      return;
    }

    const timer = setTimeout(() => {
      searchPlaces(addressInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [addressInput, addressModalVisible]);

  const searchAirports = async (query: string) => {
    setLoadingAirports(true);
    try {
      const response = await commonApi.getAirports(query || undefined);
      if (response.success && response.data) {
        setAirports(response.data);
      }
    } catch (error) {
      console.error('Failed to search airports:', error);
    } finally {
      setLoadingAirports(false);
    }
  };

  const searchPlaces = async (query: string) => {
    setLoadingPlaces(true);
    try {
      const response = await commonApi.searchPlaces(query, sessionToken);
      if (response.success && response.data) {
        setPlacePredictions(response.data.predictions || []);
      }
    } catch (error) {
      console.error('Failed to search places:', error);
    } finally {
      setLoadingPlaces(false);
    }
  };

  const openAirportModal = (type: 'pickup' | 'dropoff') => {
    setAirportModalType(type);
    setAirportSearch('');
    setAirportModalVisible(true);
  };

  const selectAirport = (airport: Airport) => {
    if (airportModalType === 'pickup') {
      setPickupAirport({ code: airport.code, name: `${airport.name} (${airport.code})` });
    } else {
      setDropoffAirport({ code: airport.code, name: `${airport.name} (${airport.code})` });
    }
    setAirportModalVisible(false);
  };

  const openAddressModal = (type: 'pickup' | 'dropoff') => {
    setAddressModalType(type);
    setAddressInput('');
    setPlacePredictions([]);
    setAddressModalVisible(true);
  };

  const selectPlace = async (prediction: PlacePrediction) => {
    try {
      const response = await commonApi.getPlaceDetails(prediction.placeId, sessionToken);
      if (response.success && response.data) {
        const { address, latitude, longitude } = response.data;
        if (addressModalType === 'pickup') {
          setPickupAddress(address, { lat: latitude, lng: longitude });
        } else {
          setDropoffAddress(address, { lat: latitude, lng: longitude });
        }
        setAddressModalVisible(false);
      }
    } catch (error) {
      console.error('Failed to get place details:', error);
      // Fallback to using the description
      if (addressModalType === 'pickup') {
        setPickupAddress(prediction.description);
      } else {
        setDropoffAddress(prediction.description);
      }
      setAddressModalVisible(false);
    }
  };

  const handleLocationPress = (type: 'pickup' | 'dropoff') => {
    const locationType = type === 'pickup' ? pickupType : dropoffType;
    if (locationType === 'airport') {
      openAirportModal(type);
    } else {
      openAddressModal(type);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setPickupDate(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      setPickupTime(`${hours}:${minutes}`);
    }
  };

  const handleSearch = () => {
    // Validate
    if (pickupType === 'airport' && !pickupAirport) {
      Alert.alert('Missing Information', 'Please select a pickup airport');
      return;
    }
    if (dropoffType === 'airport' && !dropoffAirport) {
      Alert.alert('Missing Information', 'Please select a dropoff airport');
      return;
    }
    if (pickupType === 'address' && !pickupAddress) {
      Alert.alert('Missing Information', 'Please enter a pickup address');
      return;
    }
    if (dropoffType === 'address' && !dropoffAddress) {
      Alert.alert('Missing Information', 'Please enter a dropoff address');
      return;
    }

    router.push('/search/results');
  };

  const formatTime12h = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Book Your Airport Transfer</Text>
        <Text style={styles.heroSubtitle}>
          Reliable transfers to and from airports worldwide
        </Text>
      </View>

      {/* Search Card */}
      <Card style={styles.searchCard}>
        {/* Pickup */}
        <View style={styles.locationSection}>
          <View style={styles.locationHeader}>
            <View style={styles.locationDot} />
            <Text style={styles.locationLabel}>Pickup</Text>
          </View>

          <View style={styles.typeToggle}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                pickupType === 'airport' && styles.typeButtonActive,
              ]}
              onPress={() => setPickupType('airport')}
            >
              <Ionicons
                name="airplane"
                size={16}
                color={pickupType === 'airport' ? colors.primary : colors.textMuted}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  pickupType === 'airport' && styles.typeButtonTextActive,
                ]}
              >
                Airport
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                pickupType === 'address' && styles.typeButtonActive,
              ]}
              onPress={() => setPickupType('address')}
            >
              <Ionicons
                name="location"
                size={16}
                color={pickupType === 'address' ? colors.primary : colors.textMuted}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  pickupType === 'address' && styles.typeButtonTextActive,
                ]}
              >
                Address
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.locationInput}
            onPress={() => handleLocationPress('pickup')}
          >
            <Ionicons name="search" size={20} color={colors.textMuted} />
            <Text style={styles.locationInputText}>
              {pickupType === 'airport'
                ? pickupAirport?.name || 'Select airport'
                : pickupAddress || 'Enter address'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Swap Button */}
        <TouchableOpacity style={styles.swapButton} onPress={swapLocations}>
          <Ionicons name="swap-vertical" size={20} color={colors.primary} />
        </TouchableOpacity>

        {/* Dropoff */}
        <View style={styles.locationSection}>
          <View style={styles.locationHeader}>
            <View style={[styles.locationDot, styles.locationDotDestination]} />
            <Text style={styles.locationLabel}>Dropoff</Text>
          </View>

          <View style={styles.typeToggle}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                dropoffType === 'airport' && styles.typeButtonActive,
              ]}
              onPress={() => setDropoffType('airport')}
            >
              <Ionicons
                name="airplane"
                size={16}
                color={dropoffType === 'airport' ? colors.primary : colors.textMuted}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  dropoffType === 'airport' && styles.typeButtonTextActive,
                ]}
              >
                Airport
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                dropoffType === 'address' && styles.typeButtonActive,
              ]}
              onPress={() => setDropoffType('address')}
            >
              <Ionicons
                name="location"
                size={16}
                color={dropoffType === 'address' ? colors.primary : colors.textMuted}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  dropoffType === 'address' && styles.typeButtonTextActive,
                ]}
              >
                Address
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.locationInput}
            onPress={() => handleLocationPress('dropoff')}
          >
            <Ionicons name="search" size={20} color={colors.textMuted} />
            <Text style={styles.locationInputText}>
              {dropoffType === 'airport'
                ? dropoffAirport?.name || 'Select airport'
                : dropoffAddress || 'Enter address'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Date, Time, Passengers */}
        <View style={styles.detailsRow}>
          <TouchableOpacity
            style={styles.detailItem}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color={colors.textMuted} />
            <Text style={styles.detailText}>{formatDate(pickupDate)}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.detailItem}
            onPress={() => setShowTimePicker(true)}
          >
            <Ionicons name="time-outline" size={20} color={colors.textMuted} />
            <Text style={styles.detailText}>{formatTime12h(pickupTime)}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.detailItem}
            onPress={() => setShowPassengerPicker(true)}
          >
            <Ionicons name="people-outline" size={20} color={colors.textMuted} />
            <Text style={styles.detailText}>{passengers}</Text>
          </TouchableOpacity>
        </View>

        {/* Search Button */}
        <Button
          title="Search Transfers"
          onPress={handleSearch}
          fullWidth
          size="lg"
        />
      </Card>

      {/* Features */}
      <View style={styles.features}>
        <View style={styles.feature}>
          <View style={styles.featureIcon}>
            <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
          </View>
          <Text style={styles.featureTitle}>Safe & Reliable</Text>
          <Text style={styles.featureText}>Licensed drivers & vehicles</Text>
        </View>

        <View style={styles.feature}>
          <View style={styles.featureIcon}>
            <Ionicons name="pricetag" size={24} color={colors.primary} />
          </View>
          <Text style={styles.featureTitle}>Fixed Prices</Text>
          <Text style={styles.featureText}>No hidden charges</Text>
        </View>

        <View style={styles.feature}>
          <View style={styles.featureIcon}>
            <Ionicons name="time" size={24} color={colors.primary} />
          </View>
          <Text style={styles.featureTitle}>24/7 Service</Text>
          <Text style={styles.featureText}>Flight monitoring</Text>
        </View>
      </View>

      {/* Airport Search Modal */}
      <Modal
        visible={airportModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setAirportModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Select {airportModalType === 'pickup' ? 'Pickup' : 'Dropoff'} Airport
            </Text>
            <TouchableOpacity onPress={() => setAirportModalVisible(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color={colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search airports..."
              placeholderTextColor={colors.textMuted}
              value={airportSearch}
              onChangeText={setAirportSearch}
              autoFocus
            />
          </View>

          {loadingAirports ? (
            <View style={styles.loadingContainer}>
              <Loading />
            </View>
          ) : (
            <FlatList
              data={airports}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.airportItem}
                  onPress={() => selectAirport(item)}
                >
                  <View style={styles.airportIcon}>
                    <Ionicons name="airplane" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.airportInfo}>
                    <Text style={styles.airportName}>
                      {item.name} ({item.code})
                    </Text>
                    <Text style={styles.airportLocation}>
                      {item.city}, {item.country}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  {airportSearch ? 'No airports found' : 'Type to search airports'}
                </Text>
              }
            />
          )}
        </View>
      </Modal>

      {/* Address Modal with Google Places */}
      <Modal
        visible={addressModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setAddressModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Search {addressModalType === 'pickup' ? 'Pickup' : 'Dropoff'} Address
            </Text>
            <TouchableOpacity onPress={() => setAddressModalVisible(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color={colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for a location..."
              placeholderTextColor={colors.textMuted}
              value={addressInput}
              onChangeText={setAddressInput}
              autoFocus
            />
            {addressInput.length > 0 && (
              <TouchableOpacity onPress={() => setAddressInput('')}>
                <Ionicons name="close-circle" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {loadingPlaces ? (
            <View style={styles.loadingContainer}>
              <Loading />
            </View>
          ) : (
            <FlatList
              data={placePredictions}
              keyExtractor={(item) => item.placeId}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.placeItem}
                  onPress={() => selectPlace(item)}
                >
                  <View style={styles.placeIcon}>
                    <Ionicons name="location" size={20} color={colors.primary} />
                  </View>
                  <View style={styles.placeInfo}>
                    <Text style={styles.placeMainText}>{item.mainText}</Text>
                    <Text style={styles.placeSecondaryText}>{item.secondaryText}</Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyPlaces}>
                  <Ionicons name="location-outline" size={48} color={colors.border} />
                  <Text style={styles.emptyText}>
                    {addressInput.length < 3
                      ? 'Type at least 3 characters to search'
                      : 'No locations found'}
                  </Text>
                </View>
              }
            />
          )}

          <View style={styles.poweredByGoogle}>
            <Text style={styles.poweredByText}>Powered by Google</Text>
          </View>
        </View>
      </Modal>

      {/* Passenger Picker Modal */}
      <Modal
        visible={showPassengerPicker}
        animationType="fade"
        transparent
        onRequestClose={() => setShowPassengerPicker(false)}
      >
        <TouchableOpacity
          style={styles.pickerOverlay}
          activeOpacity={1}
          onPress={() => setShowPassengerPicker(false)}
        >
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerTitle}>Number of Passengers</Text>
            <View style={styles.passengerOptions}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.passengerOption,
                    passengers === num && styles.passengerOptionActive,
                  ]}
                  onPress={() => {
                    setPassengers(num);
                    setShowPassengerPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.passengerOptionText,
                      passengers === num && styles.passengerOptionTextActive,
                    ]}
                  >
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={pickupDate}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={handleDateChange}
        />
      )}

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={new Date(`2000-01-01T${pickupTime}:00`)}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hero: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  searchCard: {
    margin: spacing.md,
    padding: spacing.lg,
  },
  locationSection: {
    marginBottom: spacing.md,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
    marginRight: spacing.sm,
  },
  locationDotDestination: {
    backgroundColor: colors.secondary,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  typeToggle: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: spacing.sm,
    backgroundColor: colors.background,
  },
  typeButtonActive: {
    backgroundColor: `${colors.primary}15`,
  },
  typeButtonText: {
    fontSize: 13,
    color: colors.textMuted,
    marginLeft: 4,
  },
  typeButtonTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  locationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 12,
  },
  locationInputText: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 15,
    color: colors.textSecondary,
  },
  swapButton: {
    position: 'absolute',
    right: spacing.lg,
    top: 120,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: spacing.xs,
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  feature: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
    textAlign: 'center',
  },
  featureText: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 16,
    color: colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  airportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  airportIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  airportInfo: {
    flex: 1,
  },
  airportName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  airportLocation: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: spacing.xl,
  },
  // Address modal styles
  // Place item styles for Google Places
  placeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  placeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  placeInfo: {
    flex: 1,
  },
  placeMainText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  placeSecondaryText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  emptyPlaces: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  poweredByGoogle: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  poweredByText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  // Passenger picker styles
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    width: '80%',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  passengerOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  passengerOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    margin: spacing.xs,
  },
  passengerOptionActive: {
    backgroundColor: colors.primary,
  },
  passengerOptionText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  passengerOptionTextActive: {
    color: '#fff',
  },
});
