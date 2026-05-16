import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Routes } from '../constants/routes';
import TeacherListScreen from '../screens/booking/TeacherListScreen';
import TeacherProfileScreen from '../screens/booking/TeacherProfileScreen';
import BookingConfirmScreen from '../screens/booking/BookingConfirmScreen';
import BookingHistoryScreen from '../screens/booking/BookingHistoryScreen';
import BookingRejectedScreen from '../screens/booking/BookingRejectedScreen';
import BookingConfirmedScreen from '../screens/booking/BookingConfirmedScreen';
import BookingRequestSentScreen from '../screens/booking/BookingRequestSentScreen';
import LeaveReviewScreen from '../screens/booking/LeaveReviewScreen';
import ReviewSuccessScreen from '../screens/booking/ReviewSuccessScreen';
import AllReviewsScreen from '../screens/booking/AllReviewsScreen';
import ReviewDetailScreen from '../screens/booking/ReviewDetailScreen';

const Stack = createNativeStackNavigator();

export default function BookingNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={Routes.TeacherList} component={TeacherListScreen} />
      <Stack.Screen name={Routes.TeacherProfile} component={TeacherProfileScreen} />
      <Stack.Screen name={Routes.BookingConfirm} component={BookingConfirmScreen} />
      <Stack.Screen name={Routes.BookingHistory} component={BookingHistoryScreen} />
      <Stack.Screen name={Routes.BookingRejected} component={BookingRejectedScreen} />
      <Stack.Screen name={Routes.BookingConfirmed} component={BookingConfirmedScreen} />
      <Stack.Screen name={Routes.BookingRequestSent} component={BookingRequestSentScreen} />
      <Stack.Screen name={Routes.LeaveReview} component={LeaveReviewScreen} />
      <Stack.Screen name={Routes.ReviewSuccess} component={ReviewSuccessScreen} />
      <Stack.Screen name={Routes.AllReviews} component={AllReviewsScreen} />
      <Stack.Screen name={Routes.ReviewDetail} component={ReviewDetailScreen} />
    </Stack.Navigator>
  );
}
