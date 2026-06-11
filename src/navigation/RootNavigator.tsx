import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/auth.store';
import { useUserStore } from '../store/user.store';
import { useFavoriteTeachersStore } from '../store/favoritesTeachers.store';
import { useRecentTeachersStore } from '../store/recentTeachers.store';
import { useOnboardingStore } from '../store/onboarding.store';
import { usePushStore } from '../store/push.store';
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
  const hydratePush = usePushStore((s) => s.hydrate);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        hydrateFavorites();
        hydrateRecent();
        hydrateOnboarding();
        hydratePush();
        const saved = await getToken();
        if (saved) {
          await setToken(saved);
          try {
            const me = await getMe();
            setUser(me as any);
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

  if (bootstrapping) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return token ? <AppNavigator /> : <AuthNavigator />;
}
