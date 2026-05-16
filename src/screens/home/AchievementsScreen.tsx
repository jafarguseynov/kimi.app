import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';

type Props = { navigation: NativeStackNavigationProp<HomeStackParamList, typeof Routes.Achievements> };

const BADGES = [
  {
    id: '1',
    icon: 'trophy' as const,
    iconBg: Colors.primaryFixed + '33',
    iconColor: Colors.primary,
    title: 'Kurs\ntamamlandı',
    subtitle: 'İlk kursunu uğurla bitirdin',
    isLocked: false,
  },
  {
    id: '2',
    icon: 'school-outline' as const,
    iconBg: Colors.primaryFixed + '33',
    iconColor: Colors.primary,
    title: '100%\nnəticə',
    subtitle: 'İmtahandan maksimum bal topladın',
    isLocked: false,
  },
  {
    id: '3',
    icon: 'star' as const,
    iconBg: Colors.warningLight,
    iconColor: Colors.warning,
    title: 'Top\nperformer',
    subtitle: 'Həftəlik reytinqdə ilk 10-luğa daxil oldun',
    isLocked: false,
  },
  {
    id: '4',
    icon: 'lock-closed' as const,
    iconBg: Colors.surfaceVariant,
    iconColor: Colors.textSecondary,
    title: 'Master',
    subtitle: 'Açmaq üçün 5 kurs tamamla',
    isLocked: true,
  },
];

export default function AchievementsScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nailiyyətlərin</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {BADGES.map((badge) => (
            <View
              key={badge.id}
              style={[styles.badgeCard, badge.isLocked && styles.badgeCardLocked]}
            >
              <View style={[styles.badgeIconCircle, { backgroundColor: badge.iconBg }]}>
                <Ionicons name={badge.icon} size={32} color={badge.iconColor} />
              </View>
              <Text style={[styles.badgeTitle, badge.isLocked && styles.badgeTitleLocked]}>
                {badge.title}
              </Text>
              <Text style={[styles.badgeSub, badge.isLocked && styles.badgeSubLocked]}>
                {badge.subtitle}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, height: 64,
    backgroundColor: 'rgba(255,255,255,0.7)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  backBtn: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    flex: 1, textAlign: 'center',
    fontSize: 22, fontWeight: '600', color: Colors.textPrimary,
  },
  headerSpacer: { width: 48 },

  scroll: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 48 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },

  badgeCard: {
    width: '47%', backgroundColor: Colors.surfaceLowest,
    borderRadius: 20, padding: 24,
    alignItems: 'center', gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12, elevation: 1,
  },
  badgeCardLocked: {
    backgroundColor: Colors.surfaceContainer,
    opacity: 0.6,
  },
  badgeIconCircle: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center',
  },
  badgeTitle: {
    fontSize: 16, fontWeight: '600', color: Colors.textPrimary,
    textAlign: 'center', lineHeight: 22,
  },
  badgeTitleLocked: { color: Colors.textPrimary },
  badgeSub: {
    fontSize: 12, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: 18,
  },
  badgeSubLocked: { color: Colors.textSecondary },
});
