import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeStackParamList } from './types';
import { Routes } from '../constants/routes';
import HomeScreen from '../screens/home/HomeScreen';
import DailyMissionsScreen from '../screens/home/DailyMissionsScreen';
import AIStudyPathScreen from '../screens/home/AIStudyPathScreen';
import SpinWheelScreen from '../screens/home/SpinWheelScreen';
import AchievementsScreen from '../screens/home/AchievementsScreen';
import LeaderboardScreen from '../screens/home/LeaderboardScreen';
import LeagueScreen from '../screens/home/LeagueScreen';
import SchoolRankingScreen from '../screens/home/SchoolRankingScreen';
import SchoolSearchScreen from '../screens/home/SchoolSearchScreen';
import SchoolDetailScreen from '../screens/home/SchoolDetailScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import PaymentMethodScreen from '../screens/payment/PaymentMethodScreen';
import CardPaymentScreen from '../screens/payment/CardPaymentScreen';
import PaymentSuccessScreen from '../screens/payment/PaymentSuccessScreen';
import PaymentFailedScreen from '../screens/payment/PaymentFailedScreen';
import SubscriptionScreen from '../screens/payment/SubscriptionScreen';
import PlansScreen from '../screens/payment/PlansScreen';
import FriendsScreen from '../screens/social/FriendsScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={Routes.HomeMain} component={HomeScreen} />
      <Stack.Screen name={Routes.DailyMissions} component={DailyMissionsScreen} />
      <Stack.Screen name={Routes.AIStudyPath} component={AIStudyPathScreen} />
      <Stack.Screen name={Routes.SpinWheel} component={SpinWheelScreen} />
      <Stack.Screen name={Routes.Achievements} component={AchievementsScreen} />
      <Stack.Screen name={Routes.Leaderboard} component={LeaderboardScreen} />
      <Stack.Screen name={Routes.League} component={LeagueScreen} />
      <Stack.Screen name={Routes.SchoolRanking} component={SchoolRankingScreen} />
      <Stack.Screen name={Routes.SchoolSearch} component={SchoolSearchScreen} />
      <Stack.Screen name={Routes.SchoolDetail} component={SchoolDetailScreen} />
      <Stack.Screen name={Routes.Settings} component={SettingsScreen} />
      <Stack.Screen name={Routes.PaymentMethod} component={PaymentMethodScreen} />
      <Stack.Screen name={Routes.CardPayment} component={CardPaymentScreen} />
      <Stack.Screen name={Routes.PaymentSuccess} component={PaymentSuccessScreen} />
      <Stack.Screen name={Routes.PaymentFailed} component={PaymentFailedScreen} />
      <Stack.Screen name={Routes.Subscription} component={SubscriptionScreen} />
      <Stack.Screen name={Routes.Plans} component={PlansScreen} />
      <Stack.Screen name={Routes.Friends} component={FriendsScreen} />
    </Stack.Navigator>
  );
}
