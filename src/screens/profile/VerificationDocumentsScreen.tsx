import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type DocStatus = 'empty' | 'uploaded' | 'missing';

type DocItem = {
  id: string;
  icon: string;
  title: string;
  optional?: boolean;
  status: DocStatus;
};

const DOCS: DocItem[] = [
  { id: '1', icon: 'card-outline', title: 'Şəxsiyyət vəsiqəsi', status: 'missing' },
  { id: '2', icon: 'school-outline', title: 'Diplom / sertifikat', status: 'missing' },
  { id: '3', icon: 'document-outline', title: 'Digər sənəd', optional: true, status: 'empty' },
];

export default function VerificationDocumentsScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sənədlərin Təsdiqi</Text>
        <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7}>
          <Ionicons name="help-circle-outline" size={22} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Welcome card */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeText}>
            <Text style={styles.welcomeTitle}>Salam, Müəllim!</Text>
            <Text style={styles.welcomeSub}>Sənədlərinizi yükləyərək profilinizi rəsmiləşdirin.</Text>
          </View>
          <View style={styles.welcomeIcon}>
            <LinearGradient colors={GRADIENT} style={styles.welcomeIconBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Ionicons name="hardware-chip-outline" size={36} color="#fff" />
            </LinearGradient>
          </View>
        </View>

        {/* Document items */}
        <View style={styles.docList}>
          {DOCS.map((doc) => (
            <View key={doc.id} style={styles.docItem}>
              <View style={[styles.docIconWrap, doc.status === 'empty' && styles.docIconWrapGray]}>
                <Ionicons
                  name={doc.icon as any}
                  size={24}
                  color={doc.status === 'empty' ? Colors.textMuted : Colors.primary}
                />
              </View>
              <View style={styles.docInfo}>
                <View style={styles.docTitleRow}>
                  <Text style={styles.docTitle}>{doc.title}</Text>
                  {doc.optional && <Text style={styles.docOptional}>(isteğe bağlı)</Text>}
                </View>
                <View style={styles.docMeta}>
                  <View style={styles.formatChip}>
                    <Text style={styles.formatText}>JPG, PDF</Text>
                  </View>
                  <View style={styles.statusRow}>
                    <View style={[
                      styles.statusDot,
                      doc.status === 'missing' && styles.statusDotDanger,
                      doc.status === 'uploaded' && styles.statusDotSuccess,
                      doc.status === 'empty' && styles.statusDotNeutral,
                    ]} />
                    <Text style={[
                      styles.statusText,
                      doc.status === 'missing' && styles.statusTextDanger,
                      doc.status === 'uploaded' && styles.statusTextSuccess,
                      doc.status === 'empty' && styles.statusTextNeutral,
                    ]}>
                      {doc.status === 'missing' ? 'Yüklənməyib' : doc.status === 'uploaded' ? 'Yükləndi' : 'Boş'}
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.uploadBtn, doc.status === 'empty' && styles.uploadBtnNeutral]}
                activeOpacity={0.8}
              >
                <Text style={[styles.uploadBtnText, doc.status === 'empty' && styles.uploadBtnTextNeutral]}>
                  Yüklə
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          Təsdiqə göndərməklə siz{' '}
          <Text style={styles.disclaimerLink}>istifadə şərtlərini</Text>
          {' '}və məlumatlarınızın emal olunmasını qəbul edirsiniz.
        </Text>

        {/* Submit button */}
        <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate(Routes.VerificationPending)}>
          <LinearGradient colors={GRADIENT} style={styles.submitBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.submitBtnText}>Təsdiqə göndər</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },

  scroll: { padding: 20, gap: 16, paddingBottom: 40 },

  welcomeCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.06, shadowRadius: 30, elevation: 2,
    overflow: 'hidden',
  },
  welcomeText: { flex: 1, gap: 4 },
  welcomeTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  welcomeSub: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  welcomeIcon: { marginLeft: 12 },
  welcomeIconBox: { width: 72, height: 72, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },

  docList: { gap: 12 },
  docItem: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1,
  },
  docIconWrap: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  docIconWrapGray: { backgroundColor: Colors.surfaceLow },
  docInfo: { flex: 1, gap: 6 },
  docTitleRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  docTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  docOptional: { fontSize: 10, color: Colors.textMuted },
  docMeta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  formatChip: {
    backgroundColor: Colors.surfaceLow, borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  formatText: { fontSize: 10, fontWeight: '700', color: Colors.textMuted },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusDotDanger: { backgroundColor: Colors.danger },
  statusDotSuccess: { backgroundColor: Colors.tertiary },
  statusDotNeutral: { backgroundColor: Colors.borderLight },
  statusText: { fontSize: 11, fontWeight: '600' },
  statusTextDanger: { color: Colors.danger },
  statusTextSuccess: { color: Colors.tertiary },
  statusTextNeutral: { color: Colors.textMuted },
  uploadBtn: {
    paddingHorizontal: 16, height: 40, borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  uploadBtnNeutral: { backgroundColor: Colors.surfaceLow },
  uploadBtnText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  uploadBtnTextNeutral: { color: Colors.textSecondary },

  disclaimer: {
    fontSize: 11, color: Colors.textMuted, textAlign: 'center',
    paddingHorizontal: 24, lineHeight: 17,
  },
  disclaimerLink: { color: Colors.primary, textDecorationLine: 'underline' },

  submitBtn: {
    height: 60, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 4,
  },
  submitBtnText: { fontSize: 17, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
});
