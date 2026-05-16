import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Routes } from '../constants/routes';
import { MarketplaceStackParamList } from './types';
import MarketplaceHomeScreen from '../screens/marketplace/MarketplaceHomeScreen';
import QuestionDetailScreen from '../screens/marketplace/QuestionDetailScreen';
import AskQuestionScreen from '../screens/marketplace/AskQuestionScreen';
import AIAnswerScreen from '../screens/marketplace/AIAnswerScreen';
import AIAnswerFallbackScreen from '../screens/marketplace/AIAnswerFallbackScreen';
import LessonRequestScreen from '../screens/marketplace/LessonRequestScreen';
import InterestedTeachersScreen from '../screens/marketplace/InterestedTeachersScreen';

const Stack = createNativeStackNavigator<MarketplaceStackParamList>();

export default function MarketplaceNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={Routes.MarketplaceHome} component={MarketplaceHomeScreen} />
      <Stack.Screen name={Routes.QuestionDetail} component={QuestionDetailScreen} />
      <Stack.Screen
        name={Routes.AskQuestion}
        component={AskQuestionScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen name={Routes.AIAnswer} component={AIAnswerScreen} />
      <Stack.Screen name={Routes.AIAnswerFallback} component={AIAnswerFallbackScreen} />
      <Stack.Screen name={Routes.LessonRequest} component={LessonRequestScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name={Routes.InterestedTeachers} component={InterestedTeachersScreen} />
    </Stack.Navigator>
  );
}
