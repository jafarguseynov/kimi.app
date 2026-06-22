import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

export default function MotivationReminderScreen() {
  const navigation = useNavigation<any>();
  const [notifications, setNotifications] = useState(true);
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBackBtn} onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('motivReminder.title')}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Motivational hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroBlob} pointerEvents="none" />
          <View style={styles.heroIcon}>
            <Ionicons name="checkmark-done-circle" size={48} color={Colors.primary} />
          </View>
          <Text style={styles.heroTitle}>{t('motivReminder.heroTitle')}</Text>
          <Text style={styles.heroSub}>{t('motivReminder.heroSub')}</Text>
        </View>

        {/* AI Emotional message */}
        <View style={styles.aiRow}>
          <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.aiAvatar}>
            <Ionicons name="hardware-chip" size={22} color="#fff" />
          </LinearGradient>
          <View style={styles.aiBubble}>
            <View style={styles.bubbleTail} />
            <Text style={styles.aiBubbleText}>
              {t('motivReminder.aiPre')}<Text style={{ fontWeight: '800' }}>{t('motivReminder.aiBold')}</Text>{t('motivReminder.aiPost')}
              <Text style={{ fontSize: 20 }}>🔥</Text>
            </Text>
            <Text style={styles.aiBubbleSub}>{t('motivReminder.aiSub')}</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={{ gap: 16 }}>
          <TouchableOpacity activeOpacity={0.85} onPress={() => navigation.goBack()}>
            <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>{t('motivReminder.startNow')}</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.85}>
            <Text style={styles.secondaryBtnText}>{t('motivReminder.remindLater')}</Text>
          </TouchableOpacity>
        </View>

        {/* Settings toggle */}
        <View style={styles.settingsCard}>
          <View style={styles.settingsLeft}>
            <View style={styles.settingsIcon}>
              <Ionicons name="notifications-circle" size={26} color={Colors.textSecondary} />
            </View>
            <View>
              <Text style={styles.settingsTitle}>{t('motivReminder.enableNotif')}</Text>
              <Text style={styles.settingsSub}>{t('motivReminder.enableNotifSub')}</Text>
            </View>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: Colors.surfaceHigh, true: Colors.primary }}
            thumbColor="#fff"
          />
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, height: 60,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  headerBackBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surfaceLow },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginHorizontal: 8 },
  headerBtn: { width: 40, height: 40, borderRadius: 20 },

  scroll: { padding: 24, gap: 32, paddingBottom: 48 },

  heroCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 24, padding: 32,
    alignItems: 'center', overflow: 'hidden', position: 'relative',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.06, shadowRadius: 40, elevation: 3,
  },
  heroBlob: {
    position: 'absolute', right: -64, top: -64,
    width: 192, height: 192, borderRadius: 96,
    backgroundColor: Colors.primary + '22',
  },
  heroIcon: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
    zIndex: 1,
  },
  heroTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center', lineHeight: 28, maxWidth: 280, marginBottom: 12, letterSpacing: -0.3, zIndex: 1 },
  heroSub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 21, maxWidth: 300, zIndex: 1 },

  aiRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  aiAvatar: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 4,
    marginTop: -4,
  },
  aiBubble: {
    flex: 1,
    backgroundColor: Colors.surfaceLow,
    borderRadius: 16, borderTopLeftRadius: 4,
    padding: 20,
    position: 'relative',
  },
  bubbleTail: {
    position: 'absolute', left: -6, top: 0,
    width: 16, height: 16, backgroundColor: Colors.surfaceLow,
    transform: [{ rotate: '45deg' }],
  },
  aiBubbleText: { fontSize: 15, color: Colors.textPrimary, lineHeight: 22 },
  aiBubbleSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 8 },

  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 16, borderRadius: 999,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.15, shadowRadius: 40, elevation: 6,
  },
  primaryBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },
  secondaryBtn: {
    paddingVertical: 16, borderRadius: 999, alignItems: 'center',
    backgroundColor: Colors.surfaceHigh,
  },
  secondaryBtnText: { fontSize: 17, fontWeight: '500', color: Colors.textPrimary },

  settingsCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 20,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.04, shadowRadius: 40, elevation: 2,
  },
  settingsLeft: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
  settingsIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center', justifyContent: 'center',
  },
  settingsTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  settingsSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
});
