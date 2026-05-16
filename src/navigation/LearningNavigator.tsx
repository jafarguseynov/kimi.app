import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Routes } from '../constants/routes';
import LearningHomeScreen from '../screens/learning/LearningHomeScreen';
import FlashcardScreen from '../screens/learning/FlashcardScreen';
import MemoryAIScreen from '../screens/learning/MemoryAIScreen';
import LearningGroupsScreen from '../screens/learning/LearningGroupsScreen';

const Stack = createNativeStackNavigator();

export default function LearningNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={Routes.LearningHome} component={LearningHomeScreen} />
      <Stack.Screen
        name={Routes.FlashcardSession}
        component={FlashcardScreen}
        options={{ presentation: 'fullScreenModal' }}
      />
      <Stack.Screen name={Routes.MemoryAI} component={MemoryAIScreen} />
      <Stack.Screen name={Routes.LearningGroups} component={LearningGroupsScreen} />
    </Stack.Navigator>
  );
}
