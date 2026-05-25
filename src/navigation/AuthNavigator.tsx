import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from './types';
import { Routes } from '../constants/routes';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import OTPScreen from '../screens/auth/OTPScreen';
import RoleSelectScreen from '../screens/auth/RoleSelectScreen';
import ProfileSetupScreen from '../screens/onboarding/ProfileSetupScreen';
import AIOnboardingScreen from '../screens/onboarding/AIOnboardingScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'none' }}>
      <Stack.Screen name={Routes.Welcome} component={WelcomeScreen} />
      <Stack.Screen name={Routes.Login} component={LoginScreen} />
      <Stack.Screen name={Routes.Register} component={RegisterScreen} />
      <Stack.Screen name={Routes.OTP} component={OTPScreen} />
      <Stack.Screen name={Routes.RoleSelect} component={RoleSelectScreen} />
      <Stack.Screen name={Routes.ProfileSetup} component={ProfileSetupScreen} />
      <Stack.Screen name={Routes.AIOnboarding} component={AIOnboardingScreen} />
    </Stack.Navigator>
  );
}
