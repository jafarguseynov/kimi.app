import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';

export default function ReviewSuccessScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<RouteProp<{ params: { teacherId: string; teacherName: string } }, 'params'>>();
  const { teacherId = '', teacherName = 'Müəllim' } = route.params ?? {};

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Təşəkkür edirik</Text>
        <View style={styles.headerBtn} />
      </View>

      <View style={styles.centerContent}>
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark-circle" size={64} color={Colors.primary} />
        </View>

        <Text style={styles.title}>Rəyiniz uğurla göndərildi</Text>
        <Text style={styles.subtitle}>
          Müəllimi qiymətləndirdiyiniz üçün təşəkkür edirik. Sizin rəyiniz digər şagirdlərə seçim etməkdə kömək edəcək.
        </Text>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.85}
            onPress={() => navigation.pop(2)}
          >
            <Text style={styles.primaryBtnText}>Profilə qayıt</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            activeOpacity={0.7}
            onPress={() => navigation.navigate(Routes.AllReviews, { teacherId, teacherName })}
          >
            <Text style={styles.secondaryBtnText}>Digər rəylərə bax</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surfaceLow,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.primary },

  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 24,
  },

  iconCircle: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },

  title: {
    fontSize: 24, fontWeight: '800', color: Colors.textPrimary,
    textAlign: 'center', letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: 24, maxWidth: 280,
  },

  actions: { gap: 12, width: '100%', marginTop: 12 },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.primary, borderRadius: 20, paddingVertical: 20,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 12, elevation: 4,
  },
  primaryBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  secondaryBtn: {
    borderRadius: 20, paddingVertical: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.borderLight,
    alignItems: 'center',
  },
  secondaryBtnText: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
});
