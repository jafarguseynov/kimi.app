import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppTabParamList } from './types';
import { Routes } from '../constants/routes';
import { Colors } from '../constants/colors';
import { hapticLight } from '../utils/haptics';
import { useTranslation } from '../i18n';
import HomeNavigator from './HomeNavigator';
import AIMentorScreen from '../screens/ai/AIMentorScreen';
import ProfileNavigator from './ProfileNavigator';
import ExamNavigator from './ExamNavigator';
import LearningNavigator from './LearningNavigator';
import MarketplaceNavigator from './MarketplaceNavigator';
import ChatNavigator from './ChatNavigator';
import BookingNavigator from './BookingNavigator';
import CalculatorNavigator from './CalculatorNavigator';
import BookmarksScreen from '../screens/bookmarks/BookmarksScreen';
import RequestsNavigator from './RequestsNavigator';
import TeacherDashboardScreen from '../screens/profile/TeacherDashboardScreen';

const Tab = createBottomTabNavigator<AppTabParamList>();

const TAB_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  [Routes.Home]: 'home',
  Exams: 'document-text',
  [Routes.AIMentor]: 'sparkles',
  Booking: 'people',
  [Routes.Profile]: 'person',
  // Müəllim tabları (§20)
  [Routes.TeacherRequests]: 'clipboard',
  Chat: 'chatbubble-ellipses',
  [Routes.TeacherStats]: 'stats-chart',
};

// Android-in klassik 3 düyməli naviqasiya panelinin standart hündürlüyü (dp).
// Yalnız cihaz safe-area insetini 0 bildirəndə ehtiyat dəyər kimi işlədilir.
const ANDROID_NAV_BAR_FALLBACK = 48;

/** Tab bar-da GİZLƏDİLƏN (amma naviqasiya üçün qeydiyyatda qalan) ekranın seçimləri. */
const HIDDEN = { tabBarItemStyle: { display: 'none' as const }, tabBarButton: () => null };

export default function AppNavigator() {
  const { t } = useTranslation();
  // Aşağı naviqasiya BÜTÜN rollar üçün eynidir:
  //   Ana səhifə · İmtahanlar · AI Mentor · Müəllimlər · Profil
  // Müəllimə xas ekranlar (Sorğular, Mesajlar, Statistika) tab bar-da
  // GÖRÜNMÜR, amma qeydiyyatda qalır — ana səhifədəki sürətli keçidlərdən
  // və "Sizin üçün" tövsiyələrindən açılır.
  const insets = useSafeAreaInsets();
  // Sistem çubuğu (Android naviqasiya paneli / iOS home indicator) tətbiqin ÜZƏRİNƏ
  // çəkilir — Android-də edge-to-edge (app.json: edgeToEdgeEnabled), iOS-da isə
  // notch-lu cihazlarda həmişə. React Navigation normalda tab bar-a `insets.bottom`
  // özü əlavə edir, LAKİN `tabBarStyle`-da sabit `height`/`paddingBottom` versən
  // onun hesabını tam əvəz edir (BottomTabBar getTabBarHeight → customHeight).
  // Ona görə insetı özümüz əlavə edirik: görünən 64dp dizayn olduğu kimi qalır,
  // altına isə cihazın REAL safe-area boşluğu qədər sahə əlavə olunur —
  // Android-də həm jest, həm 3 düymə rejimində, iOS-da isə home indicator üçün.
  //
  // ⚠️ Bəzi Android örtüklərində (MIUI/Redmi — 3 düyməli naviqasiya) `insets.bottom`
  // edge-to-edge rejimində 0 kimi gəlir. Belə cihazda yuxarıdakı hesab heç nə əlavə
  // etmir və sistem düymələri tab bar yazılarının ÜSTÜNƏ düşür (Redmi Note 10-da
  // müşahidə olundu). `SafeAreaProvider` uşaqlarını yalnız insetlər hazır olandan
  // sonra render etdiyi üçün burada 0 = «cihaz həqiqətən 0 bildirir» deməkdir,
  // yəni ilk kadr yanıb-sönməsi riski yoxdur. Ona görə YALNIZ Android-də 0 gələndə
  // standart düymə paneli hündürlüyünü ehtiyat kimi götürürük; iOS-un safe-area
  // dəyərləri etibarlıdır (home indicator ~34dp, köhnə cihazlarda 0) və olduğu
  // kimi işlədilir.
  const bottomInset =
    Platform.OS === 'android' && insets.bottom === 0 ? ANDROID_NAV_BAR_FALLBACK : insets.bottom;
  return (
    <Tab.Navigator
      backBehavior="history"
      screenListeners={{ tabPress: () => hapticLight() }}
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          height: 64 + bottomInset,
          paddingTop: 6,
          paddingBottom: 8 + bottomInset,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        headerShown: false,
        tabBarIcon: ({ focused, color }) => {
          const name = TAB_ICONS[route.name] ?? 'ellipse';
          return <Ionicons name={focused ? name : (`${name}-outline` as any)} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name={Routes.Home} component={HomeNavigator} options={{ tabBarLabel: t('nav.home') }} />

      {/* ── Müəllim ekranları: gizli, ana səhifə qısayollarından açılır ── */}
      <Tab.Screen
        name={Routes.TeacherRequests}
        component={RequestsNavigator}
        options={HIDDEN}
      />

      <Tab.Screen
        name="Exams"
        component={ExamNavigator}
        options={{ tabBarLabel: t('nav.exams') }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            (navigation as any).navigate('Exams', { screen: Routes.ExamList });
          },
        })}
      />
      <Tab.Screen
        name={Routes.AIMentor}
        component={AIMentorScreen}
        options={{ tabBarLabel: t('nav.ai') }}
      />
      <Tab.Screen
        name="Booking"
        component={BookingNavigator}
        options={{ tabBarLabel: t('nav.teachers') }}
        listeners={({ navigation }) => ({
          // Müəllimlər tabına basanda həmişə müəllim siyahısının kökünə qayıt —
          // əvvəlki "Dərs Müraciətləri" kimi ekranda yapışıb qalmasın.
          tabPress: (e) => {
            e.preventDefault();
            (navigation as any).navigate('Booking', { screen: Routes.TeacherList });
          },
        })}
      />

      {/* Mesajlar */}
      <Tab.Screen
        name="Chat"
        component={ChatNavigator}
        options={HIDDEN}
      />

      {/* Statistika — müəllimin şəxsi rəqəmləri */}
      <Tab.Screen
        name={Routes.TeacherStats}
        component={TeacherDashboardScreen}
        options={HIDDEN}
      />

      <Tab.Screen
        name={Routes.Profile}
        component={ProfileNavigator}
        options={{ tabBarLabel: t('nav.profile') }}
        listeners={({ navigation }) => ({
          // Profil tabına basanda həmişə kökə (ProfileHome) qayıt — başqa ekranda
          // (məs. kalkulyatorda) "yapışıb qalmasın".
          tabPress: (e) => {
            e.preventDefault();
            (navigation as any).navigate(Routes.Profile, { screen: Routes.ProfileHome });
          },
        })}
      />
      {/* Hidden tabs — still navigable from HomeScreen quick actions */}
      <Tab.Screen
        name="Learn"
        component={LearningNavigator}
        options={{ tabBarItemStyle: { display: 'none' }, tabBarButton: () => null }}
      />
      <Tab.Screen
        name="Marketplace"
        component={MarketplaceNavigator}
        options={{ tabBarItemStyle: { display: 'none' }, tabBarButton: () => null }}
      />
      <Tab.Screen
        name={Routes.Bookmarks}
        component={BookmarksScreen}
        options={{ tabBarItemStyle: { display: 'none' }, tabBarButton: () => null }}
      />
      <Tab.Screen
        name="Calculators"
        component={CalculatorNavigator}
        options={{ tabBarItemStyle: { display: 'none' }, tabBarButton: () => null }}
      />
    </Tab.Navigator>
  );
}
