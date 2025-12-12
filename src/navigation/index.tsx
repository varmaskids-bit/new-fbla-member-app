import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import EventsScreen from '../screens/EventsScreen';
import ResourcesScreen from '../screens/ResourcesScreen';
import ProfilesScreen from '../screens/ProfilesScreen';
import NewsFeedScreen from '../screens/NewsFeedScreen';
import SocialMediaScreen from '../screens/SocialMediaScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const auth = useAuth();
  return (
    <Tab.Navigator
      initialRouteName="News"
      screenOptions={{
        headerRight: () => (
          <TouchableOpacity onPress={() => auth.logout()} style={{ marginRight: 16 }}>
            <Text style={{ color: '#1E66FF', fontWeight: '700' }}>Logout</Text>
          </TouchableOpacity>
        ),
      }}
    >
      <Tab.Screen name="News" component={NewsFeedScreen} />
      <Tab.Screen name="Events" component={EventsScreen} />
      <Tab.Screen name="Resources" component={ResourcesScreen} />
      <Tab.Screen name="Profiles" component={ProfilesScreen} />
      <Tab.Screen name="Social" component={SocialMediaScreen} />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  const auth = useAuth();
  const isLoggedIn = !!auth.currentUser;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
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
  );
}