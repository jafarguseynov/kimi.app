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
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { getLocations, LocationItem } from '../../api/location.api';

interface Crumb {
  id: string;
  name: string;
}

interface Props {
  value?: string; // seçilmiş ərazi (göstərmək üçün)
  onSelect: (result: { locationId: string; areaName: string }) => void;
}

export default function AreaPicker({ value, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [stack, setStack] = useState<Crumb[]>([]);
  const current = stack.length ? stack[stack.length - 1] : null;
  const parentId = current?.id;

  const { data: locations = [], isLoading } = useQuery({
    queryKey: ['locations', parentId ?? 'root'],
    queryFn: () => getLocations(parentId),
    enabled: open,
  });

  const drill = (loc: LocationItem) => setStack((s) => [...s, { id: loc.id, name: loc.name }]);
  const goTo = (index: number) => setStack((s) => s.slice(0, index + 1));
  const goRoot = () => setStack([]);

  const selectCurrent = () => {
    if (!current) return;
    const areaName = stack.map((s) => s.name).join(' / ');
    onSelect({ locationId: current.id, areaName });
    setOpen(false);
  };

  return (
    <>
      {/* Field */}
      <TouchableOpacity style={styles.field} activeOpacity={0.8} onPress={() => setOpen(true)}>
        <Ionicons name="location-outline" size={18} color={Colors.primary + '99'} />
        <Text style={[styles.fieldText, !value && styles.fieldPlaceholder]} numberOfLines={1}>
          {value || 'Fəaliyyət ərazini seç'}
        </Text>
        <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <SafeAreaView style={styles.modal} edges={['top', 'bottom']}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Ərazini seç</Text>
            <TouchableOpacity onPress={() => setOpen(false)} hitSlop={12}>
              <Ionicons name="close" size={26} color={Colors.textPrimary} />
            </TouchableOpacity>
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

          {isLoading ? (
            <View style={styles.center}>
              <ActivityIndicator color={Colors.primary} />
            </View>
          ) : (
            <ScrollView contentContainerStyle={{ padding: 16 }}>
              {locations.length === 0 ? (
                <View style={styles.center}>
                  <Ionicons name="map-outline" size={44} color={Colors.textLight} />
                  <Text style={styles.emptyText}>
                    {current ? 'Bu ərazinin alt bölgüsü yoxdur — bunu seçə bilərsən.' : 'Hələ ərazi əlavə edilməyib.'}
                  </Text>
                </View>
              ) : (
                locations.map((loc) => (
                  <TouchableOpacity key={loc.id} style={styles.row} activeOpacity={0.7} onPress={() => drill(loc)}>
                    <Ionicons name="location-outline" size={20} color={Colors.primary} />
                    <Text style={styles.rowText}>{loc.name}</Text>
                    <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          )}

          {/* Seç düyməsi — cari əraziyə */}
          <View style={styles.footer}>
            <TouchableOpacity
              activeOpacity={0.85}
              disabled={!current}
              onPress={selectCurrent}
              style={[styles.selectBtn, !current && { opacity: 0.45 }]}
            >
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.selectBtnText}>
                {current ? `"${current.name}" ərazisini seç` : 'Əvvəlcə ərazi seç'}
              </Text>
            </TouchableOpacity>
          </View>
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
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },

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

  center: { alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 48 },
  emptyText: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', paddingHorizontal: 24 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  rowText: { flex: 1, fontSize: 15, color: Colors.textPrimary, fontWeight: '500' },

  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  selectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 999,
    paddingVertical: 16,
  },
  selectBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
