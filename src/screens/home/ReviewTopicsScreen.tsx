import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type Status = 'due' | 'pending';

interface Item { id: string; topic: string; whenLabel: string; whenIcon: keyof typeof Ionicons.glyphMap; status: Status; }

const ITEMS: Item[] = [
  { id: '1', topic: 'Faizlər',   whenLabel: 'Bu gün təkrar et', whenIcon: 'time-outline',     status: 'due' },
  { id: '2', topic: 'Tənliklər', whenLabel: '2 gün sonra',      whenIcon: 'calendar-outline', status: 'pending' },
];

export default function ReviewTopicsScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Təkrar etməli olduğun mövzular</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* AI info card */}
        <View style={styles.aiCard}>
          <View style={styles.aiBlob} pointerEvents="none" />
          <View style={styles.aiIcon}>
            <Ionicons name="sparkles" size={22} color={Colors.primary} />
          </View>
          <Text style={styles.aiText}>AI yaddaşı gücləndirmək üçün bu testləri planladı</Text>
        </View>

        {/* Items */}
        <View style={{ gap: 24 }}>
          {ITEMS.map((it) => {
            const due = it.status === 'due';
            return (
              <View key={it.id} style={[styles.card, !due && { opacity: 0.85 }]}>
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{it.topic}</Text>
                    <View style={styles.whenRow}>
                      <Ionicons name={it.whenIcon} size={14} color={Colors.textSecondary} />
                      <Text style={styles.whenText}>{it.whenLabel}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusPill, due ? styles.statusDue : styles.statusPending]}>
                    <Text style={[styles.statusText, due ? styles.statusDueText : styles.statusPendingText]}>
                      {due ? 'Vaxtı gəldi' : 'Gözləmədə'}
                    </Text>
                  </View>
                </View>
                {due ? (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => navigation.navigate(Routes.TopicProgress, { topic: it.topic })}
                  >
                    <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primaryBtn}>
                      <Text style={styles.primaryBtnText}>Təkrar et</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity activeOpacity={0.85} style={styles.mutedBtn}>
                    <Text style={styles.mutedBtnText}>Təkrar et</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.endDecor}>
          <Ionicons name="ellipsis-horizontal" size={32} color={Colors.textMuted + '4D'} />
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, height: 60,
    backgroundColor: 'rgba(255,255,255,0.85)', gap: 12,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.primary, flex: 1 },

  scroll: { padding: 24, gap: 32, paddingBottom: 48 },

  aiCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 16,
    backgroundColor: Colors.surfaceLow, borderRadius: 16, padding: 24,
    position: 'relative', overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.06, shadowRadius: 40, elevation: 2,
  },
  aiBlob: { position: 'absolute', top: -40, right: -40, width: 128, height: 128, borderRadius: 64, backgroundColor: Colors.primary + '14' },
  aiIcon: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
  },
  aiText: { flex: 1, fontSize: 15, color: Colors.textPrimary, fontWeight: '500', lineHeight: 22 },

  card: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 24, gap: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12, elevation: 2,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4, letterSpacing: -0.2 },
  whenRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  whenText: { fontSize: 12, color: Colors.textSecondary },

  statusPill: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
  statusDue: { backgroundColor: Colors.tertiary + '33' },
  statusPending: { backgroundColor: Colors.surfaceLow },
  statusText: { fontSize: 11, fontWeight: '600' },
  statusDueText: { color: Colors.tertiary },
  statusPendingText: { color: Colors.textSecondary },

  primaryBtn: {
    paddingVertical: 14, borderRadius: 999, alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.18, shadowRadius: 18, elevation: 4,
  },
  primaryBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  mutedBtn: { paddingVertical: 14, borderRadius: 999, alignItems: 'center', backgroundColor: Colors.surfaceHigh },
  mutedBtnText: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },

  endDecor: { alignItems: 'center', opacity: 0.3, paddingVertical: 16 },
});
