import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, typeof Routes.AccountManagement>;
};

export default function AccountManagementScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hesabın İdarə Edilməsi</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Tip card with mascot icon peeking top-right */}
        <View style={styles.tipCardWrap}>
          <View style={styles.mascotBubble}>
            <Ionicons name="hardware-chip-outline" size={36} color={Colors.primary} />
          </View>
          <View style={styles.tipCard}>
            <View style={styles.tipBadge}>
              <Text style={styles.tipBadgeText}>KİMİ-NİN MƏSLƏHƏTİ</Text>
            </View>
            <Text style={styles.tipTitle}>Məlumatlarınızı qoruyun</Text>
            <Text style={styles.tipBody}>
              Hesabı <Text style={styles.tipHighlight}>deaktiv etdikdə</Text> məlumatlarınız saxlanılır, lakin profiliniz gizlədilir.{' '}
              <Text style={styles.tipHighlightDanger}>Sildikdə</Text> isə bütün tərəqqiniz və sertifikatlarınız həmişəlik itirilir.
            </Text>
          </View>
        </View>

        {/* Deactivate card */}
        <TouchableOpacity
          style={styles.actionCard}
          activeOpacity={0.85}
          onPress={() => navigation.navigate(Routes.DeactivateReason)}
        >
          <View style={[styles.actionIconBox, { backgroundColor: Colors.primaryFixed + '1A' }]}>
            <Ionicons name="eye-off-outline" size={28} color={Colors.primary} />
          </View>
          <View style={styles.actionText}>
            <Text style={styles.actionTitle}>Hesabı deaktiv et</Text>
            <Text style={styles.actionSub}>
              Fəaliyyətinizi müvəqqəti dayandırın. İstənilən vaxt geri qayıda bilərsiniz.
            </Text>
          </View>
          <View style={styles.actionCTA}>
            <Text style={[styles.actionCTAText, { color: Colors.primary }]}>İndi deaktiv et</Text>
            <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
          </View>
        </TouchableOpacity>

        {/* Delete card */}
        <TouchableOpacity
          style={styles.actionCard}
          activeOpacity={0.85}
          onPress={() => navigation.navigate(Routes.DeleteAccountConfirm)}
        >
          <View style={[styles.actionIconBox, { backgroundColor: Colors.errorContainer + '1A' }]}>
            <Ionicons name="trash-outline" size={28} color={Colors.error} />
          </View>
          <View style={styles.actionText}>
            <Text style={styles.actionTitle}>Hesabı sil</Text>
            <Text style={styles.actionSub}>
              Bütün kurs tarixçənizi və şəxsi məlumatlarınızı sistemdən tamamilə təmizləyin.
            </Text>
          </View>
          <View style={styles.actionCTA}>
            <Text style={[styles.actionCTAText, { color: Colors.error }]}>Həmişəlik sil</Text>
            <Ionicons name="chevron-forward" size={14} color={Colors.error} />
          </View>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerLabel}>Yardıma ehtiyacınız var?</Text>
          <TouchableOpacity style={styles.supportBtn} activeOpacity={0.7}>
            <Ionicons name="headset-outline" size={18} color={Colors.textPrimary} />
            <Text style={styles.supportBtnText}>Dəstək ilə əlaqə</Text>
          </TouchableOpacity>
        </View>
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
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surfaceLow,
  },
  headerTitle: { fontSize: 17, fontWeight: '600', color: Colors.primary },

  scroll: { padding: 20, gap: 16, paddingBottom: 48 },

  tipCardWrap: { marginTop: 24, position: 'relative' },
  mascotBubble: {
    position: 'absolute', top: -24, right: 16, zIndex: 10,
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: Colors.surfaceLow,
    borderWidth: 3, borderColor: Colors.surfaceLowest,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3,
  },
  tipCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 20,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 2,
    borderWidth: 1, borderColor: Colors.borderLight, gap: 8,
    paddingRight: 70,
  },
  tipBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryFixed + '33',
    borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4,
  },
  tipBadgeText: { fontSize: 9, fontWeight: '700', color: Colors.primary, letterSpacing: 1 },
  tipTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  tipBody: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  tipHighlight: { fontWeight: '600', color: Colors.primary },
  tipHighlightDanger: { fontWeight: '600', color: Colors.error },

  actionCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 24, gap: 12,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 20, elevation: 2,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  actionIconBox: {
    width: 56, height: 56, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  actionText: { gap: 4 },
  actionTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  actionSub: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  actionCTA: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionCTAText: { fontSize: 13, fontWeight: '600' },

  footer: { alignItems: 'center', gap: 12, paddingTop: 8 },
  footerLabel: { fontSize: 13, color: Colors.textMuted },
  supportBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 20, paddingVertical: 12,
    backgroundColor: Colors.surfaceHigh, borderRadius: 99,
  },
  supportBtnText: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
});
