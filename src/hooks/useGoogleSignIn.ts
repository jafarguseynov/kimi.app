import { useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { Alert } from 'react-native';
import { googleAuth } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import { useUserStore } from '../store/user.store';
import { useOnboardingStore } from '../store/onboarding.store';
import { useTranslation } from '../i18n';
import { GOOGLE_AUTH, GOOGLE_AUTH_ENABLED } from '../constants/config';

// Brauzer sessiyasının düzgün bağlanması üçün (Expo tövsiyəsi).
// ⚠️ expo-web-browser native moduldur — köhnə build-də (rebuild-dən əvvəl) yox ola
// bilər; çökməsin deyə try/catch ilə qorunur.
try {
  WebBrowser.maybeCompleteAuthSession();
} catch {}

type Role = 'student' | 'teacher' | 'parent';

/**
 * Google ilə giriş/qeydiyyat. `enabled` false olduqda (client ID yoxdur)
 * düymələr gizlədilməlidir. `signIn(role?)` Google ekranını açır, idToken-i
 * backend-ə göndərib token+user saxlayır.
 */
export function useGoogleSignIn() {
  const { setToken } = useAuthStore();
  const { setUser } = useUserStore();
  const { setPendingTeacherSetup } = useOnboardingStore();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [pendingRole, setPendingRole] = useState<Role | undefined>(undefined);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_AUTH.webClientId || undefined,
    iosClientId: GOOGLE_AUTH.iosClientId || undefined,
    androidClientId: GOOGLE_AUTH.androidClientId || undefined,
  });

  useEffect(() => {
    if (!response) return;
    if (response.type === 'success') {
      const idToken = response.params?.id_token || (response.authentication as any)?.idToken;
      if (!idToken) { setLoading(false); return; }
      (async () => {
        try {
          const data = await googleAuth(idToken, pendingRole);
          await setToken(data.token);
          setUser(data.user);
          if (data.user?.role === 'teacher') setPendingTeacherSetup(true);
        } catch {
          Alert.alert(t('login.googleErrorTitle'), t('login.googleErrorBody'));
        } finally {
          setLoading(false);
        }
      })();
    } else if (response.type === 'error' || response.type === 'dismiss' || response.type === 'cancel') {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  const signIn = async (role?: Role) => {
    if (!GOOGLE_AUTH_ENABLED || !request) {
      Alert.alert(t('login.googleSoonTitle'), t('login.googleSoonBody'));
      return;
    }
    setPendingRole(role);
    setLoading(true);
    try {
      await promptAsync();
    } catch {
      setLoading(false);
    }
  };

  return { signIn, loading, enabled: GOOGLE_AUTH_ENABLED && !!request };
}
