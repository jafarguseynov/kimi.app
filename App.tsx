import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { Text, TextInput } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RootNavigator from './src/navigation/RootNavigator';
import { Routes } from './src/constants/routes';
import {
  ensureNotificationChannels,
  addNotificationResponseListener,
} from './src/utils/push';

// Responsivlik: cihazın sistem şrift böyütməsini məhdudlaşdır. Samsung A5 kimi
// telefonlarda böyük sistem şrifti bütün yazıları daşıdırdı (imtahan ekrana sığmırdı).
// Bu, hər ekranı ayrıca dəyişmədən qlobal olaraq problemi yumşaldır.
const TextAny = Text as any;
const TextInputAny = TextInput as any;
TextAny.defaultProps = { ...(TextAny.defaultProps || {}), maxFontSizeMultiplier: 1.2 };
TextInputAny.defaultProps = { ...(TextInputAny.defaultProps || {}), maxFontSizeMultiplier: 1.2 };

const queryClient = new QueryClient();

// Bildirişə toxunulduqda naviqasiya üçün ref.
export const navigationRef = createNavigationContainerRef();

export default function App() {
  useEffect(() => {
    // Özəl səsli Android kanalını əvvəlcədən qur.
    ensureNotificationChannels();

    // İstifadəçi bildirişə toxunduqda → uyğun ekrana keç (default: Bildirişlər).
    const sub = addNotificationResponseListener((data) => {
      if (!navigationRef.isReady()) return;
      try {
        switch (data?.type) {
          case 'chat_message':
            navigationRef.navigate(Routes.ChatList as never);
            break;
          case 'lesson_request_interest':
            navigationRef.navigate(Routes.MyRequests as never);
            break;
          case 'booking_new':
          case 'booking_status':
            navigationRef.navigate(Routes.BookingHistory as never);
            break;
          default:
            navigationRef.navigate(Routes.Notifications as never);
        }
      } catch {
        navigationRef.navigate(Routes.Notifications as never);
      }
    });

    return () => sub?.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer ref={navigationRef}>
            <RootNavigator />
          </NavigationContainer>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
