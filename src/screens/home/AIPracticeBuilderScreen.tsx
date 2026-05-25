import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type Count = 5 | 10 | 20;
type Difficulty = 'Asan' | 'Orta' | 'Çətin';

const HISTORY = [
  { id: '1', title: 'Riyaziyyat - Tənliklər', meta: 'Dünən, 10 sual',     icon: 'function' as any },
  { id: '2', title: 'İngilis dili - Zamanlar', meta: '2 gün əvvəl, 20 sual', icon: 'language' as const },
];

export default function AIPracticeBuilderScreen() {
  const navigation = useNavigation<any>();
  const [topic, setTopic] = useState('Faizlər');
  const [count, setCount] = useState<Count>(10);
  const [difficulty, setDifficulty] = useState<Difficulty>('Orta');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Məşq Yaradıcı</Text>
        <TouchableOpacity style={styles.headerBtn} hitSlop={8}>
          <Ionicons name="time-outline" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Topic selector */}
        <View style={{ gap: 8 }}>
          <Text style={styles.label}>Mövzu seç</Text>
          <TouchableOpacity style={styles.selector} activeOpacity={0.85}>
            <Text style={styles.selectorText}>{topic}</Text>
            <Ionicons name="chevron-down" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* AI recommendation */}
        <View style={styles.recCard}>
          <View style={styles.recBlob} pointerEvents="none" />
          <View style={styles.recIcon}>
            <Ionicons name="bulb" size={22} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.recTitle}>AI Tövsiyəsi</Text>
            <Text style={styles.recSub}>AI sənin zəif mövzularına görə tövsiyə edir:</Text>
            <Text style={styles.recValue}>10 sual</Text>
          </View>
        </View>

        {/* Question count */}
        <View style={{ gap: 12 }}>
          <Text style={styles.label}>Sual sayı</Text>
          <View style={styles.segmented}>
            {([5, 10, 20] as Count[]).map((n) => {
              const active = count === n;
              return (
                <TouchableOpacity
                  key={n} activeOpacity={0.85} onPress={() => setCount(n)}
                  style={[styles.segItem, active && styles.segItemActive]}
                >
                  <Text style={[styles.segText, active && styles.segTextActive]}>{n}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Difficulty */}
        <View style={{ gap: 12 }}>
          <Text style={styles.label}>Çətinlik</Text>
          <View style={styles.segmented}>
            {(['Asan', 'Orta', 'Çətin'] as Difficulty[]).map((d) => {
              const active = difficulty === d;
              return (
                <TouchableOpacity
                  key={d} activeOpacity={0.85} onPress={() => setDifficulty(d)}
                  style={[styles.segItem, active && styles.segItemActive]}
                >
                  <Text style={[styles.segText, active && styles.segTextActive]}>{d}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* CTA */}
        <TouchableOpacity activeOpacity={0.85} style={{ marginTop: 8 }}>
          <LinearGradient colors={GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.ctaBtn}>
            <Ionicons name="sparkles" size={20} color="#fff" />
            <Text style={styles.ctaText}>Məşq yarat</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* History */}
        <View style={{ gap: 16, marginTop: 16 }}>
          <Text style={styles.sectionTitle}>Son yaradılan məşqlər</Text>
          <View style={{ gap: 12 }}>
            {HISTORY.map((h) => (
              <TouchableOpacity key={h.id} style={styles.histItem} activeOpacity={0.85}>
                <View style={styles.histIcon}>
                  <Ionicons name={h.icon as any} size={22} color={Colors.textSecondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.histTitle}>{h.title}</Text>
                  <Text style={styles.histMeta}>{h.meta}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
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
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.primary },

  scroll: { padding: 24, gap: 24, paddingBottom: 48 },

  label: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  selector: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.surfaceLowest,
    paddingVertical: 16, paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  selectorText: { fontSize: 16, fontWeight: '500', color: Colors.textPrimary },

  recCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 16,
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: Colors.borderLight,
    position: 'relative', overflow: 'hidden',
  },
  recBlob: { position: 'absolute', top: -16, right: -16, width: 96, height: 96, borderRadius: 48, backgroundColor: Colors.primary + '14' },
  recIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center', justifyContent: 'center',
  },
  recTitle: { fontSize: 18, fontWeight: '700', color: Colors.primary, marginBottom: 4 },
  recSub: { fontSize: 13, color: Colors.textSecondary },
  recValue: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginTop: 4 },

  segmented: {
    flexDirection: 'row', gap: 8,
    backgroundColor: Colors.surfaceLow,
    padding: 6, borderRadius: 16,
  },
  segItem: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  segItemActive: {
    backgroundColor: Colors.surfaceLowest,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
  },
  segText: { fontSize: 15, fontWeight: '500', color: Colors.textSecondary },
  segTextActive: { fontWeight: '600', color: Colors.textPrimary },

  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 16, borderRadius: 16,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 14, elevation: 4,
  },
  ctaText: { fontSize: 17, fontWeight: '700', color: '#fff' },

  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  histItem: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  histIcon: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center', justifyContent: 'center',
  },
  histTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  histMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
});
