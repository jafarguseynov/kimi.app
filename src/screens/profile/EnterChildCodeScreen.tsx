import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

export default function EnterChildCodeScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [studentId, setStudentId] = useState('');
  const [focused, setFocused] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('enterChildCode.headerTitle')}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Icon + heading */}
        <View style={styles.iconBox}>
          <Ionicons name="link" size={32} color={Colors.primary} />
        </View>
        <Text style={styles.title}>{t('enterChildCode.title')}</Text>
        <Text style={styles.subtitle}>
          {t('enterChildCode.subtitle')}
        </Text>

        {/* Input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>{t('enterChildCode.inputLabel')}</Text>
          <View style={[styles.inputWrap, focused && styles.inputWrapFocused]}>
            <Ionicons
              name="card-outline"
              size={22}
              color={focused ? Colors.primary : Colors.outlineVariant}
              style={{ marginRight: 8 }}
            />
            <TextInput
              style={styles.input}
              value={studentId}
              onChangeText={setStudentId}
              placeholder={t('enterChildCode.placeholder')}
              placeholderTextColor={Colors.outlineVariant}
              autoCapitalize="characters"
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
          </View>
        </View>

        {/* CTA */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate(Routes.ConnectionPending)}
          disabled={studentId.trim().length === 0}
        >
          <LinearGradient
            colors={studentId.trim().length === 0 ? [Colors.surfaceHigh, Colors.surfaceHigh] : GRADIENT}
            style={styles.primaryBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.primaryBtnText}>{t('enterChildCode.connect')}</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Info */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color={Colors.primary} style={{ marginTop: 1 }} />
          <Text style={styles.infoText}>
            {t('enterChildCode.infoText')}
          </Text>
        </View>

        {/* Feature cards */}
        <View style={styles.featureRow}>
          <View style={[styles.featureCard, { borderBottomColor: Colors.primaryFixed + '40' }]}>
            <Ionicons name="analytics" size={22} color={Colors.primary} />
            <Text style={styles.featureLabel}>{t('enterChildCode.featureProgress')}</Text>
            <Text style={styles.featureSub}>{t('enterChildCode.featureProgressSub')}</Text>
          </View>
          <View style={[styles.featureCard, { borderBottomColor: Colors.tertiaryContainer }]}>
            <Ionicons name="shield-checkmark" size={22} color={Colors.tertiary} />
            <Text style={styles.featureLabel}>{t('enterChildCode.featureSecure')}</Text>
            <Text style={styles.featureSub}>{t('enterChildCode.featureSecureSub')}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },

  scroll: { padding: 24, gap: 20, paddingBottom: 40 },

  iconBox: {
    width: 72, height: 72, borderRadius: 18,
    backgroundColor: Colors.primaryFixed + '22',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  title: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22, marginBottom: 12 },

  inputSection: { gap: 10 },
  inputLabel: {
    fontSize: 13, fontWeight: '600', color: Colors.textSecondary,
    marginLeft: 4,
  },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 16, paddingHorizontal: 16, height: 60,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1,
    borderWidth: 2, borderColor: 'transparent',
  },
  inputWrapFocused: { borderColor: Colors.primaryFixed + '40' },
  input: {
    flex: 1,
    fontSize: 17, fontWeight: '500', color: Colors.textPrimary,
  },

  primaryBtn: {
    height: 60, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 4,
  },
  primaryBtnText: { fontSize: 17, fontWeight: '800', color: '#fff' },

  infoCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: Colors.surfaceLow,
    borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  infoText: { flex: 1, fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },

  featureRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  featureCard: {
    flex: 1, alignItems: 'center', gap: 6,
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 16, paddingVertical: 22,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12, elevation: 1,
    borderBottomWidth: 4,
  },
  featureLabel: { fontSize: 11, fontWeight: '800', color: Colors.textPrimary, letterSpacing: 1.2 },
  featureSub: { fontSize: 10, color: Colors.textSecondary, textAlign: 'center' },
});
