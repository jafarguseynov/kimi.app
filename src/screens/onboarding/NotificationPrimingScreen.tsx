import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { useUserStore } from '../../store/user.store';
import { usePushStore } from '../../store/push.store';
import { requestAndRegister } from '../../utils/push';
import { savePushToken } from '../../api/notification.api';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type Benefit = { icon: React.ComponentProps<typeof Ionicons>['name']; key: string };

const BENEFITS: Record<string, { subKey: string; items: Benefit[] }> = {
  teacher: {
    subKey: 'onboarding.npTeacherSub',
    items: [
      { icon: 'hand-right-outline', key: 'onboarding.npTeacher1' },
      { icon: 'people-outline', key: 'onboarding.npTeacher2' },
      { icon: 'wallet-outline', key: 'onboarding.npTeacher3' },
      { icon: 'chatbubble-ellipses-outline', key: 'onboarding.npTeacher4' },
    ],
  },
  parent: {
    subKey: 'onboarding.npParentSub',
    items: [
      { icon: 'school-outline', key: 'onboarding.npParent1' },
      { icon: 'time-outline', key: 'onboarding.npParent2' },
      { icon: 'chatbubble-ellipses-outline', key: 'onboarding.npParent3' },
    ],
  },
  student: {
    subKey: 'onboarding.npStudentSub',
    items: [
      { icon: 'ribbon-outline', key: 'onboarding.npStudent1' },
      { icon: 'flame-outline', key: 'onboarding.npStudent2' },
      { icon: 'flag-outline', key: 'onboarding.npStudent3' },
      { icon: 'gift-outline', key: 'onboarding.npStudent4' },
    ],
  },
};

export default function NotificationPrimingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { t } = useTranslation();
  const { user } = useUserStore();
  const setPrimingSeen = usePushStore((s) => s.setPrimingSeen);
  const [loading, setLoading] = useState(false);

  const role = user?.role === 'teacher' ? 'teacher' : user?.role === 'parent' ? 'parent' : 'student';
  const content = BENEFITS[role];

  const finish = () => {
    setPrimingSeen(true);
    if (navigation.canGoBack()) navigation.goBack();
  };

  const onAllow = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const { token } = await requestAndRegister();
      if (token) {
        try {
          await savePushToken(token);
        } catch {
          /* backend hələ əlçatan deyilsə, token sonra yenidən göndəriləcək */
        }
      }
    } finally {
      setLoading(false);
      finish();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {/* Icon */}
        <LinearGradient colors={GRADIENT} style={styles.iconCircle} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Ionicons name="notifications" size={44} color="#fff" />
        </LinearGradient>

        <Text style={styles.title}>{t('onboarding.npTitle')}</Text>
        <Text style={styles.subtitle}>{t(content.subKey)}</Text>

        {/* Benefits */}
        <View style={styles.benefitList}>
          {content.items.map((b) => (
            <View key={b.key} style={styles.benefitRow}>
              <View style={styles.benefitIcon}>
                <Ionicons name={b.icon} size={20} color={Colors.primary} />
              </View>
              <Text style={styles.benefitText}>{t(b.key)}</Text>
            </View>
          ))}
        </View>

        {/* Privacy note */}
        <View style={styles.noteRow}>
          <Ionicons name="lock-closed-outline" size={14} color={Colors.textMuted} />
          <Text style={styles.noteText}>{t('onboarding.npNote')}</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity activeOpacity={0.9} onPress={onAllow} disabled={loading}>
          <LinearGradient colors={GRADIENT} style={styles.primaryBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="notifications-outline" size={20} color="#fff" />
                <Text style={styles.primaryBtnText}>{t('onboarding.allow')}</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={finish} disabled={loading} activeOpacity={0.8}>
          <Text style={styles.secondaryBtnText}>{t('onboarding.notNow')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, justifyContent: 'space-between' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, gap: 14 },

  iconCircle: {
    width: 96, height: 96, borderRadius: 48,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.25, shadowRadius: 24, elevation: 6,
  },
  title: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 21, maxWidth: 300, marginBottom: 8 },

  benefitList: { alignSelf: 'stretch', gap: 12, marginTop: 6 },
  benefitRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  benefitIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  benefitText: { flex: 1, fontSize: 14, fontWeight: '600', color: Colors.textPrimary, lineHeight: 19 },

  noteRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  noteText: { fontSize: 12, color: Colors.textMuted, fontWeight: '500' },

  actions: { paddingHorizontal: 24, paddingBottom: 12, gap: 10 },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    borderRadius: 999, height: 58,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.22, shadowRadius: 18, elevation: 4,
  },
  primaryBtnText: { fontSize: 17, fontWeight: '800', color: '#fff' },
  secondaryBtn: { alignItems: 'center', justifyContent: 'center', height: 50 },
  secondaryBtnText: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
});
