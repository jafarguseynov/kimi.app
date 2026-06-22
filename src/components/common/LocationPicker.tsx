import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { getLocations, LocationItem } from '../../api/location.api';

interface Crumb {
  id: string;
  name: string;
}

interface Props {
  value?: string; // hazırkı seçilmiş ərazi (göstərmək üçün)
  placeholder?: string;
  onSelect: (result: { name: string; id: string; path: string }) => void;
}

/**
 * Ərazi (şəhər/rayon/kənd) seçici. Sıra adına klik → dərinə keç,
 * yanındakı ✓ düyməsi → o ərazini seç. İstənilən səviyyədə seçmək olar.
 */
export default function LocationPicker({ value, placeholder, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const [stack, setStack] = useState<Crumb[]>([]);
  const current = stack.length ? stack[stack.length - 1] : null;
  const parentId = current?.id;

  const { data: locations = [], isLoading } = useQuery({
    queryKey: ['locations', parentId ?? 'root'],
    queryFn: () => getLocations(parentId),
    enabled: open,
  });

  const reset = () => setStack([]);
  const drill = (loc: LocationItem) => setStack((s) => [...s, { id: loc.id, name: loc.name }]);
  const goTo = (index: number) => setStack((s) => s.slice(0, index + 1));
  const goRoot = () => setStack([]);
  // Geri: bir səviyyə yuxarı qalx; kökdəyiksə modalı bağla.
  const goBack = () => {
    if (stack.length) setStack((s) => s.slice(0, -1));
    else setOpen(false);
  };

  const pick = (name: string, id: string) => {
    const path = [...stack.map((s) => s.name), name].join(', ');
    onSelect({ name, id, path });
    setOpen(false);
    reset();
  };

  const pickCurrent = () => {
    if (!current) return;
    onSelect({ name: current.name, id: current.id, path: stack.map((s) => s.name).join(', ') });
    setOpen(false);
    reset();
  };

  const empty = !isLoading && locations.length === 0;

  return (
    <>
      {/* Field */}
      <TouchableOpacity style={styles.field} activeOpacity={0.8} onPress={() => setOpen(true)}>
        <Ionicons name="location-outline" size={18} color={Colors.primary + '99'} />
        <Text style={[styles.fieldText, !value && styles.fieldPlaceholder]} numberOfLines={1}>
          {value || placeholder || 'Şəhər / ərazi seç'}
        </Text>
        <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={open} animationType="slide" statusBarTranslucent onRequestClose={() => setOpen(false)}>
        <SafeAreaView style={styles.modal} edges={['bottom']}>
          {/* Header — tək sol düymə (dərindəyiksə geri, kökdə bağla) */}
          <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
            <TouchableOpacity onPress={goBack} hitSlop={12} style={styles.headerBtn}>
              <Ionicons name={current ? 'arrow-back' : 'close'} size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {current ? current.name : 'Şəhər / ərazi seç'}
            </Text>
            <View style={styles.headerBtn} />
          </View>

          {/* Breadcrumb */}
          <View style={styles.crumbs}>
            <TouchableOpacity onPress={goRoot}>
              <Text style={[styles.crumb, !current && styles.crumbActive]}>Bütün ərazilər</Text>
            </TouchableOpacity>
            {stack.map((c, i) => (
              <View key={c.id} style={styles.crumbItem}>
                <Ionicons name="chevron-forward" size={13} color={Colors.textMuted} />
                <TouchableOpacity onPress={() => goTo(i)}>
                  <Text style={[styles.crumb, i === stack.length - 1 && styles.crumbActive]} numberOfLines={1}>
                    {c.name}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* "Bu ərazini seç" — daxil olduğumuz səviyyəni seçmək üçün */}
          {current && (
            <TouchableOpacity style={styles.pickCurrent} activeOpacity={0.8} onPress={pickCurrent}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.tertiary} />
              <Text style={styles.pickCurrentText}>«{current.name}» ərazisini seç</Text>
            </TouchableOpacity>
          )}

          {isLoading ? (
            <View style={styles.center}>
              <ActivityIndicator color={Colors.primary} />
            </View>
          ) : empty ? (
            <View style={styles.center}>
              <Ionicons name="map-outline" size={48} color={Colors.textLight} />
              <Text style={styles.emptyText}>
                {current ? 'Bu ərazidə alt bölmə yoxdur — yuxarıdan seç.' : 'Hələ ərazi əlavə edilməyib.'}
              </Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={{ padding: 16 }}>
              <Text style={styles.sectionLabel}>ƏRAZİLƏR</Text>
              {locations.map((loc) => (
                <View key={loc.id} style={styles.row}>
                  <TouchableOpacity style={styles.rowMain} activeOpacity={0.7} onPress={() => drill(loc)}>
                    <Ionicons name="location-outline" size={20} color={Colors.primary} />
                    <Text style={styles.rowText}>{loc.name}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.selectBtn} activeOpacity={0.7} onPress={() => pick(loc.name, loc.id)} hitSlop={6}>
                    <Ionicons name="checkmark-circle-outline" size={22} color={Colors.tertiary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => drill(loc)} hitSlop={6}>
                    <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </SafeAreaView>
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
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  fieldText: { flex: 1, fontSize: 15, color: Colors.textPrimary, fontWeight: '500' },
  fieldPlaceholder: { color: Colors.textMuted, fontWeight: '400' },

  modal: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '800', color: Colors.textPrimary, marginHorizontal: 4 },

  crumbs: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 2,
  },
  crumbItem: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  crumb: { fontSize: 13, color: Colors.primary, fontWeight: '600', maxWidth: 140 },
  crumbActive: { color: Colors.textPrimary },

  pickCurrent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.tertiary + '14',
    borderWidth: 1,
    borderColor: Colors.tertiary + '33',
  },
  pickCurrentText: { fontSize: 14, fontWeight: '700', color: Colors.tertiary },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  emptyText: { fontSize: 14, color: Colors.textMuted, textAlign: 'center' },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 1,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  rowMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowText: { flex: 1, fontSize: 15, color: Colors.textPrimary, fontWeight: '500' },
  selectBtn: { padding: 2 },
});
