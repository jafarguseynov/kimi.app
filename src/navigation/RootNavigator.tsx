import React, { useEffect, useState } from 'react';
import { View, Image, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/auth.store';
import { useUserStore } from '../store/user.store';
import { useFavoriteTeachersStore } from '../store/favoritesTeachers.store';
import { useRecentTeachersStore } from '../store/recentTeachers.store';
import { useOnboardingStore } from '../store/onboarding.store';
import { useGetStartedStore } from '../store/getStarted.store';
import { useWelcomeStore } from '../store/welcome.store';
import { usePushStore } from '../store/push.store';
import { useSettingsStore } from '../store/settings.store';
import { useFeatureFlagStore } from '../store/featureFlag.store';
import { useSpinWheelStore } from '../store/spinWheel.store';
import { useSpinStreakStore } from '../store/spinStreak.store';
import { useCalcRecordsStore } from '../store/calcRecords.store';
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
  const hydrateWelcome = useWelcomeStore((s) => s.hydrate);
  const hydratePush = usePushStore((s) => s.hydrate);
  const hydrateSettings = useSettingsStore((s) => s.hydrate);
  const hydrateSpinWheel = useSpinWheelStore((s) => s.hydrate);
  const hydrateSpinStreak = useSpinStreakStore((s) => s.hydrate);
  const hydrateCalcRecords = useCalcRecordsStore((s) => s.hydrate);
  const loadFlags = useFeatureFlagStore((s) => s.loadFlags);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    // Mühafizə: açılış heç bir halda 10 saniyədən çox logo ekranında qalmasın.
    // SecureStore/şəbəkə gözlənilməz şəkildə ilişsə belə istifadəçi ekranı görür
    // (ilişmiş splash = Play üçün «app doesn't load»).
    const watchdog = setTimeout(() => setBootstrapping(false), 10000);
    (async () => {
      try {
        hydrateFavorites();
        hydrateRecent();
        hydrateOnboarding();
        hydrateGetStarted();
        hydrateWelcome();
        hydratePush();
        hydrateSettings();
        hydrateSpinWheel();
        hydrateSpinStreak();
        hydrateCalcRecords();
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
        clearTimeout(watchdog);
        setBootstrapping(false);
      }
    })();
    return () => clearTimeout(watchdog);
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
