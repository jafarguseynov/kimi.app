import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useUserStore } from '../../store/user.store';
import { useLogout } from '../../hooks/useAuth';
import { useSettingsStore } from '../../store/settings.store';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

export default function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { user } = useUserStore();
  const { t } = useTranslation();
  const logout = useLogout();
  const { pushEnabled, emailEnabled, setPushEnabled, setEmailEnabled, language } = useSettingsStore();

  const name = user?.name ?? t('profileSettings.defaultName');
  const initial = name[0]?.toUpperCase() ?? '?';
  const languageLabel = language === 'en' ? 'English' : language === 'ru' ? 'Русский' : 'Azərbaycan dili';

  const SECURITY_ITEMS = [
    { icon: 'lock-closed-outline' as const, label: t('profileSettings.secChangePassword'), route: Routes.ChangePassword },
    { icon: 'shield-checkmark-outline' as const, label: t('profileSettings.secTwoFactor'), route: Routes.TwoFactor },
    { icon: 'ban-outline' as const, label: t('profileSettings.secBlocked'), route: Routes.BlockedUsers },
    { icon: 'person-remove-outline' as const, label: t('profileSettings.secAccountMgmt'), route: Routes.AccountManagement },
  ];

  const HELP_ITEMS = [
    { icon: 'help-buoy-outline' as const, label: t('profileSettings.helpCenter'), route: Routes.HelpCenter },
    { icon: 'chatbubbles-outline' as const, label: t('profileSettings.helpSupport'), route: Routes.Support },
    { icon: 'bug-outline' as const, label: t('profileSettings.helpReport'), route: Routes.ReportProblem },
    { icon: 'document-text-outline' as const, label: t('profileSettings.helpTerms'), route: Routes.TermsOfService },
    { icon: 'information-circle-outline' as const, label: t('profileSettings.helpAbout'), route: Routes.AboutApp },
  ];

  const goEditProfile = () => {
    // Settings ilə eyni stack-dədir — birbaşa push et ki, geri Settings-ə qayıtsın.
    navigation.navigate(Routes.EditProfile);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('profileSettings.headerTitle')}</Text>
        <View style={styles.headerBtn}>
          <Ionicons name="settings-outline" size={22} color={Colors.primary} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.profileRow}>
            <LinearGradient colors={GRADIENT} style={styles.avatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={styles.avatarInitial}>{initial}</Text>
              <TouchableOpacity style={styles.editBadge} activeOpacity={0.8} onPress={goEditProfile}>
                <Ionicons name="pencil" size={12} color="#fff" />
              </TouchableOpacity>
            </LinearGradient>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{name}</Text>
              <Text style={styles.profileEmail}>{user?.phone ?? t('profileSettings.defaultAccount')}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editProfileBtn} activeOpacity={0.8} onPress={goEditProfile}>
            <Text style={styles.editProfileText}>{t('profileSettings.editProfile')}</Text>
          </TouchableOpacity>
        </View>

        {/* Notifications */}
        <Text style={styles.sectionLabel}>{t('profileSettings.notifSection')}</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={styles.iconBox}>
                <Ionicons name="notifications-outline" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.settingText}>{t('profileSettings.pushNotif')}</Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: Colors.surfaceContainer, true: Colors.primary }}
              thumbColor="#fff"
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={styles.iconBox}>
                <Ionicons name="mail-outline" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.settingText}>{t('profileSettings.emailNews')}</Text>
            </View>
            <Switch
              value={emailEnabled}
              onValueChange={setEmailEnabled}
              trackColor={{ false: Colors.surfaceContainer, true: Colors.primary }}
              thumbColor="#fff"
            />
          </View>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.settingRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate(Routes.NotificationSettings)}
          >
            <View style={styles.settingLeft}>
              <View style={styles.iconBox}>
                <Ionicons name="options-outline" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.settingText}>{t('profileSettings.detailedNotif')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.outlineVariant} />
          </TouchableOpacity>
        </View>

        {/* Language */}
        <Text style={styles.sectionLabel}>{t('profileSettings.languageSection')}</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.settingRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate(Routes.LanguageSelect)}
          >
            <View style={styles.settingLeft}>
              <View style={styles.iconBox}>
                <Ionicons name="language-outline" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.settingText}>{languageLabel}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.outlineVariant} />
          </TouchableOpacity>
        </View>

        {/* Security */}
        <Text style={styles.sectionLabel}>{t('profileSettings.securitySection')}</Text>
        <View style={styles.card}>
          {SECURITY_ITEMS.map((item, i) => (
            <React.Fragment key={item.label}>
              <TouchableOpacity
                style={styles.settingRow}
                activeOpacity={0.7}
                onPress={() => navigation.navigate(item.route)}
              >
                <View style={styles.settingLeft}>
                  <View style={styles.iconBox}>
                    <Ionicons name={item.icon} size={20} color={Colors.primary} />
                  </View>
                  <Text style={styles.settingText}>{item.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.outlineVariant} />
              </TouchableOpacity>
              {i < SECURITY_ITEMS.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Help & support */}
        <Text style={styles.sectionLabel}>{t('profileSettings.helpSection')}</Text>
        <View style={styles.card}>
          {HELP_ITEMS.map((item, i) => (
            <React.Fragment key={item.label}>
              <TouchableOpacity
                style={styles.settingRow}
                activeOpacity={0.7}
                onPress={() => navigation.navigate(item.route)}
              >
                <View style={styles.settingLeft}>
                  <View style={styles.iconBox}>
                    <Ionicons name={item.icon} size={20} color={Colors.primary} />
                  </View>
                  <Text style={styles.settingText}>{item.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.outlineVariant} />
              </TouchableOpacity>
              {i < HELP_ITEMS.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
          <Text style={styles.logoutText}>{t('profileSettings.logout')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary },

  scroll: { padding: 20, gap: 16, paddingBottom: 48 },

  profileCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 20, gap: 16,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 24, elevation: 2,
  },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: '#fff',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 3,
  },
  avatarInitial: { fontSize: 28, fontWeight: '800', color: '#fff' },
  editBadge: {
    position: 'absolute', bottom: 2, right: 2,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  profileInfo: { flex: 1, gap: 4 },
  profileName: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  profileEmail: { fontSize: 13, color: Colors.textSecondary },
  editProfileBtn: {
    backgroundColor: Colors.surfaceLow, borderRadius: 999,
    paddingVertical: 12, alignItems: 'center',
  },
  editProfileText: { fontSize: 14, fontWeight: '600', color: Colors.primary },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: Colors.outline,
    textTransform: 'uppercase', letterSpacing: 1.2, paddingHorizontal: 4,
  },

  card: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1,
  },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingVertical: 16,
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconBox: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  settingText: { fontSize: 15, fontWeight: '500', color: Colors.textPrimary },
  divider: { height: 1, backgroundColor: Colors.borderLight, marginHorizontal: 18 },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: Colors.dangerLight + '60', borderRadius: 20,
    paddingVertical: 16,
    borderWidth: 1, borderColor: Colors.danger + '30',
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: Colors.danger },
});
