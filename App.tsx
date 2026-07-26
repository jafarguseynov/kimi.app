import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { Text, TextInput, Alert, AppState } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RootNavigator from './src/navigation/RootNavigator';
import { Routes } from './src/constants/routes';
import {
  ensureNotificationChannels,
  addNotificationResponseListener,
  refreshTokenIfGranted,
} from './src/utils/push';
import { savePushToken } from './src/api/notification.api';
import { useAuthStore } from './src/store/auth.store';
import { useSettingsStore } from './src/store/settings.store';
import { useTranslation } from './src/i18n';
import { useExamStore, hasResumableExam } from './src/store/exam.store';
import { setOnReconnect } from './src/services/offline/netStatus';
import { flushQueue, setOnResultReady } from './src/services/offline/examQueue';

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

// Deep/Universal link konfiqurasiyası — referal linki tətbiqi açsın və kodu
// qeydiyyat ekranına ötürsün. `https://kimi.az/join?ref=KOD` → Register (ref).
// Custom scheme `kimiaz://join?ref=KOD` də dəstəklənir (tətbiq quraşdırılıbsa).
// Qeyd: yalnız istifadəçi çıxış edibsə (yeni istifadəçi) Register mount olunur —
// artıq daxil olmuş istifadəçidə link naviqasiya etməyəcək (gözlənilən davranış).
const linking = {
  prefixes: ['kimiaz://', 'https://kimi.az', 'https://www.kimi.az'],
  config: {
    screens: {
      [Routes.Register]: 'join',
    },
  },
};

/**
 * Offline imtahan idarəetməsi (provider-lərin içində — tərcümə üçün):
 * - şəbəkə izləyicisi + reconnect-də submit növbəsini boşalt
 * - növbə nəticəsi gələndə store-a yaz + istifadəçiyə bildir
 * - açılışda bitməmiş imtahan varsa "davam et?" soruş
 */
function OfflineBootstrap() {
  const { t } = useTranslation();
  useEffect(() => {
    // Onlayn qayıdanda (axios interceptor) → növbəni boşalt.
    setOnReconnect(() => { flushQueue(); });
    // Nəticə artıq imtahan bitəndə YERLİ göstərilir; növbə yalnız serverə rəsmi
    // qeyd üçündür. Sinxron tamamlananda sakitcə server nəticəsi ilə yenilə (popup yox).
    setOnResultReady((result) => {
      if (useExamStore.getState().examId) useExamStore.getState().setResult(result);
    });
    // Açılışda və hər dəfə tətbiq önə gələndə gözləyən submitləri göndərməyə çalış.
    flushQueue();
    const appStateSub = AppState.addEventListener('change', (s) => {
      if (s === 'active') flushQueue();
    });
    // Dövri yoxlama: tətbiq açıq ikən internet qayıdanda nəticə avtomatik gəlsin
    // (NetInfo yoxdur → hər 8 saniyədə gözləyən submitləri təkrar cəhd et; növbə boşdursa ucuz).
    const flushTimer = setInterval(() => { flushQueue(); }, 8000);

    const tryResume = () => {
      if (!hasResumableExam()) return;
      Alert.alert(
        t('examSession.resumeTitle'),
        t('examSession.resumeBody'),
        [
          { text: t('examSession.resumeDiscard'), style: 'destructive', onPress: () => useExamStore.getState().resetExam() },
          {
            text: t('examSession.resumeContinue'),
            onPress: () => {
              if (navigationRef.isReady()) {
                (navigationRef as any).navigate('Exams', { screen: Routes.ExamSession });
              }
            },
          },
        ],
      );
    };

    // Persist rehydration tamamlandıqdan sonra resume soruş.
    if (useExamStore.persist.hasHydrated()) {
      const id = setTimeout(tryResume, 700);
      return () => { clearTimeout(id); appStateSub.remove(); clearInterval(flushTimer); };
    }
    const unsub = useExamStore.persist.onFinishHydration(() => setTimeout(tryResume, 700));
    return () => { unsub?.(); appStateSub.remove(); clearInterval(flushTimer); };
  }, []);
  return null;
}

export default function App() {
  const authToken = useAuthStore((s) => s.token);

  // Daxil olmuş istifadəçi üçün push tokenini hər açılışda səssiz yenilə (dialoq açmadan).
  // Beləcə onboarding-i push əlavə olunmadan keçən köhnə istifadəçilər və tokeni rotasiya
  // olanlar da serverdə güncəl qalır. İstifadəçi bildirişi söndürübsə (pushEnabled=false)
  // token göndərmirik → push getmir.
  useEffect(() => {
    if (!authToken) return;
    let cancelled = false;
    const syncToken = async () => {
      // settings hydrate bitməmişsə pushEnabled default true-dur; söndürülübsə yenilə etmə.
      const st = useSettingsStore.getState();
      if (st.hydrated && st.pushEnabled === false) return;
      const token = await refreshTokenIfGranted();
      if (!cancelled && token) {
        savePushToken(token).catch(() => {});
      }
    };
    // 1) Açılışda dərhal. 2) Tətbiq ön plana qayıdanda təkrar — beləcə yeni istifadəçi
    // priming ekranında icazə verib, lakin ilk token cəhdi boş qayıdıbsa (APNs/FCM hələ
    // hazır deyildi), token növbəti aktivləşmədə səssiz serverə yazılır. Bu, "aç-bağla
    // etməsə bildiriş gəlmir" xətasını aradan qaldırır.
    syncToken();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') syncToken();
    });
    return () => { cancelled = true; sub.remove(); };
  }, [authToken]);

  useEffect(() => {
    // Özəl səsli Android kanalını əvvəlcədən qur.
    ensureNotificationChannels();

    // İstifadəçi bildirişə toxunduqda → uyğun ekrana keç (default: Bildirişlər).
    const sub = addNotificationResponseListener((data) => {
      if (!navigationRef.isReady()) return;
      try {
        switch (data?.type) {
          case 'chat_message':
            // Birbaşa həmin söhbəti aç (chatId varsa); yoxdursa siyahıya keç.
            if (data?.chatId) {
              (navigationRef as any).navigate('Chat', {
                screen: Routes.ChatRoom,
                params: {
                  chatId: data.chatId,
                  name: data.senderName || '',
                  userId: data.senderId,
                },
              });
            } else {
              navigationRef.navigate(Routes.ChatList as never);
            }
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
          <NavigationContainer ref={navigationRef} linking={linking}>
            <OfflineBootstrap />
            <RootNavigator />
          </NavigationContainer>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
