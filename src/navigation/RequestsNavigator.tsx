import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Routes } from '../constants/routes';
import TeacherRequestsScreen from '../screens/home/TeacherRequestsScreen';
import LessonRequestDetailScreen from '../screens/home/LessonRequestDetailScreen';
import MyRequestsScreen from '../screens/home/MyRequestsScreen';
import PlansScreen from '../screens/payment/PlansScreen';
import PremiumBenefitsScreen from '../screens/payment/PremiumBenefitsScreen';

const Stack = createNativeStackNavigator<any>();

/**
 * §20 — "Sorğular" tabının öz stack-i.
 *
 * Kök ekran `TeacherRequestsScreen`-dir (açıq sorğular + müraciətlər nested
 * tabları). Stack-ə həmçinin həmin ekranların İÇİNDƏN açılan marşrutlar
 * qeyd olunub — belə olmasa `navigate('LessonRequestDetail')` və ya
 * abunəlik keçidi tabın içindən işləməzdi.
 */
export default function RequestsNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'none' }}>
      <Stack.Screen name={Routes.TeacherRequests} component={TeacherRequestsScreen} />
      <Stack.Screen name={Routes.LessonRequestDetail} component={LessonRequestDetailScreen as any} />
      <Stack.Screen name={Routes.MyRequests} component={MyRequestsScreen} />
      <Stack.Screen name={Routes.Plans} component={PlansScreen} />
      <Stack.Screen name={Routes.PremiumBenefits} component={PremiumBenefitsScreen} />
    </Stack.Navigator>
  );
}
