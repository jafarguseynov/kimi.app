import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, typeof Routes.DeleteAccountConfirm>;
};

export default function DeleteAccountConfirmScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hesabın İdarə Edilməsi</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.content}>
        {/* Robot icon box with warning badge */}
        <View style={styles.mascotWrap}>
          <View style={styles.ambientGlow} />
          <View style={styles.mascotBox}>
            <Ionicons name="hardware-chip-outline" size={72} color={Colors.primary} />
          </View>
          <View style={styles.warningBadge}>
            <Ionicons name="warning" size={22} color="#fff" />
          </View>
        </View>

        {/* Text */}
        <View style={styles.textBlock}>
          <Text style={styles.title}>Hesabı silmək istədiyinizə əminsiniz?</Text>
          <Text style={styles.subtitle}>
            Bu əməliyyatdan sonra bütün məlumatlar, qazanılmış{' '}
            <Text style={styles.highlight}>XP</Text> və{' '}
            <Text style={styles.highlight}>sertifikatlar</Text> geri qaytarılmaya bilər.
          </Text>
        </View>

        {/* Data loss grid */}
        <View style={styles.lossGrid}>
          <View style={styles.lossCard}>
            <Ionicons name="ribbon-outline" size={26} color={Colors.textSecondary} />
            <Text style={styles.lossLabel}>Sertifikatlar</Text>
          </View>
          <View style={styles.lossCard}>
            <Ionicons name="trending-up-outline" size={26} color={Colors.textSecondary} />
            <Text style={styles.lossLabel}>XP Səviyyəsi</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.deleteBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate(Routes.AccountDeactivated)}
          >
            <Text style={styles.deleteBtnText}>Hesabı sil</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backBtnAction} activeOpacity={0.7} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>Geri qayıt</Text>
          </TouchableOpacity>
        </View>
      </View>
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

  content: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 32, gap: 28,
  },

  mascotWrap: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  ambientGlow: {
    position: 'absolute',
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: Colors.primaryFixed + '33',
  },
  mascotBox: {
    width: 192, height: 192, borderRadius: 24,
    backgroundColor: Colors.surfaceLowest,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.06, shadowRadius: 40, elevation: 4,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  warningBadge: {
    position: 'absolute', bottom: -14, right: -14,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.error,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 4, borderColor: Colors.background,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
  },

  textBlock: { alignItems: 'center', gap: 10, maxWidth: 300 },
  title: {
    fontSize: 22, fontWeight: '800', color: Colors.textPrimary,
    textAlign: 'center', lineHeight: 30,
  },
  subtitle: { fontSize: 16, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24 },
  highlight: { fontWeight: '600', color: Colors.primary },

  lossGrid: { flexDirection: 'row', gap: 12, width: '100%' },
  lossCard: {
    flex: 1, backgroundColor: Colors.surfaceLow,
    borderRadius: 16, padding: 16,
    alignItems: 'center', gap: 8,
  },
  lossLabel: { fontSize: 12, fontWeight: '500', color: Colors.textSecondary },

  actions: { width: '80%', gap: 12 },
  deleteBtn: {
    borderRadius: 999, paddingVertical: 16, alignItems: 'center',
    backgroundColor: Colors.errorContainer,
    shadowColor: Colors.errorContainer, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 4,
  },
  deleteBtnText: { fontSize: 16, fontWeight: '700', color: Colors.error },
  backBtnAction: {
    borderRadius: 999, paddingVertical: 16, alignItems: 'center',
    borderWidth: 2, borderColor: Colors.surfaceHigh,
  },
  backBtnText: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
});
