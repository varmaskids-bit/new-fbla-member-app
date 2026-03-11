# FBLA Member App

A comprehensive mobile application for FBLA (Future Business Leaders of America) members, built with React Native and Expo. Features include news feeds, event management, resource sharing, member profiles, and social media integration.

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Expo CLI** (`npm install -g @expo/cli`)
- **iOS Simulator** (macOS only) or **Android Emulator**
- **EAS CLI** for deployment (`npm install -g eas-cli`)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/varmaskids-bit/new-fbla-member-app.git
   cd fbla-member-app
   ```

2. **Navigate to the main project directory**
   ```bash
   cd fbla-app-final
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start the development server**
   ```bash
   npm start
   # or
   npx expo start
   ```

### Running on Different Platforms

#### iOS Simulator (macOS)
```bash
npm run ios
# or
npx expo run:ios
```

#### Android Emulator/Device
```bash
npm run android
# or
npx expo run:android
```

#### Web Browser
```bash
npm run web
# or
npx expo start --web
```

## 📱 Features

- **Authentication**: Secure login and registration system
- **News Feed**: Latest FBLA news and announcements
- **Events Management**: Create, view, and manage FBLA events
- **Resource Sharing**: Share and access educational resources
- **Member Profiles**: View and manage member information
- **Social Media Integration**: Connect with other FBLA members
- **Offline Support**: Local data storage with SQLite

## 🏗️ Project Structure

```
fbla-app-final/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── EventCard.tsx
│   │   ├── NewsCard.tsx
│   │   ├── ResourceCard.tsx
│   │   └── ThemedText.tsx
│   ├── context/             # React Context providers
│   │   ├── AuthContext.tsx
│   │   ├── EventsContext.tsx
│   │   ├── NewsContext.tsx
│   │   ├── ProfilesContext.tsx
│   │   ├── ResourcesContext.tsx
│   │   └── SocialContext.tsx
│   ├── data/                # Mock data and constants
│   │   └── mock.ts
│   ├── navigation/          # Navigation configuration
│   │   ├── index.tsx
│   │   └── RootNavigator.tsx
│   ├── screens/             # App screens/pages
│   │   ├── EventsScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── NewsFeedScreen.tsx
│   │   ├── NewsScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── ProfilesScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── ResourcesScreen.tsx
│   │   └── SocialMediaScreen.tsx
│   └── storage/             # Data persistence layer
│       ├── migrateUsers.ts
│       └── userStore.ts
├── assets/                  # Images, icons, and media files
├── App.tsx                  # Main app component
├── app.json                 # Expo configuration
├── eas.json                 # EAS build configuration
├── index.js                 # App entry point
├── package.json             # Dependencies and scripts
└── tsconfig.json            # TypeScript configuration
```

## 🔧 Configuration Files

### app.json
- **Bundle Identifier**: `com.varmapt1.fbla-app-final`
- **EAS Project ID**: `0e4a7397-a303-435b-b9ba-d155b1142ea1`
- **Platform Support**: iOS, Android, Web
- **Plugins**: SQLite database support

### eas.json
- **Development**: Internal distribution with development client
- **Preview**: Internal distribution for testing
- **Production**: Auto-incrementing version numbers

## 🚀 Deployment

### Prerequisites for Deployment

1. **Expo Account**: Sign up at [expo.dev](https://expo.dev)
2. **EAS Token**: Generate from Expo dashboard
3. **GitHub Repository**: Set up with Actions enabled

### iOS App Store Deployment

1. **Set up EAS Token in GitHub Secrets**
   - Go to repository Settings → Secrets and variables → Actions
   - Add `EAS_TOKEN` with your Expo access token

2. **Configure App Store Connect**
   - Create app in App Store Connect
   - Match bundle identifier: `com.varmapt1.fbla-app-final`

3. **Trigger Deployment**
   ```bash
   # Push to main branch to trigger GitHub Actions
   git add .
   git commit -m "Deploy to App Store"
   git push origin main
   ```

4. **Monitor Build**
   - Check GitHub Actions tab for build progress
   - App will be submitted to TestFlight automatically

### Manual EAS Build Commands

```bash
# Login to EAS
eas login

# Build for iOS
eas build --platform ios --profile production

# Submit to TestFlight
eas submit --platform ios --profile production

# Build for Android
eas build --platform android --profile production
```

## 🛠️ Development Scripts

### Available npm scripts:
```bash
npm start          # Start Expo development server
npm run ios        # Run on iOS simulator
npm run android    # Run on Android emulator
npm run web        # Run in web browser
```

### Additional development commands:
```bash
# Clear Expo cache
npx expo start --clear

# Run with specific port
npx expo start --port 8081

# Build development client
eas build --platform ios --profile development

# Check Expo doctor
npx expo doctor
```

## 📊 Tech Stack

- **Framework**: React Native 0.79.6
- **Platform**: Expo SDK 53
- **Language**: TypeScript
- **Navigation**: React Navigation v7
- **State Management**: React Context API
- **Database**: SQLite (expo-sqlite)
- **Storage**: AsyncStorage
- **Build Tool**: EAS (Expo Application Services)
- **CI/CD**: GitHub Actions

## 🔒 Security Features

- Secure authentication system
- Local data encryption
- Secure API communication
- Input validation and sanitization

## 🐛 Troubleshooting

### Common Issues

1. **Metro bundler issues**
   ```bash
   npx expo start --clear
   ```

2. **iOS simulator not starting**
   ```bash
   # Reset iOS simulator
   xcrun simctl erase all
   ```

3. **Dependencies conflicts**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **EAS build failures**
   ```bash
   eas build:inspect
   ```

### Getting Help

- Check [Expo Documentation](https://docs.expo.dev)
- Review [React Native Docs](https://reactnative.dev/docs/getting-started)
- Check GitHub Issues for known problems

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is private and intended for FBLA member use only.

---

**Built with ❤️ for FBLA Members**</content>
<parameter name="filePath">/Users/varmapenmethsa/visual_studio/fbla-member-app/README.md