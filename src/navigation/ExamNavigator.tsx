import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ExamStackParamList } from './types';
import { Routes } from '../constants/routes';
import ExamListScreen from '../screens/exam/ExamListScreen';
import ExamBrowseScreen from '../screens/exam/ExamBrowseScreen';
import ExamCategoriesScreen from '../screens/exam/ExamCategoriesScreen';
import CategoryExamsScreen from '../screens/exam/CategoryExamsScreen';
import CategorySubcategoriesScreen from '../screens/exam/CategorySubcategoriesScreen';
import GradeSubjectsScreen from '../screens/exam/GradeSubjectsScreen';
import LiveExamsListScreen from '../screens/exam/LiveExamsListScreen';
import LiveExamDetailScreen from '../screens/exam/LiveExamDetailScreen';
import MyExamsScreen from '../screens/exam/MyExamsScreen';
import ExamPurchaseConfirmScreen from '../screens/exam/ExamPurchaseConfirmScreen';
import ExamPurchaseSuccessScreen from '../screens/exam/ExamPurchaseSuccessScreen';
import ExamFilterSheetScreen from '../screens/exam/ExamFilterSheetScreen';
import ExamInfoScreen from '../screens/exam/ExamInfoScreen';
import SchoolExamsScreen from '../screens/exam/SchoolExamsScreen';
import AIExamRecommendationsScreen from '../screens/exam/AIExamRecommendationsScreen';
import NewExamScreen from '../screens/exam/NewExamScreen';
import ExamDetailScreen from '../screens/exam/ExamDetailScreen';
import ExamSessionScreen from '../screens/exam/ExamSessionScreen';
import ExamResultScreen from '../screens/exam/ExamResultScreen';
import ExamReviewScreen from '../screens/exam/ExamReviewScreen';
import MonthlyExamDetailScreen from '../screens/exam/MonthlyExamDetailScreen';
import LiveExamWaitingScreen from '../screens/exam/LiveExamWaitingScreen';
import LiveExamSessionScreen from '../screens/exam/LiveExamSessionScreen';
import ExamRankingScreen from '../screens/exam/ExamRankingScreen';
import LiveLeaderboardScreen from '../screens/exam/LiveLeaderboardScreen';
import CompetitionResultScreen from '../screens/exam/CompetitionResultScreen';
import DuelMatchScreen from '../screens/exam/DuelMatchScreen';
import DuelModeScreen from '../screens/exam/DuelModeScreen';
import DuelSessionScreen from '../screens/exam/DuelSessionScreen';
import DuelInviteScreen from '../screens/exam/DuelInviteScreen';
import DuelHistoryScreen from '../screens/exam/DuelHistoryScreen';
import CertificatePreviewScreen from '../screens/exam/CertificatePreviewScreen';
import CertificateListScreen from '../screens/exam/CertificateListScreen';
import ExamHistoryScreen from '../screens/exam/ExamHistoryScreen';
import ExamFilterScreen from '../screens/exam/ExamFilterScreen';
import ExamSettingsScreen from '../screens/exam/ExamSettingsScreen';

const Stack = createNativeStackNavigator<ExamStackParamList>();

export default function ExamNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'none' }}>
      <Stack.Screen name={Routes.ExamList} component={ExamListScreen} />
      <Stack.Screen name={Routes.ExamBrowse} component={ExamBrowseScreen} />
      <Stack.Screen name={Routes.ExamCategories} component={ExamCategoriesScreen} />
      <Stack.Screen name={Routes.CategorySubcategories} component={CategorySubcategoriesScreen} />
      <Stack.Screen name={Routes.GradeSubjects} component={GradeSubjectsScreen} />
      <Stack.Screen name={Routes.CategoryExams} component={CategoryExamsScreen} />
      <Stack.Screen name={Routes.LiveExamsList} component={LiveExamsListScreen} />
      <Stack.Screen name={Routes.LiveExamDetail} component={LiveExamDetailScreen} />
      <Stack.Screen name={Routes.MyExams} component={MyExamsScreen} />
      <Stack.Screen
        name={Routes.ExamPurchaseConfirm} component={ExamPurchaseConfirmScreen}
        options={{ presentation: 'transparentModal', animation: 'fade' }}
      />
      <Stack.Screen name={Routes.ExamPurchaseSuccess} component={ExamPurchaseSuccessScreen} />
      <Stack.Screen
        name={Routes.ExamFilterSheet} component={ExamFilterSheetScreen}
        options={{ presentation: 'transparentModal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name={Routes.ExamInfo} component={ExamInfoScreen} />
      <Stack.Screen name={Routes.SchoolExams} component={SchoolExamsScreen} />
      <Stack.Screen name={Routes.AIExamRecommendations} component={AIExamRecommendationsScreen} />
      <Stack.Screen name={Routes.NewExam} component={NewExamScreen} />
      <Stack.Screen name={Routes.ExamDetail} component={ExamDetailScreen} />
      <Stack.Screen
        name={Routes.ExamSession}
        component={ExamSessionScreen}
        options={{ presentation: 'fullScreenModal' }}
      />
      <Stack.Screen name={Routes.ExamResult} component={ExamResultScreen} />
      <Stack.Screen name={Routes.ExamReview} component={ExamReviewScreen} />
      <Stack.Screen name={Routes.MonthlyExamDetail} component={MonthlyExamDetailScreen} />
      <Stack.Screen name={Routes.LiveExamWaiting} component={LiveExamWaitingScreen} />
      <Stack.Screen
        name={Routes.LiveExamSession}
        component={LiveExamSessionScreen}
        options={{ presentation: 'fullScreenModal' }}
      />
      <Stack.Screen name={Routes.ExamRanking} component={ExamRankingScreen} />
      <Stack.Screen name={Routes.LiveLeaderboard} component={LiveLeaderboardScreen} />
      <Stack.Screen name={Routes.CompetitionResult} component={CompetitionResultScreen} />
      <Stack.Screen name={Routes.DuelMatch} component={DuelMatchScreen} />
      <Stack.Screen name={Routes.DuelMode} component={DuelModeScreen} />
      <Stack.Screen
        name={Routes.DuelSession}
        component={DuelSessionScreen}
        options={{ presentation: 'fullScreenModal' }}
      />
      <Stack.Screen
        name={Routes.DuelInvite}
        component={DuelInviteScreen}
        options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name={Routes.DuelHistory} component={DuelHistoryScreen} />
      <Stack.Screen name={Routes.CertificatePreview} component={CertificatePreviewScreen} />
      <Stack.Screen name={Routes.CertificateList} component={CertificateListScreen} />
      <Stack.Screen name={Routes.ExamHistory} component={ExamHistoryScreen} />
      <Stack.Screen name={Routes.ExamFilter} component={ExamFilterScreen} />
      <Stack.Screen name={Routes.ExamSettings} component={ExamSettingsScreen} />
    </Stack.Navigator>
  );
}
