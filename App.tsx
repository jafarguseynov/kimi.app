import 'react-native-gesture-handler';
import React from 'react';
import { Text, TextInput } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RootNavigator from './src/navigation/RootNavigator';

// Responsivlik: cihazın sistem şrift böyütməsini məhdudlaşdır. Samsung A5 kimi
// telefonlarda böyük sistem şrifti bütün yazıları daşıdırdı (imtahan ekrana sığmırdı).
// Bu, hər ekranı ayrıca dəyişmədən qlobal olaraq problemi yumşaldır.
const TextAny = Text as any;
const TextInputAny = TextInput as any;
TextAny.defaultProps = { ...(TextAny.defaultProps || {}), maxFontSizeMultiplier: 1.2 };
TextInputAny.defaultProps = { ...(TextInputAny.defaultProps || {}), maxFontSizeMultiplier: 1.2 };

const queryClient = new QueryClient();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
