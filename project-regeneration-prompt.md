# FBLA Member App - Project Regeneration Prompt

## 🎯 Project Overview

Create a comprehensive React Native mobile application for FBLA (Future Business Leaders of America) members. The app should serve as a complete platform for member engagement, featuring news feeds, event management, resource sharing, member profiles, and social connectivity.

## 🏗️ Technical Architecture

### Core Technology Stack
- **Framework**: React Native 0.79.6
- **Platform**: Expo SDK 53
- **Language**: TypeScript
- **Navigation**: React Navigation v7 (Bottom Tabs + Native Stack)
- **State Management**: React Context API with Provider hierarchy
- **Database**: SQLite via expo-sqlite
- **Storage**: AsyncStorage for session management
- **Build System**: EAS (Expo Application Services)

### Architecture Pattern
**Local-First Context-Based MVC Architecture**

```
App.tsx (Root)
├── AuthProvider (Authentication Context)
│   └── NewsProvider (News Data Context)
│       └── EventsProvider (Events Data Context)
│           └── ResourcesProvider (Resources Data Context)
│               └── ProfilesProvider (Profiles Data Context)
│                   └── SocialProvider (Social Data Context)
│                       └── Navigation Container
│                           ├── Auth Stack (Login/Register)
│                           └── Main Tabs (News/Events/Resources/Profiles)
```

## 📱 App Features & Screens

### 1. Authentication System
- **LoginScreen**: Email/password authentication
- **RegisterScreen**: New user registration
- **Session Management**: Persistent login state

### 2. Main Navigation (Bottom Tabs)
- **News Tab**: NewsFeedScreen - Latest FBLA news and announcements
- **Events Tab**: EventsScreen - Event listings and management
- **Resources Tab**: ResourcesScreen - Educational resources and documents
- **Profiles Tab**: ProfilesScreen - Member directory and profiles

### 3. Screen Specifications

#### NewsFeedScreen
- Display list of news articles
- Pull-to-refresh functionality
- Article detail view
- Bookmark/save articles

#### EventsScreen
- List upcoming FBLA events
- Event details with date, time, location
- RSVP functionality
- Event creation (admin/moderator only)

#### ResourcesScreen
- Browse educational resources
- Document viewer
- Download functionality
- Resource categories

#### ProfilesScreen
- Member directory
- Profile details view
- Contact information
- Member achievements/awards

#### ProfileScreen (Individual)
- Personal profile management
- Edit profile information
- View personal achievements

#### SocialMediaScreen
- Social feed integration
- Member connections
- Activity sharing

## 🗂️ Project Structure

```
fbla-app-final/
├── src/
│   ├── components/
│   │   ├── EventCard.tsx       # Event display component
│   │   ├── NewsCard.tsx        # News article component
│   │   ├── ResourceCard.tsx    # Resource display component
│   │   └── ThemedText.tsx      # Consistent text styling
│   ├── context/
│   │   ├── AuthContext.tsx     # Authentication state
│   │   ├── EventsContext.tsx   # Events data management
│   │   ├── NewsContext.tsx     # News data management
│   │   ├── ProfilesContext.tsx # Member profiles data
│   │   ├── ResourcesContext.tsx# Resources data management
│   │   └── SocialContext.tsx   # Social features data
│   ├── data/
│   │   └── mock.ts             # Mock data for development
│   ├── navigation/
│   │   ├── index.tsx           # Navigation container setup
│   │   └── RootNavigator.tsx   # Tab and stack navigation
│   ├── screens/
│   │   ├── EventsScreen.tsx
│   │   ├── HomeScreen.tsx      # Dashboard/home screen
│   │   ├── LoginScreen.tsx
│   │   ├── NewsFeedScreen.tsx
│   │   ├── NewsScreen.tsx      # Individual news article
│   │   ├── ProfileScreen.tsx   # Personal profile
│   │   ├── ProfilesScreen.tsx  # Member directory
│   │   ├── RegisterScreen.tsx
│   │   ├── ResourcesScreen.tsx
│   │   └── SocialMediaScreen.tsx
│   └── storage/
│       ├── migrateUsers.ts     # Database migrations
│       └── userStore.ts        # User data persistence
├── assets/
│   ├── icon.png               # App icon
│   ├── splash-icon.png        # Splash screen image
│   ├── android-icon-*.png     # Android adaptive icons
│   ├── favicon.png            # Web favicon
│   └── logo.png               # App logo
├── App.tsx                    # Root app component
├── app.json                   # Expo configuration
├── eas.json                   # EAS build configuration
├── index.js                   # App entry point
├── package.json               # Dependencies
└── tsconfig.json              # TypeScript config
```

## 📋 Dependencies (package.json)

```json
{
  "name": "fbla-app-final",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "@react-native-async-storage/async-storage": "2.1.2",
    "@react-native-picker/picker": "2.11.1",
    "@react-navigation/bottom-tabs": "^7.15.5",
    "@react-navigation/native": "^7.1.33",
    "@react-navigation/native-stack": "^7.14.4",
    "expo": "~53.0.27",
    "expo-document-picker": "~13.1.6",
    "expo-sqlite": "~15.2.14",
    "expo-status-bar": "~2.2.3",
    "react": "19.0.0",
    "react-native": "0.79.6"
  },
  "private": true
}
```

## ⚙️ Configuration Files

### app.json (Expo Configuration)
```json
{
  "expo": {
    "name": "fbla-app-final",
    "slug": "fbla-app-final",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.varmapt1.fbla-app-final",
      "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false
      }
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#E6F4FE",
        "foregroundImage": "./assets/android-icon-foreground.png",
        "backgroundImage": "./assets/android-icon-background.png",
        "monochromeImage": "./assets/android-icon-monochrome.png"
      },
      "package": "com.varmapt1.fblaappfinal"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-sqlite"
    ],
    "extra": {
      "eas": {
        "projectId": "0e4a7397-a303-435b-b9ba-d155b1142ea1"
      }
    }
  }
}
```

### eas.json (Build Configuration)
```json
{
  "cli": {
    "version": ">= 18.1.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

## 🔧 Context Providers Implementation

### AuthContext.tsx
- User authentication state management
- Login/logout functionality
- Session persistence with AsyncStorage
- User data storage

### NewsContext.tsx
- News articles data management
- CRUD operations for news
- Offline caching
- Sync with remote data

### EventsContext.tsx
- Event management (create, read, update, delete)
- RSVP functionality
- Event filtering and search
- Calendar integration

### ResourcesContext.tsx
- Educational resources management
- File upload/download
- Resource categorization
- Access permissions

### ProfilesContext.tsx
- Member profile data
- Profile editing capabilities
- Member search and filtering
- Achievement tracking

### SocialContext.tsx
- Social media integration
- Member connections
- Activity feeds
- Notification system

## 🗃️ Database Schema (SQLite)

### Tables Required:
1. **users** - User authentication and profile data
2. **news** - News articles and announcements
3. **events** - Event information and RSVPs
4. **resources** - Educational resources and documents
5. **profiles** - Extended member profile information
6. **social_posts** - Social media posts and interactions

## 🎨 UI/UX Specifications

### Design System
- **Primary Colors**: FBLA blue (#004B87), white, and accent colors
- **Typography**: Consistent font hierarchy
- **Components**: Reusable card components for content display
- **Navigation**: Bottom tab navigation with clear icons

### Screen Layouts
- **Authentication**: Clean login/register forms
- **Feed Screens**: Card-based list layouts with pull-to-refresh
- **Detail Screens**: Full content display with action buttons
- **Profile Screens**: Organized information display

## 🚀 Deployment Configuration

### GitHub Actions Workflow (.github/workflows/ios-build.yml)
```yaml
name: iOS Build and Release
on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Install EAS CLI
        run: npm install -g eas-cli

      - name: Login to EAS
        run: eas login --access-token ${{ secrets.EAS_TOKEN }}

      - name: Build iOS
        run: eas build --platform ios --profile production --non-interactive

      - name: Submit to TestFlight
        run: eas submit --platform ios --non-interactive
```

### Required GitHub Secrets
- `EAS_TOKEN`: Expo Application Services access token

## 🔒 Security & Privacy

### Authentication
- Secure password hashing
- JWT token management
- Session timeout handling
- Secure API communication

### Data Protection
- Local data encryption
- Secure file storage
- Privacy-compliant data handling
- GDPR compliance considerations

## 🧪 Testing Strategy

### Unit Tests
- Component testing with React Testing Library
- Context provider testing
- Utility function testing

### Integration Tests
- Navigation flow testing
- Data persistence testing
- API integration testing

### E2E Tests
- User journey testing
- Critical path validation

## 📈 Performance Optimization

### Code Splitting
- Route-based code splitting
- Lazy loading of screens
- Optimized bundle sizes

### Database Optimization
- Efficient queries
- Indexed database tables
- Background sync

### UI Performance
- FlatList optimization
- Image optimization
- Memory leak prevention

## 🔄 Development Workflow

1. **Setup**: Clone repo, install dependencies, configure environment
2. **Development**: Use Expo development client for rapid iteration
3. **Testing**: Test on multiple platforms (iOS, Android, Web)
4. **Build**: Use EAS for production builds
5. **Deploy**: Automated deployment via GitHub Actions

## 📚 Additional Requirements

### Platform Support
- **iOS**: 12.0+
- **Android**: API 21+
- **Web**: Modern browsers with React Native Web

### Accessibility
- Screen reader support
- Keyboard navigation
- High contrast mode support

### Internationalization
- English language support
- Extensible for multiple languages

---

## 🎯 Implementation Priority

1. **Phase 1**: Core architecture and authentication
2. **Phase 2**: Basic screens and navigation
3. **Phase 3**: Data management and SQLite integration
4. **Phase 4**: Advanced features and optimization
5. **Phase 5**: Testing and deployment

## 📞 Support & Documentation

- Include comprehensive README.md with setup instructions
- Inline code documentation
- API documentation for custom hooks and utilities
- Troubleshooting guide for common issues

---

**Use this prompt to regenerate the complete FBLA Member App with all specified features, architecture, and configurations.**</content>
<parameter name="filePath">/Users/varmapenmethsa/visual_studio/fbla-member-app/project-regeneration-prompt.md