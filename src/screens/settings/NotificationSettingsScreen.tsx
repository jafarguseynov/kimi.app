import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';
import { useSettingsStore } from '../../store/settings.store';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, typeof Routes.NotificationSettings>;
};

type NotifItem = {
  id: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconBg: string;
  iconColor: string;
  title: string;
  sub: string;
  isPremium?: boolean;
  isGradient?: boolean;
  defaultOn: boolean;
};

const ITEMS: NotifItem[] = [
  {
    id: 'exam', icon: 'help-circle-outline',
    iconBg: Colors.primaryFixed + '33', iconColor: Colors.primary,
    title: 'İmtahan bildirişləri', sub: 'Yaxınlaşan imtahanlar və nəticələr haqqında',
    defaultOn: true,
  },
  {
    id: 'competition', icon: 'trophy-outline',
    iconBg: Colors.tertiaryContainer + '33', iconColor: Colors.tertiary,
    title: 'Yarış bildirişləri', sub: 'Yeni turnirlər və liderlik cədvəli yenilikləri',
    defaultOn: true,
  },
  {
    id: 'chat', icon: 'chatbubbles-outline',
    iconBg: Colors.secondaryContainer + '4D', iconColor: Colors.secondary,
    title: 'Chat bildirişləri', sub: 'Müəllim və həmyaşıdlardan gələn mesajlar',
    defaultOn: true,
  },
  {
    id: 'referral', icon: 'people-outline',
    iconBg: Colors.warningLight, iconColor: Colors.warning,
    title: 'Referal bildirişləri', sub: 'Dəvət etdiyiniz dostlarınız qeydiyyatdan keçdikdə',
    defaultOn: false,
  },
  {
    id: 'lesson', icon: 'book-outline',
    iconBg: Colors.primaryFixed + '33', iconColor: Colors.primary,
    title: 'Dərs tələbi bildirişləri', sub: 'Yeni dərs materialları və tapşırıq müraciətləri',
    defaultOn: true,
  },
  {
    id: 'daily', icon: 'alarm-outline',
    iconBg: '#FEF9C3', iconColor: '#A16207',
    title: 'Gündəlik xatırlatmalar', sub: 'Öyrənmə hədəflərinizə çatmaq üçün xatırlatmalar',
    defaultOn: true,
  },
  {
    id: 'ai', icon: 'hardware-chip-outline',
    iconBg: Colors.primary, iconColor: '#fff',
    title: 'AI tövsiyələri', sub: 'Süni intellekt əsaslı fərdi öyrənmə yolları',
    isPremium: true, isGradient: true, defaultOn: true,
  },
];

const DEFAULTS = Object.fromEntries(ITEMS.map(i => [i.id, i.defaultOn])) as Record<string, boolean>;

export default function NotificationSettingsScreen({ navigation }: Props) {
  const { notificationPrefs, setNotificationPrefs } = useSettingsStore();
  const [toggles, setToggles] = useState<Record<string, boolean>>({ ...DEFAULTS, ...notificationPrefs });
  const flip = (id: string) => setToggles(p => ({ ...p, [id]: !p[id] }));
  const reset = () => setToggles(DEFAULTS);
  const save = () => {
    setNotificationPrefs(toggles);
    Alert.alert('Yadda saxlanıldı', 'Bildiriş tənzimləmələriniz tətbiq edildi.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bildiriş tənzimləmələri</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Fərdi Bildirişlər</Text>
          <Text style={styles.heroSub}>
            Öyrənmə təcrübənizi idarə etmək üçün bildiriş üstünlüklərinizi aşağıdan tənzimləyin.
          </Text>
        </View>

        <View style={styles.list}>
          {ITEMS.map(item => (
            <View
              key={item.id}
              style={[styles.row, item.isPremium && styles.rowPremium]}
            >
              {item.isGradient ? (
                <LinearGradient
                  colors={[Colors.gradientStart, Colors.gradientEnd]}
                  style={styles.iconCircle}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name={item.icon} size={24} color="#fff" />
                </LinearGradient>
              ) : (
                <View style={[styles.iconCircle, { backgroundColor: item.iconBg }]}>
                  <Ionicons name={item.icon} size={24} color={item.iconColor} />
                </View>
              )}
              <View style={styles.rowText}>
                <View style={styles.rowTitleRow}>
                  <Text style={styles.rowTitle}>{item.title}</Text>
                  {item.isPremium && (
                    <View style={styles.premiumBadge}>
                      <Text style={styles.premiumBadgeText}>PREMIUM</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.rowSub}>{item.sub}</Text>
              </View>
              <Switch
                value={toggles[item.id]}
                onValueChange={() => flip(item.id)}
                trackColor={{ false: Colors.surfaceHigh, true: Colors.primary }}
                thumbColor="#fff"
                ios_backgroundColor={Colors.surfaceHigh}
              />
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={{ width: '100%' }} activeOpacity={0.85} onPress={save}>
            <LinearGradient
              colors={[Colors.gradientStart, Colors.gradientEnd]}
              style={styles.saveBtn}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            >
              <Text style={styles.saveBtnText}>Yadda saxla</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resetBtn} activeOpacity={0.7} onPress={reset}>
            <Text style={styles.resetBtnText}>Sıfırla</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surfaceLow,
  },
  headerTitle: { fontSize: 17, fontWeight: '600', color: Colors.primary },

  scroll: { padding: 20, gap: 20, paddingBottom: 48 },

  heroCard: {
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 20, padding: 28,
    alignItems: 'center', gap: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 20, elevation: 2,
  },
  heroTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.3 },
  heroSub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 21 },

  list: { gap: 8 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 12, elevation: 1,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  rowPremium: {
    borderLeftWidth: 4, borderLeftColor: Colors.primary,
    shadowColor: Colors.primary, shadowOpacity: 0.06,
  },
  iconCircle: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  rowText: { flex: 1, gap: 2 },
  rowTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  rowTitle: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  rowSub: { fontSize: 12, color: Colors.textSecondary, lineHeight: 17 },
  premiumBadge: {
    backgroundColor: Colors.primaryFixed + '1A',
    borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2,
  },
  premiumBadgeText: {
    fontSize: 9, fontWeight: '800', color: Colors.primary,
    letterSpacing: 1, textTransform: 'uppercase',
  },

  actions: { gap: 12 },
  saveBtn: {
    borderRadius: 999, paddingVertical: 18, alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 5,
  },
  saveBtnText: { fontSize: 17, fontWeight: '800', color: '#fff' },
  resetBtn: {
    borderRadius: 999, paddingVertical: 16, alignItems: 'center',
    backgroundColor: Colors.surfaceHigh,
  },
  resetBtnText: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
});
