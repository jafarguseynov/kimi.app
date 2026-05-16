import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MarketplaceStackParamList } from '../../navigation/types';
import { Routes } from '../../constants/routes';
import { Colors } from '../../constants/colors';

type Props = { navigation: NativeStackNavigationProp<MarketplaceStackParamList, typeof Routes.AIAnswer> };

export default function AIAnswerScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="close" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sual Yarandı</Text>
        <View style={styles.headerBtn} />
      </View>

      <View style={styles.content}>
        {/* Mascot */}
        <View style={styles.mascotSection}>
          <View style={styles.aura} />
          <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientEnd]}
            style={styles.mascotGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="hardware-chip-outline" size={96} color="rgba(255,255,255,0.9)" />
          </LinearGradient>
        </View>

        {/* Text */}
        <View style={styles.textSection}>
          <Text style={styles.title}>AI cavab verə bilmədi</Text>
          <Text style={styles.subtitle}>
            Təəssüf ki, süni intellekt bu sualı anlaya bilmədi. Bu sualı müəllimlərə göndərmək istəyirsən?
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate(Routes.AIAnswerFallback)}
            style={{ width: '100%' }}
          >
            <LinearGradient
              colors={[Colors.gradientStart, Colors.gradientEnd]}
              style={styles.primaryBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.primaryBtnText}>Müəllimlərə göndər</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryBtnText}>Yenidən yoxla</Text>
          </TouchableOpacity>
        </View>

        {/* Hint */}
        <View style={styles.hint}>
          <Ionicons name="information-circle-outline" size={18} color={Colors.textMuted} />
          <Text style={styles.hintText}>Sualınız 15 dəqiqə ərzində cavablandırılacaq</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, height: 56,
    backgroundColor: 'rgba(255,255,255,0.7)',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.06, shadowRadius: 40, elevation: 2,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: Colors.primary },

  content: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 32, paddingBottom: 32, gap: 32,
  },

  mascotSection: { alignItems: 'center', justifyContent: 'center', width: 256, height: 256 },
  aura: {
    position: 'absolute', width: 256, height: 256, borderRadius: 128,
    backgroundColor: Colors.primary + '1A',
  },
  mascotGrad: {
    width: 192, height: 192, borderRadius: 96,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.2, shadowRadius: 32, elevation: 6,
  },

  textSection: { alignItems: 'center', gap: 16 },
  title: {
    fontSize: 28, fontWeight: '800', color: Colors.textPrimary,
    textAlign: 'center', letterSpacing: -0.5, lineHeight: 36,
  },
  subtitle: {
    fontSize: 16, color: Colors.textSecondary, textAlign: 'center',
    lineHeight: 24, maxWidth: 300,
  },

  actions: { width: '100%', gap: 4 },
  primaryBtn: {
    width: '100%', height: 58, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.15, shadowRadius: 40, elevation: 4,
  },
  primaryBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },
  secondaryBtn: {
    width: '100%', height: 58, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surfaceHigh,
  },
  secondaryBtnText: { fontSize: 17, fontWeight: '600', color: Colors.textPrimary },

  hint: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hintText: {
    fontSize: 10, fontWeight: '600', color: Colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
});
