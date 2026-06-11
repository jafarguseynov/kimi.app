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
import { getLocations, getSchoolsAt, LocationItem, SchoolItem } from '../../api/location.api';

interface Crumb {
  id: string;
  name: string;
}

interface Props {
  value?: string; // hazırkı seçilmiş məktəb (göstərmək üçün)
  onSelect: (result: { schoolName: string; schoolId: string; path: string }) => void;
}

export default function LocationSchoolPicker({ value, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [stack, setStack] = useState<Crumb[]>([]);
  const current = stack.length ? stack[stack.length - 1] : null;
  const parentId = current?.id;

  const { data: locations = [], isLoading: locLoading } = useQuery({
    queryKey: ['locations', parentId ?? 'root'],
    queryFn: () => getLocations(parentId),
    enabled: open,
  });

  const { data: schools = [], isLoading: schoolLoading } = useQuery({
    queryKey: ['schools-at', parentId],
    queryFn: () => getSchoolsAt(parentId as string),
    enabled: open && !!parentId,
  });

  const reset = () => setStack([]);

  const drill = (loc: LocationItem) => setStack((s) => [...s, { id: loc.id, name: loc.name }]);
  const goTo = (index: number) => setStack((s) => s.slice(0, index + 1));
  const goRoot = () => setStack([]);

  const pickSchool = (school: SchoolItem) => {
    const path = [...stack.map((s) => s.name), school.name].join(' / ');
    onSelect({ schoolName: school.name, schoolId: school.id, path });
    setOpen(false);
    reset();
  };

  const loading = locLoading || (!!parentId && schoolLoading);
  const empty = !loading && locations.length === 0 && schools.length === 0;

  return (
    <>
      {/* Field */}
      <TouchableOpacity style={styles.field} activeOpacity={0.8} onPress={() => setOpen(true)}>
        <Ionicons name="school-outline" size={18} color={Colors.primary + '99'} />
        <Text style={[styles.fieldText, !value && styles.fieldPlaceholder]} numberOfLines={1}>
          {value || 'Ərazi və məktəbini seç'}
        </Text>
        <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <SafeAreaView style={styles.modal} edges={['top', 'bottom']}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Məktəbini seç</Text>
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

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator color={Colors.primary} />
            </View>
          ) : empty ? (
            <View style={styles.center}>
              <Ionicons name="map-outline" size={48} color={Colors.textLight} />
              <Text style={styles.emptyText}>
                {current ? 'Bu ərazidə hələ məlumat yoxdur.' : 'Hələ ərazi əlavə edilməyib.'}
              </Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={{ padding: 16 }}>
              {/* Alt ərazilər */}
              {locations.length > 0 && (
                <>
                  <Text style={styles.sectionLabel}>ƏRAZİLƏR</Text>
                  {locations.map((loc) => (
                    <TouchableOpacity key={loc.id} style={styles.row} activeOpacity={0.7} onPress={() => drill(loc)}>
                      <Ionicons name="location-outline" size={20} color={Colors.primary} />
                      <Text style={styles.rowText}>{loc.name}</Text>
                      <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                    </TouchableOpacity>
                  ))}
                </>
              )}

              {/* Bu ərazidəki məktəblər */}
              {schools.length > 0 && (
                <>
                  <Text style={[styles.sectionLabel, { marginTop: locations.length ? 20 : 0 }]}>MƏKTƏBLƏR</Text>
                  {schools.map((s) => (
                    <TouchableOpacity key={s.id} style={styles.rowSchool} activeOpacity={0.7} onPress={() => pickSchool(s)}>
                      <View style={styles.schoolIcon}>
                        <Ionicons name="school" size={18} color="#fff" />
                      </View>
                      <Text style={styles.rowText}>{s.name}</Text>
                      <Ionicons name="checkmark-circle-outline" size={20} color={Colors.tertiary} />
                    </TouchableOpacity>
                  ))}
                </>
              )}
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
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  rowSchool: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.tertiary + '33',
  },
  rowText: { flex: 1, fontSize: 15, color: Colors.textPrimary, fontWeight: '500' },
  schoolIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
