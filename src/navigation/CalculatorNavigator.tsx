import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CalcStackParamList } from './types';
import { Routes } from '../constants/routes';
import CalculatorsHomeScreen from '../screens/calculators/CalculatorsHomeScreen';
import SemesterCalculatorScreen from '../screens/calculators/SemesterCalculatorScreen';
import AnnualCalculatorScreen from '../screens/calculators/AnnualCalculatorScreen';
import ScoreCalculatorScreen from '../screens/calculators/ScoreCalculatorScreen';
import QualityCalculatorScreen from '../screens/calculators/QualityCalculatorScreen';
import DIMCalculatorScreen from '../screens/calculators/DIMCalculatorScreen';
import CalcHistoryScreen from '../screens/calculators/CalcHistoryScreen';
import CalcSavedScreen from '../screens/calculators/CalcSavedScreen';

const Stack = createNativeStackNavigator<CalcStackParamList>();

export default function CalculatorNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'none' }}>
      <Stack.Screen name={Routes.Calculators} component={CalculatorsHomeScreen} />
      <Stack.Screen name={Routes.SemesterCalc} component={SemesterCalculatorScreen} />
      <Stack.Screen name={Routes.AnnualCalc} component={AnnualCalculatorScreen} />
      <Stack.Screen name={Routes.ScoreCalc} component={ScoreCalculatorScreen} />
      <Stack.Screen name={Routes.QualityCalc} component={QualityCalculatorScreen} />
      <Stack.Screen name={Routes.DIMCalc} component={DIMCalculatorScreen} />
      <Stack.Screen name={Routes.CalcHistory} component={CalcHistoryScreen} />
      <Stack.Screen name={Routes.CalcSaved} component={CalcSavedScreen} />
    </Stack.Navigator>
  );
}
