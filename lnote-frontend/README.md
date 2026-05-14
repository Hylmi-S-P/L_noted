# L-Note Frontend — React Native + Expo

Mobile application for laundry business transaction management with AI-powered OCR receipt scanning.

## 📱 Project Structure

```
lnote-frontend/
├── src/
│   ├── screens/                 # Screen components (one per route)
│   │   ├── Auth/                # Login, splash
│   │   ├── Dashboard/           # Home/dashboard
│   │   ├── Transaction/         # Transaction management
│   │   ├── OCR/                 # Camera & OCR result review
│   │   ├── History/             # Transaction history & search
│   │   └── Settings/            # App settings
│   ├── components/
│   │   ├── UI/                  # Reusable UI elements (Button, Card, Input, etc)
│   │   ├── Forms/               # Complex form components
│   │   ├── Navigation/          # Tab bar, stack navigator
│   │   └── Common/              # Modals, loaders, toasts
│   ├── navigation/              # Navigation configuration & routing
│   ├── services/
│   │   ├── api/                 # API client & endpoints
│   │   ├── storage/             # Local storage (AsyncStorage, SecureStore)
│   │   └── notification/        # FCM & push notifications
│   ├── hooks/                   # Custom React hooks
│   ├── context/                 # React Context (Auth, Theme, etc)
│   ├── utils/                   # Utility functions & helpers
│   ├── constants/               # App constants, endpoints, messages
│   ├── assets/
│   │   ├── images/              # PNG, JPG images
│   │   ├── icons/               # SVG icons
│   │   └── fonts/               # Custom fonts
│   └── App.tsx                  # Main app entry point
├── .github/                     # GitHub workflows
├── app.json                     # Expo configuration
├── package.json                 # Dependencies
├── .env.example                 # Environment variables template
└── tsconfig.json                # TypeScript config

```

## 🛠️ Tech Stack

- **Framework:** React Native with Expo
- **Language:** TypeScript
- **Navigation:** React Navigation
- **HTTP Client:** Axios
- **State Management:** Context API / Redux (optional)
- **Storage:** AsyncStorage (public), SecureStore (tokens)
- **Camera:** Expo Camera
- **Image Processing:** Expo Image Manipulator
- **Notifications:** Expo Notifications + Firebase FCM
- **UI Components:** React Native Paper / Custom

## 📦 Dependencies

### Core
```
expo
react-native
react-native-web
@react-navigation/native
@react-navigation/bottom-tabs
@react-navigation/stack
```

### Services
```
axios
expo-camera
expo-image-manipulator
expo-notifications
firebase
```

### Utils
```
dayjs
react-native-paper
react-native-vector-icons
```

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start dev server
expo start

# Run on iOS/Android
# Press 'i' for iOS or 'a' for Android
```

## 📋 Features to Implement

- [ ] Authentication (login/logout)
- [ ] Dashboard with daily summary
- [ ] Add transaction (manual form)
- [ ] Camera + OCR integration
- [ ] Review OCR results
- [ ] Transaction history & filters
- [ ] Update transaction status
- [ ] Update payment status
- [ ] Daily report summary
- [ ] Settings & profile

## 🔐 Environment Variables

Create `.env` file:
```
EXPO_PUBLIC_API_URL=https://api.lnote.local
EXPO_PUBLIC_API_TIMEOUT=30000
EXPO_PUBLIC_GOOGLE_VISION_ENABLED=true
```

## 📱 Build for Production

```bash
# Build APK for Android
eas build --platform android --type apk

# Build IPA for iOS
eas build --platform ios --type ipa
```

## 📚 Documentation

- [API Integration](./docs/API.md)
- [Component Library](./docs/COMPONENTS.md)
- [State Management](./docs/STATE_MANAGEMENT.md)

