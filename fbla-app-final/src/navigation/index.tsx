import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, TouchableOpacity, Text } from 'react-native';
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

function MainTabs() {
  const { currentUser, logout } = useAuth();
  return (
    <Tab.Navigator
      id="MainTabs"
      initialRouteName="News"
      screenOptions={{
        headerLeft: () => (  // Smaller logo for full visibility in top left
          <Image source={require('../../assets/logo.png')} style={{ width: 65, height: 15, marginLeft: 10 }} />
        ),
        headerRight: () => (
          <TouchableOpacity onPress={logout} style={{ marginRight: 10 }}>
            <Text>Logout</Text>
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
  const { currentUser } = useAuth();
  const isLoggedIn = !!currentUser;

  return (
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
  );
}