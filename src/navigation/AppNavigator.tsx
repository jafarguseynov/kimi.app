import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { AppTabParamList } from './types';
import { Routes } from '../constants/routes';
import { Colors } from '../constants/colors';
import HomeNavigator from './HomeNavigator';
import AIMentorScreen from '../screens/ai/AIMentorScreen';
import ProfileNavigator from './ProfileNavigator';
import ExamNavigator from './ExamNavigator';
import LearningNavigator from './LearningNavigator';
import MarketplaceNavigator from './MarketplaceNavigator';
import ChatNavigator from './ChatNavigator';
import BookingNavigator from './BookingNavigator';
import CalculatorNavigator from './CalculatorNavigator';
import BookmarksScreen from '../screens/bookmarks/BookmarksScreen';

const Tab = createBottomTabNavigator<AppTabParamList>();

const TAB_ICONS: Record<string, string> = {
  [Routes.Home]: '🏠',
  Exams: '📝',
  Learn: '📚',
  [Routes.AIMentor]: '🤖',
  Marketplace: '💬',
  [Routes.Bookmarks]: '🔖',
  Chat: '✉️',
  Booking: '📅',
  Calculators: '🧮',
  [Routes.Profile]: '👤',
};

const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => (
  <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{TAB_ICONS[name] ?? '●'}</Text>
);

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: { backgroundColor: Colors.surface, borderTopColor: Colors.border },
        headerShown: false,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen name={Routes.Home} component={HomeNavigator} options={{ tabBarLabel: 'Ana Səhifə' }} />
      <Tab.Screen name="Exams" component={ExamNavigator} options={{ tabBarLabel: 'İmtahanlar' }} />
      <Tab.Screen name="Learn" component={LearningNavigator} options={{ tabBarLabel: 'Öyrən' }} />
      <Tab.Screen name={Routes.AIMentor} component={AIMentorScreen} options={{ tabBarLabel: 'AI' }} />
      <Tab.Screen name="Marketplace" component={MarketplaceNavigator} options={{ tabBarLabel: 'Market' }} />
      <Tab.Screen name={Routes.Bookmarks} component={BookmarksScreen} options={{ tabBarLabel: 'Yaddaş' }} />
      <Tab.Screen name="Chat" component={ChatNavigator} options={{ tabBarLabel: 'Mesaj' }} />
      <Tab.Screen name="Booking" component={BookingNavigator} options={{ tabBarLabel: 'Dərslər' }} />
      <Tab.Screen name="Calculators" component={CalculatorNavigator} options={{ tabBarLabel: 'Kalkulyator' }} />
      <Tab.Screen name={Routes.Profile} component={ProfileNavigator} options={{ tabBarLabel: 'Profil' }} />
    </Tab.Navigator>
  );
}
