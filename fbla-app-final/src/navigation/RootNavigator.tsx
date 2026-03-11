import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EventsScreen from '../screens/EventsScreen';
import NewsScreen from '../screens/NewsScreen';
import ResourcesScreen from '../screens/ResourcesScreen';
import { useProfiles } from '../context/ProfilesContext';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function AppTabs() {
  return (
    <Tabs.Navigator
      id="AppTabs"
      screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="Events" component={EventsScreen} />
      <Tabs.Screen name="News" component={NewsScreen} />
      <Tabs.Screen name="Resources" component={ResourcesScreen} />
      <Tabs.Screen name="Profile" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}

export default function RootNavigator() {
  const ctx = useProfiles();
  return (
    <NavigationContainer theme={DarkTheme}>
      {!ctx.isSignedIn ? (
        <Stack.Navigator
          id="AuthStack"
          screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
      ) : (
        <AppTabs />
      )}
    </NavigationContainer>
  );
}
