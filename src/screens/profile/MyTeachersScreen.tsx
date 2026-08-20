import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { getMyTeachers, MyTeacher } from '../../api/collaboration.api';
import { levelMeta } from '../../constants/teacherLevel';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('az-AZ', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

export default function MyTeachersScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  const { data: teachers = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['myTeachers'],
    queryFn: getMyTeachers,
    retry: 1,
  });

  const renderCard = (item: MyTeacher) => {
    const meta = levelMeta(item.level ?? undefined);
    return (
      <View key={item.teacherId} style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(item.teacherName || '?').charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{item.teacherName}</Text>
            {item.isVerified && <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />}
          </View>

          <View style={styles.badgeRow}>
            {item.subject ? (
              <View style={styles.subjectBadge}>
                <Ionicons name="book" size={12} color={Colors.primary} />
                <Text style={styles.subjectBadgeText}>{item.subject}</Text>
              </View>
            ) : (
              <Text style={styles.noSubject}>{t('myTeachers.noSubject')}</Text>
            )}
            {meta && (
              <View style={[styles.levelBadge, { backgroundColor: meta.bg }]}>
                <Ionicons name={meta.icon} size={11} color={meta.fg} />
                <Text style={[styles.levelBadgeText, { color: meta.fg }]}>{t(`teacherLevel.${meta.key}`)}</Text>
              </View>
            )}
          </View>

          <View style={styles.metaRow}>
            {item.rating != null && item.rating > 0 && (
              <View style={styles.metaItem}>
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text style={styles.metaText}>{item.rating.toFixed(1)}</Text>
              </View>
            )}
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={12} color={Colors.textMuted} />
              <Text style={styles.metaText}>{t('myTeachers.joinedAt', { date: formatDate(item.joinedAt) })}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('myTeachers.headerTitle')}</Text>
        <View style={styles.headerBtn} />
      </View>

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator color={Colors.primary} /></View>
      ) : teachers.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyScroll}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />}
        >
          <View style={styles.emptyIcon}>
            <Ionicons name="people-outline" size={36} color={Colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>{t('myTeachers.emptyTitle')}</Text>
          <Text style={styles.emptySubtitle}>{t('myTeachers.emptySubtitle')}</Text>
          <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate(Routes.JoinTeacher)} style={{ marginTop: 22, width: '100%' }}>
            <LinearGradient colors={GRADIENT} style={styles.joinBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.joinBtnText}>{t('myTeachers.joinCta')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />}
        >
          <Text style={styles.countLabel}>{t('myTeachers.count', { count: teachers.length })}</Text>
          {teachers.map(renderCard)}

          <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate(Routes.JoinTeacher)} style={{ marginTop: 6 }}>
            <View style={styles.addRow}>
              <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
              <Text style={styles.addRowText}>{t('myTeachers.joinCta')}</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.primary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  scroll: { padding: 16, gap: 12 },
  countLabel: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, marginLeft: 4, marginBottom: 2 },

  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.surfaceLowest, borderRadius: 18, padding: 14,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  avatar: {
    width: 52, height: 52, borderRadius: 16, backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: '800', color: Colors.primary },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary, flexShrink: 1 },

  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' },
  subjectBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.primaryLight, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4,
  },
  subjectBadgeText: { fontSize: 12, fontWeight: '800', color: Colors.primary },
  noSubject: { fontSize: 12, color: Colors.textMuted, fontStyle: 'italic' },
  levelBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  levelBadgeText: { fontSize: 11, fontWeight: '800' },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },

  addRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: Colors.borderLight, borderStyle: 'dashed',
  },
  addRowText: { fontSize: 14, fontWeight: '700', color: Colors.primary },

  emptyScroll: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 24, backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: 18,
  },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center' },
  emptySubtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginTop: 6, lineHeight: 21, maxWidth: 300 },
  joinBtn: {
    height: 54, borderRadius: 999, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  joinBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
});
