import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { useUserStore } from '../../store/user.store';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type Method = 'sms' | 'email' | 'app';

export default function TwoFactorScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { user } = useUserStore();
  const [enabled, setEnabled] = useState(false);
  const [method, setMethod] = useState<Method>('sms');

  const handleToggle = (v: boolean) => {
    setEnabled(v);
    if (v) {
      Alert.alert('İki-faktorlu təsdiq', 'Bu funksiya tezliklə real SMS/email göndərmə inteqrasiyası ilə tam aktiv olacaq.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>İki-faktorlu təsdiq</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <LinearGradient colors={GRADIENT} style={styles.heroCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Ionicons name="shield-checkmark" size={36} color="#fff" />
          <Text style={styles.heroTitle}>Hesabını qoru</Text>
          <Text style={styles.heroSub}>
            İki-faktorlu təsdiq hesabınıza əlavə təhlükəsizlik təbəqəsi əlavə edir.
          </Text>
        </LinearGradient>

        <View style={styles.toggleCard}>
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleTitle}>2FA aktivdir</Text>
              <Text style={styles.toggleSub}>
                {enabled ? 'Hesabınız mühafizə olunur' : 'Aktivləşdirin və hesabınızı qoruyun'}
              </Text>
            </View>
            <Switch
              value={enabled}
              onValueChange={handleToggle}
              trackColor={{ false: Colors.surfaceContainer, true: Colors.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {enabled && (
          <View style={styles.methodSection}>
            <Text style={styles.sectionLabel}>Təsdiq üsulu</Text>
            <View style={styles.card}>
              {(['sms', 'email', 'app'] as Method[]).map((m, i) => {
                const labels = { sms: ['SMS', user?.phone ?? '+994'], email: ['Email', user?.email ?? '—'], app: ['Authenticator app', 'Google / Authy / 1Password'] };
                const icons = { sms: 'chatbubble-outline', email: 'mail-outline', app: 'key-outline' } as const;
                const active = method === m;
                return (
                  <TouchableOpacity
                    key={m}
                    style={[styles.row, i < 2 && styles.rowDivider]}
                    activeOpacity={0.7}
                    onPress={() => setMethod(m)}
                  >
                    <View style={styles.iconBox}>
                      <Ionicons name={icons[m]} size={20} color={Colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowTitle}>{labels[m][0]}</Text>
                      <Text style={styles.rowSub}>{labels[m][1]}</Text>
                    </View>
                    {active ? (
                      <Ionicons name="radio-button-on" size={22} color={Colors.primary} />
                    ) : (
                      <Ionicons name="radio-button-off" size={22} color={Colors.outlineVariant} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <Text style={styles.note}>
          Qeyd: 2FA-nın tam funksional işləməsi üçün SMS gateway və email servis inteqrasiyası tələb olunur. Demo olaraq seçimlər saxlanılır.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surfaceLow },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  scroll: { padding: 20, gap: 18 },

  heroCard: { borderRadius: 22, padding: 24, alignItems: 'center', gap: 10 },
  heroTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.9)', textAlign: 'center', lineHeight: 19 },

  toggleCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 18, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1,
  },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  toggleTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  toggleSub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },

  methodSection: { gap: 10 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, paddingHorizontal: 4 },
  card: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 18, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 14 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  rowSub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },

  note: { fontSize: 12, color: Colors.textMuted, textAlign: 'center', lineHeight: 18, paddingHorizontal: 12 },
});
