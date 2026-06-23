import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { googleAuth } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import { useUserStore } from '../store/user.store';
import { useOnboardingStore } from '../store/onboarding.store';
import { useTranslation } from '../i18n';
import { GOOGLE_AUTH, GOOGLE_AUTH_ENABLED } from '../constants/config';

type Role = 'student' | 'teacher' | 'parent';

// ⚠️ expo-web-browser / expo-auth-session / expo-crypto NATIVE modullardır.
// Köhnə və ya rebuild olunmamış build-də (məs. iOS dev app) bu modullar binary-də
// olmaya bilər — STATIK import isə yükləmə anında "Cannot find native module" ilə
// bütün app-ı çökdürür. Ona görə dinamik (require) yükləyirik və yalnız client ID
// varsa (GOOGLE_AUTH_ENABLED) və modul həqiqətən mövcuddursa aktivləşdiririk.
let Google: any = null;
let googleModuleReady = false;
if (GOOGLE_AUTH_ENABLED) {
  try {
    const WebBrowser = require('expo-web-browser');
    WebBrowser.maybeCompleteAuthSession();
    Google = require('expo-auth-session/providers/google');
    googleModuleReady = true;
  } catch {
    googleModuleReady = false;
  }
}

const GOOGLE_READY = GOOGLE_AUTH_ENABLED && googleModuleReady;

/**
 * Google modulu olmayanda (client ID yoxdur, yaxud native modul build-də yoxdur)
 * istifadə olunan boş variant — heç bir native asılılığa toxunmur.
 */
function useGoogleDisabled() {
  const { t } = useTranslation();
  const signIn = async () => {
    Alert.alert(t('login.googleSoonTitle'), t('login.googleSoonBody'));
  };
  return { signIn, loading: false, enabled: false };
}

/**
 * Google modulu mövcud olduqda işləyən real variant.
 * `signIn(role?)` Google ekranını açır, idToken-i backend-ə göndərib token+user saxlayır.
 */
function useGoogleEnabled() {
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
    if (!request) {
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

  return { signIn, loading, enabled: !!request };
}

// Hangi variantın işləyəcəyi modul yüklənmə anında SABİTLƏNİR — beləcə React hook
// sırası heç vaxt dəyişmir (şərti hook problemi olmur).
export const useGoogleSignIn = GOOGLE_READY ? useGoogleEnabled : useGoogleDisabled;
