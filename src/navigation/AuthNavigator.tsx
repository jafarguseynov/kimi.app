import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from './types';
import { Routes } from '../constants/routes';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import OTPScreen from '../screens/auth/OTPScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import RoleSelectScreen from '../screens/auth/RoleSelectScreen';
import ProfileSetupScreen from '../screens/onboarding/ProfileSetupScreen';
import AIOnboardingScreen from '../screens/onboarding/AIOnboardingScreen';
import TermsOfServiceScreen from '../screens/settings/TermsOfServiceScreen';
import PrivacyPolicyScreen from '../screens/settings/PrivacyPolicyScreen';
import { useWelcomeStore } from '../store/welcome.store';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  // Giriş karuseli yalnız ilk açılışda göstərilir. İstifadəçi bir dəfə keçəndən
  // sonra (çıxış edib yenidən girsə belə) birbaşa Login ekranı açılır.
  const hasSeenWelcome = useWelcomeStore((s) => s.hasSeenWelcome);

  return (
    <Stack.Navigator
      initialRouteName={hasSeenWelcome ? Routes.Login : Routes.Welcome}
      screenOptions={{ headerShown: false, animation: 'none' }}
    >
      <Stack.Screen name={Routes.Welcome} component={WelcomeScreen} />
      <Stack.Screen name={Routes.Login} component={LoginScreen} />
      <Stack.Screen name={Routes.Register} component={RegisterScreen} />
      <Stack.Screen name={Routes.OTP} component={OTPScreen} />
      <Stack.Screen name={Routes.ForgotPassword} component={ForgotPasswordScreen} />
      <Stack.Screen name={Routes.RoleSelect} component={RoleSelectScreen} />
      <Stack.Screen name={Routes.ProfileSetup} component={ProfileSetupScreen} />
      <Stack.Screen name={Routes.AIOnboarding} component={AIOnboardingScreen} />
      {/* Qeydiyyatda razılıq mətnləri — istifadəçi təsdiqləməzdən əvvəl oxuya bilsin */}
      <Stack.Screen name={Routes.TermsOfService} component={TermsOfServiceScreen} />
      <Stack.Screen name={Routes.PrivacyPolicy} component={PrivacyPolicyScreen} />
    </Stack.Navigator>
  );
}
