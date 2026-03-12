import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, TouchableOpacity, Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import NewsFeedScreen from '../screens/NewsFeedScreen';
import EventsScreen from '../screens/EventsScreen';
import ResourcesScreen from '../screens/ResourcesScreen';
import ProfilesScreen from '../screens/ProfilesScreen';
import SocialMediaScreen from '../screens/SocialMediaScreen';
import { useAuth } from '../context/AuthContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    News: '📰',
    Events: '📅',
    Resources: '📁',
    Profiles: '👥',
    Social: '🔗',
  };
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{icons[name] ?? '•'}</Text>
  );
}

function MainTabs() {
  const { currentUser, logout } = useAuth();
  return (
    <Tab.Navigator
      id="MainTabs"
      initialRouteName="News"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarActiveTintColor: '#1E66FF',
        tabBarInactiveTintColor: '#999',
        headerLeft: () => (
          <Image
            source={require('../../assets/logo.png')}
            style={{ width: 65, height: 15, marginLeft: 10 }}
            resizeMode="contain"
          />
        ),
        headerRight: () => (
          <TouchableOpacity onPress={logout} style={{ marginRight: 14 }}>
            <Text style={{ color: '#1E66FF', fontWeight: '600' }}>Logout</Text>
          </TouchableOpacity>
        ),
      })}
    >
      <Tab.Screen name="News" component={NewsFeedScreen} />
      <Tab.Screen name="Events" component={EventsScreen} />
      <Tab.Screen name="Resources" component={ResourcesScreen} />
      <Tab.Screen name="Profiles" component={ProfilesScreen} />
      <Tab.Screen name="Social" component={SocialMediaScreen} />
    </Tab.Navigator>
  );
}

function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <Image
        source={require('../../assets/logo.png')}
        style={{ width: 130, height: 30, marginBottom: 24 }}
        resizeMode="contain"
      />
      <ActivityIndicator size="large" color="#1E66FF" />
      <Text style={styles.loadingText}>Loading FBLA Member App…</Text>
    </View>
  );
}

export default function Navigation() {
  const { currentUser, isLoading } = useAuth();
  const isLoggedIn = !!currentUser;

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <LoadingScreen />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          id="RootStack"
          screenOptions={{ headerShown: false }}>
          {!isLoggedIn ? (
            <Stack.Group key="auth">
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
            </Stack.Group>
          ) : (
            <Stack.Group key="app">
              <Stack.Screen name="Main" component={MainTabs} />
            </Stack.Group>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    color: '#555',
    fontSize: 14,
  },
});