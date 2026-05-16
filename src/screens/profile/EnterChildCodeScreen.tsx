import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

export default function EnterChildCodeScreen() {
  const navigation = useNavigation<any>();
  const [code, setCode] = useState('');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hesabı bağla</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Mascot */}
        <View style={styles.mascotWrap}>
          <View style={styles.mascotGlow} />
          <View style={styles.mascotCard}>
            <Ionicons name="hardware-chip-outline" size={72} color={Colors.primary} />
          </View>
        </View>

        {/* Text */}
        <View style={styles.textSection}>
          <Text style={styles.title}>Övladınızın kodunu daxil edin</Text>
          <Text style={styles.subtitle}>
            Övladınızın profilindəki{' '}
            <Text style={styles.subtitleHighlight}>"Valideynlə bağla"</Text>
            {' '}bölməsində göstərilən 6 rəqəmli kodu daxil edin.
          </Text>
        </View>

        {/* Input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Şagird kodu</Text>
          <TextInput
            style={styles.codeInput}
            value={code}
            onChangeText={setCode}
            placeholder="X-X-X-X-X-X"
            placeholderTextColor={Colors.surfaceHigh}
            maxLength={11}
            autoCapitalize="characters"
            textAlign="center"
          />
        </View>

        {/* Actions */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate(Routes.ConnectionPending)}
        >
          <LinearGradient colors={GRADIENT} style={styles.primaryBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.primaryBtnText}>Bağla</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.helpBtn} activeOpacity={0.7}>
          <Text style={styles.helpBtnText}>Kodu necə tapmalıyam?</Text>
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
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },

  scroll: { padding: 24, gap: 24, paddingBottom: 40 },

  mascotWrap: { alignItems: 'center', justifyContent: 'center', position: 'relative', height: 192, marginBottom: 8 },
  mascotGlow: {
    position: 'absolute', bottom: 0,
    width: 176, height: 80, borderRadius: 88,
    backgroundColor: Colors.primaryFixed + '30',
  },
  mascotCard: {
    width: 160, height: 160, borderRadius: 20,
    backgroundColor: Colors.surfaceLowest,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.06, shadowRadius: 40, elevation: 3,
    zIndex: 1,
  },

  textSection: { alignItems: 'center', gap: 12 },
  title: { fontSize: 26, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center', letterSpacing: -0.3 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, paddingHorizontal: 8 },
  subtitleHighlight: { fontWeight: '600', color: Colors.primary },

  inputSection: { gap: 12 },
  inputLabel: {
    fontSize: 11, fontWeight: '700', color: Colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 1.2, marginLeft: 4,
  },
  codeInput: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, height: 80,
    fontSize: 28, fontWeight: '700', color: Colors.primary,
    letterSpacing: 8, paddingHorizontal: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 1,
  },

  primaryBtn: {
    height: 60, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 4,
  },
  primaryBtnText: { fontSize: 17, fontWeight: '800', color: '#fff' },
  helpBtn: { height: 48, alignItems: 'center', justifyContent: 'center' },
  helpBtnText: { fontSize: 14, fontWeight: '600', color: Colors.primary },
});
