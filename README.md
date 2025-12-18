# Airport Transfer Portal - Mobile Apps

This monorepo contains three React Native (Expo) mobile applications for the Airport Transfer Portal platform.

## Apps

| App | Description | Users |
|-----|-------------|-------|
| **customer** | Book and track airport transfers | End customers |
| **driver** | Accept rides, navigate, update status | Transfer drivers |
| **partner** | Manage bookings, view earnings | Affiliates & Suppliers |

## Project Structure

```
airporttransfer-mobile/
├── apps/
│   ├── customer/          # Customer booking app
│   ├── driver/            # Driver ride management app
│   └── partner/           # Affiliate & Supplier dashboard app
├── packages/
│   └── shared/
│       ├── api/           # API client for backend communication
│       ├── types/         # TypeScript type definitions
│       ├── components/    # Shared UI components
│       ├── hooks/         # Shared React hooks
│       ├── stores/        # Zustand state management
│       └── utils/         # Utility functions
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
# Install dependencies
npm install

# Start Customer app
npm run customer

# Start Driver app
npm run driver

# Start Partner app
npm run partner
```

### Running on Device

```bash
# Customer app on iOS
npm run customer:ios

# Customer app on Android
npm run customer:android

# Same pattern for driver and partner apps
```

## Building for Production

### Setup EAS

```bash
# Login to Expo
eas login

# Configure EAS for each app
cd apps/customer && eas build:configure
cd apps/driver && eas build:configure
cd apps/partner && eas build:configure
```

### Build Commands

```bash
# Build Customer app for iOS
npm run build:customer:ios

# Build Customer app for Android
npm run build:customer:android

# Same pattern for driver and partner apps
```

## Environment Variables

Create `.env` files in each app directory:

```env
EXPO_PUBLIC_API_URL=https://airporttransferportal.com
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=xxx
EXPO_PUBLIC_PROJECT_ID=xxx
```

## API Backend

These apps communicate with the main Airport Transfer Portal backend:

- **Production**: https://airporttransferportal.com/api/mobile/*
- **Local Dev**: http://localhost:3000/api/mobile/*

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **State Management**: Zustand
- **Styling**: React Native StyleSheet
- **Maps**: react-native-maps
- **Payments**: Stripe React Native SDK
- **Push Notifications**: Expo Notifications + Firebase

## App Store Submission

### iOS (App Store)

1. Build: `eas build --platform ios --profile production`
2. Submit: `eas submit --platform ios`

### Android (Google Play)

1. Build: `eas build --platform android --profile production`
2. Submit: `eas submit --platform android`
