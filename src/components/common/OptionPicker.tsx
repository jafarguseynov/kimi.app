import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../i18n';

interface Props {
  visible: boolean;
  title: string;
  options: string[];
  selected?: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  /** Axtarış sahəsi. Verilməsə siyahı 10-dan uzun olduqda avtomatik göstərilir. */
  searchable?: boolean;
  searchPlaceholder?: string;
}

/**
 * TƏK seçimli siyahı modalı.
 *
 * Niyə lazım oldu: bəzi ekranlar seçim üçün `Alert.alert(...)` işlədirdi. Alert
 * yalnız bir neçə düymə üçün nəzərdə tutulub — admin paneldəki 45 fənn kimi uzun
 * siyahılarda iOS-da düymələr ekrana sığmır və siyahının bir hissəsi ÜMUMİYYƏTLƏ
 * görünmür. Bu modal isə sürüşən, axtarışlı və istənilən uzunluqda işləyir.
 *
 * Çox seçim lazımdırsa `SubjectMultiPicker` işlədilir — bu onun tək seçimli qardaşıdır
 * və eyni vizual dili paylaşır.
 */
export default function OptionPicker({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
  searchable,
  searchPlaceholder,
}: Props) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  const showSearch = searchable ?? options.length > 10;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter((o) => o.toLowerCase().includes(q)) : options;
  }, [options, query]);

  const close = () => {
    setQuery('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent onRequestClose={close}>
      <SafeAreaProvider>
        <SafeAreaView style={styles.modal} edges={['top', 'bottom']}>
          <View style={styles.header}>
            <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
            <TouchableOpacity onPress={close} hitSlop={12} style={styles.headerBtn}>
              <Ionicons name="close" size={26} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {showSearch && (
            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color={Colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                value={query}
                onChangeText={setQuery}
                placeholder={searchPlaceholder ?? t('common.search')}
                placeholderTextColor={Colors.textMuted}
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}>
                  <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>
          )}

          <ScrollView contentContainerStyle={styles.list}>
            {filtered.map((o) => {
              const active = o === selected;
              return (
                <TouchableOpacity
                  key={o}
                  style={[styles.row, active && styles.rowActive]}
                  activeOpacity={0.7}
                  onPress={() => {
                    onSelect(o);
                    close();
                  }}
                >
                  <Text style={[styles.rowText, active && styles.rowTextActive]}>{o}</Text>
                  {active && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
                </TouchableOpacity>
              );
            })}
            {filtered.length === 0 && <Text style={styles.empty}>{t('common.noResults')}</Text>}
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '800', color: Colors.textPrimary },

  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    margin: 16, marginBottom: 8,
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  searchInput: { flex: 1, fontSize: 15, color: Colors.textPrimary, padding: 0 },

  list: { padding: 16, paddingTop: 8 },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, marginBottom: 8,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  rowActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight + '55' },
  rowText: { fontSize: 15, color: Colors.textPrimary, fontWeight: '500' },
  rowTextActive: { fontWeight: '700', color: Colors.primary },
  empty: { textAlign: 'center', color: Colors.textMuted, marginTop: 24, fontSize: 14 },
});
