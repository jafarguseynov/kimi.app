import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ExamStackParamList } from './types';
import { Routes } from '../constants/routes';
import ExamListScreen from '../screens/exam/ExamListScreen';
import ExamDetailScreen from '../screens/exam/ExamDetailScreen';
import ExamSessionScreen from '../screens/exam/ExamSessionScreen';
import ExamResultScreen from '../screens/exam/ExamResultScreen';
import MonthlyExamDetailScreen from '../screens/exam/MonthlyExamDetailScreen';
import LiveExamWaitingScreen from '../screens/exam/LiveExamWaitingScreen';
import LiveExamSessionScreen from '../screens/exam/LiveExamSessionScreen';
import ExamRankingScreen from '../screens/exam/ExamRankingScreen';
import LiveLeaderboardScreen from '../screens/exam/LiveLeaderboardScreen';
import CertificatePreviewScreen from '../screens/exam/CertificatePreviewScreen';
import CertificateListScreen from '../screens/exam/CertificateListScreen';
import ExamHistoryScreen from '../screens/exam/ExamHistoryScreen';
import ExamFilterScreen from '../screens/exam/ExamFilterScreen';

const Stack = createNativeStackNavigator<ExamStackParamList>();

export default function ExamNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={Routes.ExamList} component={ExamListScreen} />
      <Stack.Screen name={Routes.ExamDetail} component={ExamDetailScreen} />
      <Stack.Screen
        name={Routes.ExamSession}
        component={ExamSessionScreen}
        options={{ presentation: 'fullScreenModal' }}
      />
      <Stack.Screen name={Routes.ExamResult} component={ExamResultScreen} />
      <Stack.Screen name={Routes.MonthlyExamDetail} component={MonthlyExamDetailScreen} />
      <Stack.Screen name={Routes.LiveExamWaiting} component={LiveExamWaitingScreen} />
      <Stack.Screen
        name={Routes.LiveExamSession}
        component={LiveExamSessionScreen}
        options={{ presentation: 'fullScreenModal' }}
      />
      <Stack.Screen name={Routes.ExamRanking} component={ExamRankingScreen} />
      <Stack.Screen name={Routes.LiveLeaderboard} component={LiveLeaderboardScreen} />
      <Stack.Screen name={Routes.CertificatePreview} component={CertificatePreviewScreen} />
      <Stack.Screen name={Routes.CertificateList} component={CertificateListScreen} />
      <Stack.Screen name={Routes.ExamHistory} component={ExamHistoryScreen} />
      <Stack.Screen name={Routes.ExamFilter} component={ExamFilterScreen} />
    </Stack.Navigator>
  );
}
