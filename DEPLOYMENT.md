# App Store & Play Store Deployment Guide

## Prerequisites

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo:**
   ```bash
   eas login
   ```

3. **Install dependencies:**
   ```bash
   cd airporttransfer-mobile
   npm install
   ```

## Step 1: Create Apps in App Store Connect

1. Go to https://appstoreconnect.apple.com
2. Click "My Apps" → "+" → "New App"
3. Create 3 apps:
   - **ATP - Airport Transfers** (Customer app)
     - Bundle ID: `com.airporttransferportal.customer`
   - **ATP Driver** (Driver app)
     - Bundle ID: `com.airporttransferportal.driver`
   - **ATP Partner** (Partner app)
     - Bundle ID: `com.airporttransferportal.partner`

## Step 2: Get Your Apple Team ID

1. Go to https://developer.apple.com/account
2. Click "Membership" in the left sidebar
3. Copy your **Team ID** (10 characters like "ABCD123456")

## Step 3: Update Configuration

Replace `YOUR_TEAM_ID` in each `eas.json` file:
- `apps/customer/eas.json`
- `apps/driver/eas.json`
- `apps/partner/eas.json`

## Step 4: Initialize EAS Projects

```bash
# Customer App
cd apps/customer
eas build:configure
# When prompted, select "Create a new EAS project"

# Driver App
cd ../driver
eas build:configure

# Partner App
cd ../partner
eas build:configure
```

## Step 5: Add App Icons & Splash Screens

For each app, add these files to the `assets` folder:
- `icon.png` - 1024x1024 (App icon)
- `adaptive-icon.png` - 1024x1024 (Android adaptive icon)
- `splash.png` - 1284x2778 (Splash screen)
- `favicon.png` - 48x48 (Web favicon)
- `notification-icon.png` - 96x96 (Notification icon, Android)

## Step 6: Build for App Store

```bash
# Build Customer App for iOS
cd apps/customer
eas build --platform ios --profile production

# Build Driver App for iOS
cd ../driver
eas build --platform ios --profile production

# Build Partner App for iOS
cd ../partner
eas build --platform ios --profile production
```

The first build will prompt you to:
1. Log in with your Apple ID
2. Select your Apple Team
3. Generate or select certificates automatically

## Step 7: Submit to App Store

```bash
# Submit Customer App
cd apps/customer
eas submit --platform ios --latest

# Submit Driver App
cd ../driver
eas submit --platform ios --latest

# Submit Partner App
cd ../partner
eas submit --platform ios --latest
```

## Step 8: Complete App Store Listing

In App Store Connect, for each app add:
- Screenshots (6.5" and 5.5" iPhone)
- App description
- Keywords
- Support URL
- Privacy Policy URL
- Age rating
- App category: Travel

## App Store Review Checklist

- [ ] Privacy Policy URL added
- [ ] App description completed
- [ ] Screenshots uploaded
- [ ] Contact information added
- [ ] Export compliance answered
- [ ] Content rights confirmed

## Useful Commands

```bash
# Check build status
eas build:list

# View build logs
eas build:view

# Cancel a build
eas build:cancel

# Update over-the-air (after app is published)
eas update --branch production
```

## Environment Variables

Create `.env` file in each app:
```
EXPO_PUBLIC_API_URL=https://airporttransferportal.com
```

## Troubleshooting

### "Bundle identifier already in use"
The bundle ID is already registered. Either:
- Use the existing certificate
- Change the bundle ID in app.json

### Build fails with signing error
Run: `eas credentials --platform ios` to manage certificates

### App rejected for missing permissions
Make sure all `infoPlist` permissions have clear descriptions explaining why the app needs access.
