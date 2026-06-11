import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useExamCollections, useStartCollectionTest } from '../../hooks/useExams';
import { ExamCollectionCard } from '../../api/examCollection.api';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

export default function ExamCollectionsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { data: collections = [], isLoading, isError, refetch, isRefetching } = useExamCollections();
  const startTest = useStartCollectionTest();
  const [startingId, setStartingId] = React.useState<string | null>(null);

  const openCard = (c: ExamCollectionCard) => {
    if (c.locked) {
      Alert.alert(
        'Premium bank',
        'Bu bank yalnız premium istifadəçilər üçündür. Abunə planlarına baxmaq istəyirsən?',
        [
          { text: 'İmtina', style: 'cancel' },
          {
            text: 'Planlar',
            onPress: () => (navigation.getParent() as any)?.navigate(Routes.Home, { screen: Routes.Plans, initial: false }),
          },
        ],
      );
      return;
    }
    if (c.questionCount === 0) {
      Alert.alert('Boş bank', 'Bu bankda hələ sual yoxdur.');
      return;
    }
    setStartingId(c.id);
    startTest.mutate(c.id, {
      onSuccess: () => {
        setStartingId(null);
        navigation.navigate(Routes.ExamSession);
      },
      onError: (err: any) => {
        setStartingId(null);
        Alert.alert('Xəta', err?.response?.data?.message ?? 'Test başladıla bilmədi.');
      },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>İmtahan Bankları</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />}
      >
        <LinearGradient colors={GRADIENT} style={styles.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.heroBlob} />
          <Text style={styles.heroTitle}>Real imtahan sualları</Text>
          <Text style={styles.heroSub}>Hər banka toxun — sual hovuzundan random test qurulur.</Text>
        </LinearGradient>

        {isLoading ? (
          <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>
        ) : isError ? (
          <View style={styles.center}>
            <Text style={styles.muted}>Banklar yüklənmədi.</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}><Text style={styles.retryText}>Yenidən</Text></TouchableOpacity>
          </View>
        ) : collections.length === 0 ? (
          <View style={styles.center}>
            <Ionicons name="library-outline" size={40} color={Colors.outlineVariant} />
            <Text style={styles.muted}>Hələ bank əlavə edilməyib.</Text>
          </View>
        ) : (
          collections.map((c) => (
            <TouchableOpacity key={c.id} style={styles.card} activeOpacity={0.9} onPress={() => openCard(c)} disabled={startingId === c.id}>
              <View style={styles.cardIconWrap}>
                <Ionicons name={c.locked ? 'lock-closed' : 'library'} size={24} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.titleRow}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{c.title}</Text>
                  {c.access === 'premium' && (
                    <View style={styles.premiumBadge}>
                      <Ionicons name="diamond" size={10} color="#fff" />
                      <Text style={styles.premiumText}>PREMIUM</Text>
                    </View>
                  )}
                </View>
                {!!c.subject && <Text style={styles.cardSub}>{c.subject}{c.grade ? ` • ${c.grade}` : ''}</Text>}
                <View style={styles.metaRow}>
                  <View style={styles.metaChip}><Ionicons name="help-circle-outline" size={13} color={Colors.textSecondary} /><Text style={styles.metaText}>{c.questionsPerTest} sual</Text></View>
                  <View style={styles.metaChip}><Ionicons name="time-outline" size={13} color={Colors.textSecondary} /><Text style={styles.metaText}>{c.duration} dəq</Text></View>
                  {c.bestScore !== null && (
                    <View style={styles.metaChip}><Ionicons name="trophy-outline" size={13} color={Colors.tertiary} /><Text style={[styles.metaText, { color: Colors.tertiary }]}>{c.bestScore}%</Text></View>
                  )}
                </View>
              </View>
              {startingId === c.id ? (
                <ActivityIndicator color={Colors.primary} />
              ) : (
                <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.7)', borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },

  scroll: { padding: 20, gap: 14, paddingBottom: 40 },

  hero: {
    borderRadius: 20, padding: 24, overflow: 'hidden', gap: 6,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 4,
  },
  heroBlob: { position: 'absolute', top: -40, right: -40, width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255,255,255,0.08)' },
  heroTitle: { fontSize: 19, fontWeight: '800', color: '#fff' },
  heroSub: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.85)', lineHeight: 19 },

  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, gap: 12 },
  muted: { fontSize: 14, color: Colors.textSecondary },
  retryBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999, backgroundColor: Colors.primaryLight },
  retryText: { fontSize: 14, fontWeight: '700', color: Colors.primary },

  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.surfaceLowest, borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: Colors.borderLight,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12, elevation: 1,
  },
  cardIconWrap: { width: 48, height: 48, borderRadius: 16, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { flex: 1, fontSize: 15, fontWeight: '800', color: Colors.textPrimary },
  premiumBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.tertiary, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 3 },
  premiumText: { fontSize: 8, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  cardSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  metaRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, fontWeight: '600', color: Colors.textSecondary },
});
