import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppTabParamList } from './types';
import { Routes } from '../constants/routes';
import { Colors } from '../constants/colors';
import { hapticLight } from '../utils/haptics';
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

const TAB_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  [Routes.Home]: 'home',
  Exams: 'document-text',
  [Routes.AIMentor]: 'sparkles',
  Booking: 'people',
  [Routes.Profile]: 'person',
};

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenListeners={{ tabPress: () => hapticLight() }}
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          height: 64,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        headerShown: false,
        tabBarIcon: ({ focused, color }) => {
          const name = TAB_ICONS[route.name] ?? 'ellipse';
          return <Ionicons name={focused ? name : (`${name}-outline` as any)} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name={Routes.Home} component={HomeNavigator} options={{ tabBarLabel: 'Ana Səhifə' }} />
      <Tab.Screen
        name="Exams"
        component={ExamNavigator}
        options={{ tabBarLabel: 'İmtahanlar' }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            (navigation as any).navigate('Exams', { screen: Routes.ExamList });
          },
        })}
      />
      <Tab.Screen name={Routes.AIMentor} component={AIMentorScreen} options={{ tabBarLabel: 'AI' }} />
      <Tab.Screen name="Booking" component={BookingNavigator} options={{ tabBarLabel: 'Müəllimlər' }} />
      <Tab.Screen
        name={Routes.Profile}
        component={ProfileNavigator}
        options={{ tabBarLabel: 'Profil' }}
        listeners={({ navigation }) => ({
          // Profil tabına basanda həmişə kökə (ProfileHome) qayıt — başqa ekranda
          // (məs. kalkulyatorda) "yapışıb qalmasın".
          tabPress: (e) => {
            e.preventDefault();
            (navigation as any).navigate(Routes.Profile, { screen: Routes.ProfileHome });
          },
        })}
      />
      {/* Hidden tabs — still navigable from HomeScreen quick actions */}
      <Tab.Screen
        name="Learn"
        component={LearningNavigator}
        options={{ tabBarItemStyle: { display: 'none' }, tabBarButton: () => null }}
      />
      <Tab.Screen
        name="Marketplace"
        component={MarketplaceNavigator}
        options={{ tabBarItemStyle: { display: 'none' }, tabBarButton: () => null }}
      />
      <Tab.Screen
        name={Routes.Bookmarks}
        component={BookmarksScreen}
        options={{ tabBarItemStyle: { display: 'none' }, tabBarButton: () => null }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatNavigator}
        options={{ tabBarItemStyle: { display: 'none' }, tabBarButton: () => null }}
      />
      <Tab.Screen
        name="Calculators"
        component={CalculatorNavigator}
        options={{ tabBarItemStyle: { display: 'none' }, tabBarButton: () => null }}
      />
    </Tab.Navigator>
  );
}
