import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type Method = 'card' | 'apple' | 'google' | 'other';

const METHODS: {
  id: Method;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  sub: string;
  selBg: string;
  selIcon: string;
  defBg: string;
  defIcon: string;
}[] = [
  { id: 'card', icon: 'card-outline', label: 'Bank kartı', sub: 'Visa, MasterCard, Maestro', selBg: Colors.primary, selIcon: '#fff', defBg: Colors.primaryLight, defIcon: Colors.primary },
  { id: 'apple', icon: 'logo-apple', label: 'Apple Pay', sub: 'Sürətli və təhlükəsiz ödəniş', selBg: '#0F172A', selIcon: '#fff', defBg: Colors.surfaceContainer, defIcon: Colors.textPrimary },
  { id: 'google', icon: 'logo-android', label: 'Google Pay', sub: 'Android cihazlar üçün uyğun', selBg: Colors.textPrimary, selIcon: '#fff', defBg: Colors.surfaceContainer, defIcon: Colors.textPrimary },
  { id: 'other', icon: 'wallet-outline', label: 'Digər ödəniş üsulu', sub: 'Elektron pulqabı və terminallar', selBg: Colors.tertiary, selIcon: Colors.onTertiary, defBg: Colors.tertiaryContainer + '55', defIcon: Colors.tertiary },
];

export default function PaymentMethodScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute();
  const params = (route.params ?? {}) as any;
  const [selected, setSelected] = useState<Method>('card');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ödəniş Üsulu</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <View style={styles.infoBannerAccent} />
          <Text style={styles.infoBannerText}>
            Xoş gəldiniz! Təhlükəsiz ödəniş etmək üçün aşağıdakı üsullardan birini seçin. Bütün əməliyyatlar şifrələnmiş şəkildə qorunur.
          </Text>
        </View>

        {/* Methods */}
        {METHODS.map((m) => {
          const active = selected === m.id;
          return (
            <TouchableOpacity
              key={m.id}
              style={[styles.methodCard, active && styles.methodCardActive]}
              onPress={() => setSelected(m.id)}
              activeOpacity={0.85}
            >
              <View style={[styles.methodIconBox, { backgroundColor: active ? m.selBg : m.defBg }]}>
                <Ionicons name={m.icon} size={22} color={active ? m.selIcon : m.defIcon} />
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodLabel}>{m.label}</Text>
                <Text style={styles.methodSub}>{m.sub}</Text>
              </View>
              <Ionicons
                name="checkmark-circle"
                size={22}
                color={Colors.primary}
                style={{ opacity: active ? 1 : 0 }}
              />
            </TouchableOpacity>
          );
        })}

        {/* Summary */}
        <View style={styles.summary}>
          <View>
            <Text style={styles.summaryLabel}>Məbləğ</Text>
            <Text style={styles.summaryAmount}>45.00 <Text style={styles.summaryCurrency}>AZN</Text></Text>
          </View>
          <Text style={styles.summaryFee}>Xidmət haqqı: 0.00 AZN</Text>
        </View>
      </ScrollView>

      {/* CTA */}
      <View style={styles.ctaWrap}>
        <TouchableOpacity onPress={() => navigation.navigate(Routes.CardPayment, params)} activeOpacity={0.9}>
          <LinearGradient colors={GRADIENT} style={styles.ctaBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.ctaBtnText}>Təsdiqlə</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
  headerTitle: { fontSize: 17, fontWeight: '600', color: Colors.primary },

  scroll: { padding: 20, gap: 14, paddingBottom: 100 },

  infoBanner: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 18, padding: 20,
    flexDirection: 'row', gap: 14, overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 20, elevation: 1,
  },
  infoBannerAccent: { width: 4, borderRadius: 2, backgroundColor: Colors.primary, alignSelf: 'stretch' },
  infoBannerText: { flex: 1, fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },

  methodCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 18, padding: 18,
    flexDirection: 'row', alignItems: 'center', gap: 16,
    borderWidth: 2, borderColor: 'transparent',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1,
  },
  methodCardActive: { borderColor: Colors.primaryFixed + '55' },
  methodIconBox: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  methodInfo: { flex: 1 },
  methodLabel: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  methodSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },

  summary: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    paddingTop: 20, borderTopWidth: 1, borderTopColor: Colors.borderLight, marginTop: 6,
  },
  summaryLabel: { fontSize: 9, fontWeight: '700', color: Colors.outline, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 4 },
  summaryAmount: { fontSize: 30, fontWeight: '800', color: Colors.textPrimary, lineHeight: 36 },
  summaryCurrency: { fontSize: 22, fontWeight: '600' },
  summaryFee: { fontSize: 12, color: Colors.textSecondary },

  ctaWrap: { padding: 20, paddingBottom: 32, backgroundColor: Colors.background },
  ctaBtn: {
    borderRadius: 999, height: 58, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 4,
  },
  ctaBtnText: { fontSize: 17, fontWeight: '800', color: '#fff' },
});
