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

interface Props {
  options: string[];
  selected: string[];
  onToggle: (name: string) => void;
  placeholder?: string;
  title?: string;
}

/**
 * Yığcam çoxseçim. Sahə yalnız seçilənləri göstərir — üzərinə vuranda
 * tam siyahı (axtarışla) modalda açılır. Çox yer tutmasın deyə.
 */
export default function SubjectMultiPicker({ options, selected, onToggle, placeholder, title }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  // Seçilənlər siyahıda olmasa belə göstərilsin.
  const all = useMemo(() => Array.from(new Set([...options, ...selected])), [options, selected]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? all.filter((s) => s.toLowerCase().includes(q)) : all;
  }, [all, query]);

  return (
    <>
      {/* Yığcam sahə */}
      <TouchableOpacity style={styles.field} activeOpacity={0.8} onPress={() => setOpen(true)}>
        {selected.length === 0 ? (
          <Text style={styles.placeholder}>{placeholder || 'Fən seç'}</Text>
        ) : (
          <View style={styles.selectedWrap}>
            {selected.map((s) => (
              <View key={s} style={styles.miniChip}>
                <Text style={styles.miniChipText}>{s}</Text>
              </View>
            ))}
          </View>
        )}
        <View style={styles.addPill}>
          <Ionicons name="add" size={16} color={Colors.primary} />
          <Text style={styles.addPillText}>Seç</Text>
        </View>
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={open} animationType="slide" statusBarTranslucent onRequestClose={() => setOpen(false)}>
        <SafeAreaProvider>
        <SafeAreaView style={styles.modal} edges={['top', 'bottom']}>
          <View style={styles.header}>
            <Text style={styles.headerTitle} numberOfLines={1}>{title || 'Fən seç'}</Text>
            <TouchableOpacity onPress={() => setOpen(false)} hitSlop={12} style={styles.headerBtn}>
              <Ionicons name="checkmark" size={26} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Axtarış */}
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color={Colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Fən axtar..."
              placeholderTextColor={Colors.textMuted}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {selected.length > 0 && (
            <Text style={styles.countLabel}>{selected.length} fən seçilib</Text>
          )}

          <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 4 }}>
            {filtered.map((s) => {
              const active = selected.includes(s);
              return (
                <TouchableOpacity key={s} style={[styles.row, active && styles.rowActive]} activeOpacity={0.7} onPress={() => onToggle(s)}>
                  <Text style={[styles.rowText, active && styles.rowTextActive]}>{s}</Text>
                  <Ionicons
                    name={active ? 'checkmark-circle' : 'ellipse-outline'}
                    size={22}
                    color={active ? Colors.primary : Colors.textLight}
                  />
                </TouchableOpacity>
              );
            })}
            {filtered.length === 0 && (
              <Text style={styles.empty}>Nəticə tapılmadı</Text>
            )}
          </ScrollView>
        </SafeAreaView>
        </SafeAreaProvider>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  placeholder: { flex: 1, fontSize: 15, color: Colors.textMuted },
  selectedWrap: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  miniChip: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  miniChipText: { fontSize: 12, fontWeight: '600', color: Colors.primary },
  addPill: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    backgroundColor: Colors.primaryLight,
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6,
  },
  addPillText: { fontSize: 13, fontWeight: '700', color: Colors.primary },

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
  countLabel: { fontSize: 12, fontWeight: '600', color: Colors.textMuted, paddingHorizontal: 18 },

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
