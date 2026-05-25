import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type IconName = React.ComponentProps<typeof Ionicons>['name'];

type CalcCard = {
  route: string;
  title: string;
  desc: string;
  icon: IconName;
  iconColor: string;
  iconBg: string;
  fullWidth?: boolean;
  gradient?: boolean;
};

const CARDS: CalcCard[] = [
  {
    route: Routes.SemesterCalc,
    title: 'Yarımillik qiymətləndirmə',
    desc: 'BSQ və KSQ ballarına əsasən yarımillik nəticənin hesablanması.',
    icon: 'calendar-outline',
    iconColor: Colors.primary,
    iconBg: Colors.primaryLight,
  },
  {
    route: Routes.AnnualCalc,
    title: 'İllik qiymətləndirmə',
    desc: 'İki yarımillik əsasında yekun illik balın təyini.',
    icon: 'calendar-clear-outline',
    iconColor: Colors.tertiary,
    iconBg: Colors.onTertiary,
  },
  {
    route: Routes.ScoreCalc,
    title: 'Sual sayına görə bal',
    desc: 'Düz və səhv cavabların bal ekvivalentini müəyyən et.',
    icon: 'help-circle-outline',
    iconColor: '#fff',
    iconBg: 'gradient',
    fullWidth: true,
    gradient: true,
  },
  {
    route: Routes.QualityCalc,
    title: 'Keyfiyyət və müvəffəqiyyət',
    desc: 'Sinif üzrə ümumi keyfiyyət faizinin avtomatik analizi.',
    icon: 'stats-chart-outline',
    iconColor: Colors.secondary,
    iconBg: Colors.secondaryContainer,
  },
  {
    route: Routes.DIMCalc,
    title: 'DİM kalkulyatoru',
    desc: 'Rəsmi imtahan formatına uyğun bal hesablama aləti.',
    icon: 'school-outline',
    iconColor: Colors.primary,
    iconBg: Colors.primaryLight,
  },
];

export default function CalculatorsHomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const renderCard = (card: CalcCard) => (
    <TouchableOpacity
      key={card.route + card.title}
      style={[styles.card, card.fullWidth && styles.cardFull]}
      onPress={() => navigation.navigate(card.route as any)}
      activeOpacity={0.8}
    >
      {card.gradient ? (
        <LinearGradient colors={GRADIENT} style={styles.iconBoxGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Ionicons name={card.icon} size={28} color={card.iconColor} />
        </LinearGradient>
      ) : (
        <View style={[styles.iconBox, { backgroundColor: card.iconBg }]}>
          <Ionicons name={card.icon} size={22} color={card.iconColor} />
        </View>
      )}
      <View style={card.fullWidth ? styles.cardInfoRow : styles.cardInfo}>
        <Text style={styles.cardTitle}>{card.title}</Text>
        <Text style={styles.cardDesc}>{card.desc}</Text>
      </View>
    </TouchableOpacity>
  );

  const half = CARDS.filter((c) => !c.fullWidth);
  const full = CARDS.filter((c) => c.fullWidth);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kalkulyatorlar</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Hero */}
        <LinearGradient colors={GRADIENT} style={styles.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.heroBlob} />
          <Text style={styles.heroTitle}>Düzgün hesabla,{'\n'}nəticəni dərhal gör!</Text>
          <Text style={styles.heroSub}>Akademik göstəricilərini asanlıqla izlə və analiz et.</Text>
        </LinearGradient>

        {/* Shortcuts */}
        <View style={styles.shortcutRow}>
          <TouchableOpacity
            style={styles.shortcutChip}
            onPress={() => navigation.navigate(Routes.CalcHistory as any)}
            activeOpacity={0.85}
          >
            <View style={styles.shortcutIcon}>
              <Ionicons name="time-outline" size={18} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.shortcutTitle}>Tarixçə</Text>
              <Text style={styles.shortcutSub}>Bütün hesablamalar</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.primaryFixed} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shortcutChip}
            onPress={() => navigation.navigate(Routes.CalcSaved as any)}
            activeOpacity={0.85}
          >
            <View style={styles.shortcutIcon}>
              <Ionicons name="bookmark" size={18} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.shortcutTitle}>Yaddaş</Text>
              <Text style={styles.shortcutSub}>Saxlanılanlar</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.primaryFixed} />
          </TouchableOpacity>
        </View>

        {/* Grid */}
        <View style={styles.grid}>
          {/* Row 1 — 2 half cards */}
          <View style={styles.row}>
            {renderCard(half[0])}
            {renderCard(half[1])}
          </View>
          {/* Full width card */}
          {renderCard(full[0])}
          {/* Row 2 — 2 half cards */}
          <View style={styles.row}>
            {renderCard(half[2])}
            {renderCard(half[3])}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Ionicons name="shield-checkmark-outline" size={20} color={Colors.outlineVariant} />
          <Text style={styles.footerText}>ARTİ Standartlarına Uyğundur</Text>
        </View>
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
  headerTitle: { fontSize: 18, fontWeight: '600', color: Colors.primary },

  scroll: { padding: 20, gap: 16, paddingBottom: 40 },

  hero: {
    borderRadius: 20, padding: 32, overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15, shadowRadius: 24, elevation: 4,
    gap: 8,
  },
  heroBlob: {
    position: 'absolute', top: -40, right: -40,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#fff', lineHeight: 30 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 20 },

  shortcutRow: { flexDirection: 'row', gap: 12 },
  shortcutChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  shortcutIcon: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  shortcutTitle: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  shortcutSub: { fontSize: 10, fontWeight: '500', color: Colors.textMuted, marginTop: 2 },

  grid: { gap: 12 },
  row: { flexDirection: 'row', gap: 12 },

  card: {
    flex: 1, backgroundColor: Colors.surfaceLowest, borderRadius: 18, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03, shadowRadius: 12, elevation: 1,
    gap: 12,
  },
  cardFull: {
    flex: 0, flexDirection: 'row', alignItems: 'center', gap: 16,
  },
  cardInfo: { gap: 4 },
  cardInfoRow: { flex: 1, gap: 4 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, lineHeight: 20 },
  cardDesc: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },

  iconBox: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  iconBoxGrad: {
    width: 56, height: 56, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },

  footer: { alignItems: 'center', gap: 6, paddingTop: 8 },
  footerText: { fontSize: 10, fontWeight: '700', color: Colors.outlineVariant, textTransform: 'uppercase', letterSpacing: 1.5 },
});
