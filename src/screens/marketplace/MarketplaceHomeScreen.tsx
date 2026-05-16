import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useQuery } from '@tanstack/react-query';
import { getQuestions, MarketQuestion } from '../../api/marketplace.api';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

export default function MarketplaceHomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [refreshing, setRefreshing] = React.useState(false);

  const { data: questions = [], isLoading, refetch } = useQuery({
    queryKey: ['marketplace-questions'],
    queryFn: () => getQuestions(),
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <Ionicons name="person" size={18} color={Colors.primary} />
        </View>
        <Text style={styles.headerTitle}>Xüsusi suallar</Text>
        <TouchableOpacity activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="notifications-outline" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Intro text */}
        <Text style={styles.introText}>
          Sizin ekspertizanıza uyğun, yüksək büdcəli suallar.
        </Text>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : questions.length === 0 ? (
          <View style={styles.center}>
            <Ionicons name="help-circle-outline" size={48} color={Colors.primaryFixed} />
            <Text style={styles.emptyText}>Hələ sual yoxdur</Text>
          </View>
        ) : (
          questions.map((q: MarketQuestion, idx: number) => (
          <View key={q.id} style={styles.card}>
            {idx === 0 && <View style={styles.cardAura} pointerEvents="none" />}

            <View style={styles.cardTopRow}>
              <Text style={styles.cardTitle}>{q.title}</Text>
              {q.price > 0 && (
                <View style={styles.priceBadge}>
                  <Text style={styles.priceText}>{q.price.toFixed(2)} AZN</Text>
                </View>
              )}
            </View>

            <View style={styles.badgesRow}>
              {q.price > 0 && (
                <View style={styles.premiumBadge}>
                  <Ionicons name="star" size={12} color={Colors.primary} />
                  <Text style={styles.premiumBadgeText}>Premium</Text>
                </View>
              )}
              <View style={styles.subjectBadge}>
                <Text style={styles.subjectBadgeText}>{q.subject}</Text>
              </View>
              {q.isResolved && (
                <View style={[styles.subjectBadge, { backgroundColor: Colors.tertiary + '18' }]}>
                  <Text style={[styles.subjectBadgeText, { color: Colors.tertiary }]}>Həll edildi</Text>
                </View>
              )}
            </View>

            <Text style={styles.cardDesc} numberOfLines={3}>{q.body}</Text>

            <View style={styles.verifiedRow}>
              <Ionicons name="person-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.verifiedText}>{q.author.name}</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => navigation.navigate(Routes.QuestionDetail, { questionId: q.id })}
            >
              <LinearGradient
                colors={GRADIENT}
                style={styles.answerBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.answerBtnText}>Cavabla</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
          ))
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => navigation.navigate(Routes.AskQuestion)}
      >
        <LinearGradient
          colors={GRADIENT}
          style={styles.fabGrad}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="add-circle-outline" size={22} color="#fff" />
          <Text style={styles.fabText}>Sual paylaş</Text>
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, height: 64,
    backgroundColor: 'rgba(255,255,255,0.7)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  avatarCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  headerTitle: {
    flex: 1, textAlign: 'center',
    fontSize: 18, fontWeight: '700', color: Colors.primary,
  },

  scroll: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 120, gap: 20 },

  center: { paddingTop: 40, alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 14, color: Colors.textSecondary },

  introText: {
    fontSize: 16, color: Colors.textSecondary, lineHeight: 24,
    paddingHorizontal: 4,
  },

  card: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 24, gap: 20,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.06, shadowRadius: 40, elevation: 2,
    overflow: 'hidden',
  },
  cardAura: {
    position: 'absolute', top: -40, right: -40,
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: Colors.primaryFixed,
    opacity: 0.3,
  },

  cardTopRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  cardTitle: {
    flex: 1, fontSize: 18, fontWeight: '700', color: Colors.textPrimary,
    lineHeight: 26,
  },
  priceBadge: {
    backgroundColor: Colors.primaryFixed + '33',
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7,
    flexShrink: 0,
  },
  priceText: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },

  badgesRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  premiumBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.surfaceLow,
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6,
  },
  premiumBadgeText: { fontSize: 12, fontWeight: '600', color: Colors.primary },
  subjectBadge: {
    backgroundColor: Colors.background,
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6,
  },
  subjectBadgeText: { fontSize: 12, fontWeight: '500', color: Colors.textSecondary },

  cardDesc: {
    fontSize: 15, color: Colors.textSecondary, lineHeight: 24,
  },

  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  verifiedText: { fontSize: 13, color: Colors.textSecondary },

  answerBtn: {
    height: 60, borderRadius: 999,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 15 }, shadowOpacity: 0.15, shadowRadius: 30, elevation: 4,
    marginTop: 4,
  },
  answerBtnText: { fontSize: 18, fontWeight: '700', color: '#fff' },

  fab: {
    position: 'absolute', bottom: 100, right: 20,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 20, elevation: 8,
    borderRadius: 999,
  },
  fabGrad: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 20, paddingVertical: 14,
    borderRadius: 999,
  },
  fabText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
