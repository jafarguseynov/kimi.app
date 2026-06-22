import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../constants/colors';
import { useSettingsStore, AppLanguage } from '../store/settings.store';
import { useTranslation } from '../i18n';

type LangOption = { code: AppLanguage; label: string; flag: string };
export const LANGUAGES: LangOption[] = [
  { code: 'az', label: 'Azərbaycan dili', flag: '🇦🇿' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
];

const flagFor = (code: AppLanguage) => LANGUAGES.find((l) => l.code === code)?.flag ?? '🌐';

/**
 * Home header-i üçün kompakt bayraq düyməsi — tıklayınca aşağıdan dil seçimi açılır.
 * Dil dərhal dəyişir (useSettingsStore + i18n), reload lazım deyil.
 */
export function LanguageFlagButton() {
  const { language } = useSettingsStore();
  const [open, setOpen] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={styles.flagBtn}
        activeOpacity={0.7}
        onPress={() => setOpen(true)}
        accessibilityLabel="Dil / Language"
      >
        <Text style={styles.flagBtnText}>{flagFor(language)}</Text>
      </TouchableOpacity>
      <LanguageSheet visible={open} onClose={() => setOpen(false)} />
    </>
  );
}

/** Aşağıdan açılan dil seçim vərəqi (3 dil). */
export function LanguageSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { language, setLanguage } = useSettingsStore();
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>{t('language.title')}</Text>
          <View style={styles.sheetList}>
            {LANGUAGES.map((lang) => {
              const active = language === lang.code;
              return (
                <TouchableOpacity
                  key={lang.code}
                  style={[styles.sheetRow, active && styles.sheetRowActive]}
                  activeOpacity={0.7}
                  onPress={() => {
                    setLanguage(lang.code);
                    onClose();
                  }}
                >
                  <Text style={styles.sheetFlag}>{lang.flag}</Text>
                  <Text style={[styles.sheetLabel, active && styles.sheetLabelActive]}>{lang.label}</Text>
                  {active && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/**
 * İnline bayraq çipləri — Profil ekranı üçün (Settings-ə girmədən birbaşa dəyiş).
 */
export function LanguageChips() {
  const { language, setLanguage } = useSettingsStore();

  return (
    <View style={styles.chipRow}>
      {LANGUAGES.map((lang) => {
        const active = language === lang.code;
        return (
          <TouchableOpacity
            key={lang.code}
            style={[styles.chip, active && styles.chipActive]}
            activeOpacity={0.8}
            onPress={() => setLanguage(lang.code)}
          >
            <Text style={styles.chipFlag}>{lang.flag}</Text>
            <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{lang.code.toUpperCase()}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  // flag button (header)
  flagBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surfaceLow,
  },
  flagBtnText: { fontSize: 20 },

  // bottom sheet
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.surfaceLowest,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 32,
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.borderLight, alignSelf: 'center', marginBottom: 14 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary, marginBottom: 14 },
  sheetList: { gap: 10 },
  sheetRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 16, paddingVertical: 14,
    borderRadius: 14, borderWidth: 1, borderColor: Colors.borderLight,
    backgroundColor: Colors.surfaceLow,
  },
  sheetRowActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '12' },
  sheetFlag: { fontSize: 26 },
  sheetLabel: { flex: 1, fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  sheetLabelActive: { color: Colors.primary, fontWeight: '700' },

  // inline chips (profile)
  chipRow: { flexDirection: 'row', gap: 8 },
  chip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.borderLight, backgroundColor: Colors.surfaceLow,
  },
  chipActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '12' },
  chipFlag: { fontSize: 18 },
  chipLabel: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary },
  chipLabelActive: { color: Colors.primary },
});
