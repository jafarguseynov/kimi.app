import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

export default function BookingRequestSentScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Status toast */}
      <View style={styles.toast}>
        <View style={styles.toastDot} />
        <Text style={styles.toastText}>Məlumatlar bazaya əlavə edildi</Text>
      </View>

      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Təsdiqləmə</Text>
        <View style={styles.headerBtn} />
      </View>

      <View style={styles.body}>
        {/* Success card */}
        <View style={styles.card}>
          <View style={styles.decorBlob} />
          <View style={styles.iconWrap}>
            <LinearGradient colors={GRADIENT} style={styles.iconCircle} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Ionicons name="checkmark-circle" size={60} color="#fff" />
            </LinearGradient>
          </View>
          <Text style={styles.cardTitle}>Sorğunuz uğurla göndərildi</Text>
          <Text style={styles.cardSubtitle}>
            Müəllim sorğunuzu nəzərdən keçirib tezliklə sizinlə əlaqə saxlayacaq. Siz həmçinin dərslərinizə sorğular bölməsindən nəzarət edə bilərsiniz.
          </Text>

          <View style={styles.cardActions}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => navigation.navigate('BookingHistory' as never)}
            >
              <LinearGradient colors={GRADIENT} style={styles.primaryBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.primaryBtnText}>Sorğulara bax</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => navigation.navigate('HomeMain' as never)}
              activeOpacity={0.85}
            >
              <Text style={styles.secondaryBtnText}>Ana səhifəyə qayıt</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notification info card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons name="notifications-outline" size={22} color={Colors.primary} />
          </View>
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>Bildirişləri aktiv et</Text>
            <Text style={styles.infoSub}>Müəllim cavab yazanda dərhal xəbər tut</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textLight} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  toast: {
    position: 'absolute', top: 72, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3,
    borderWidth: 1, borderColor: Colors.primary + '1A',
    zIndex: 10,
  },
  toastDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.tertiary },
  toastText: { fontSize: 12, fontWeight: '600', color: Colors.textPrimary },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: Colors.primary },

  body: { flex: 1, padding: 24, gap: 16, justifyContent: 'center' },

  card: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 24, padding: 32,
    alignItems: 'center', gap: 16, overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.06, shadowRadius: 40, elevation: 2,
  },
  decorBlob: {
    position: 'absolute', top: -48, right: -48,
    width: 128, height: 128, borderRadius: 64,
    backgroundColor: Colors.primaryFixed + '1A',
  },
  iconWrap: { marginBottom: 8 },
  iconCircle: {
    width: 128, height: 128, borderRadius: 64,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.25, shadowRadius: 32, elevation: 4,
  },
  cardTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center', letterSpacing: -0.3 },
  cardSubtitle: {
    fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22,
  },
  cardActions: { width: '100%', gap: 12, marginTop: 8 },
  primaryBtn: {
    height: 56, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 4,
  },
  primaryBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  secondaryBtn: {
    height: 56, borderRadius: 999,
    backgroundColor: Colors.surfaceHigh,
    alignItems: 'center', justifyContent: 'center',
  },
  secondaryBtnText: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },

  infoCard: {
    backgroundColor: Colors.surfaceLow, borderRadius: 20, padding: 18,
    flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  infoIcon: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.surfaceLowest,
    alignItems: 'center', justifyContent: 'center',
  },
  infoText: { flex: 1 },
  infoTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  infoSub: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
});
