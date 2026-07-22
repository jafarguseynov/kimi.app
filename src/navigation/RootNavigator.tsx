import React, { useEffect, useState } from 'react';
import { View, Image, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/auth.store';
import { useUserStore } from '../store/user.store';
import { useFavoriteTeachersStore } from '../store/favoritesTeachers.store';
import { useRecentTeachersStore } from '../store/recentTeachers.store';
import { useOnboardingStore } from '../store/onboarding.store';
import { useGetStartedStore } from '../store/getStarted.store';
import { usePushStore } from '../store/push.store';
import { useSettingsStore } from '../store/settings.store';
import { useFeatureFlagStore } from '../store/featureFlag.store';
import { useSpinWheelStore } from '../store/spinWheel.store';
import { useSpinStreakStore } from '../store/spinStreak.store';
import { getToken } from '../utils/token';
import { getMe } from '../api/user.api';
import { Colors } from '../constants/colors';
import AppNavigator from './AppNavigator';
import AuthNavigator from './AuthNavigator';

export default function RootNavigator() {
  const { token, setToken, clearAuth } = useAuthStore();
  const { setUser } = useUserStore();
  const hydrateFavorites = useFavoriteTeachersStore((s) => s.hydrate);
  const hydrateRecent = useRecentTeachersStore((s) => s.hydrate);
  const hydrateOnboarding = useOnboardingStore((s) => s.hydrate);
  const hydrateGetStarted = useGetStartedStore((s) => s.hydrate);
  const hydratePush = usePushStore((s) => s.hydrate);
  const hydrateSettings = useSettingsStore((s) => s.hydrate);
  const hydrateSpinWheel = useSpinWheelStore((s) => s.hydrate);
  const hydrateSpinStreak = useSpinStreakStore((s) => s.hydrate);
  const loadFlags = useFeatureFlagStore((s) => s.loadFlags);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        hydrateFavorites();
        hydrateRecent();
        hydrateOnboarding();
        hydrateGetStarted();
        hydratePush();
        hydrateSettings();
        hydrateSpinWheel();
        hydrateSpinStreak();
        const saved = await getToken();
        if (saved) {
          await setToken(saved);
          try {
            const me = await getMe();
            setUser(me as any);
            // Monetizasiya/feature açarlarını yüklə (token lazımdır)
            loadFlags();
          } catch {
            await clearAuth();
          }
        }
      } catch {
        try { await clearAuth(); } catch {}
      } finally {
        setBootstrapping(false);
      }
    })();
  }, []);

  // Fresh login-dən sonra (token dəyişəndə) açarları yenilə.
  useEffect(() => {
    if (token) loadFlags();
  }, [token]);

  if (bootstrapping) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <Image
          source={require('../../assets/logo.png')}
          style={{ width: 200, height: 92, marginBottom: 24 }}
          resizeMode="contain"
        />
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return token ? <AppNavigator /> : <AuthNavigator />;
}
