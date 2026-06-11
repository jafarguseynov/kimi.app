import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Share, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { getMyClass, getClassMembers, ClassMember } from '../../api/collaboration.api';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

function getInitials(name: string): string {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function TeacherClassScreen() {
  const navigation = useNavigation<any>();
  const [refreshing, setRefreshing] = useState(false);

  const { data: cls, isLoading, isError, refetch: refetchClass } = useQuery({ queryKey: ['myClass'], queryFn: getMyClass, retry: 1 });
  const { data: members = [], refetch: refetchMembers } = useQuery({ queryKey: ['classMembers'], queryFn: getClassMembers, retry: 1 });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchClass(), refetchMembers()]);
    setRefreshing(false);
  };

  const onShare = async () => {
    if (!cls) return;
    try {
      await Share.share({
        message: `Mənim Kimi.az sinifimə qoşul! Kod: ${cls.joinCode}\n${cls.link}\nQoşulanda 7 günlük pulsuz premium qazanırsan 🎁`,
      });
    } catch {}
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7} hitSlop={8} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sinifim</Text>
        <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7} hitSlop={8} onPress={onShare}>
          <Ionicons name="share-social-outline" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Sinif yüklənir...</Text>
          </View>
        ) : isError || !cls?.joinCode ? (
          <View style={styles.errorCard}>
            <Ionicons name="cloud-offline-outline" size={40} color={Colors.textMuted} />
            <Text style={styles.errorTitle}>Sinif yüklənmədi</Text>
            <Text style={styles.errorSub}>Serverə qoşula bilmədik. Bağlantını yoxla və yenidən cəhd et.</Text>
            <TouchableOpacity style={styles.retryBtn} activeOpacity={0.85} onPress={onRefresh}>
              <Ionicons name="refresh" size={18} color="#fff" />
              <Text style={styles.retryBtnText}>Yenidən cəhd et</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Invite card */}
            <LinearGradient colors={GRADIENT} style={styles.inviteCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <View style={styles.inviteAura} pointerEvents="none" />
              <Text style={styles.inviteLabel}>SİNİF KODU</Text>
              <Text style={styles.inviteCode}>{cls.joinCode}</Text>
              <Text style={styles.inviteHint}>Şagirdlərin bu kodla qoşulur və 7 günlük pulsuz premium qazanır</Text>
              <View style={styles.inviteBtns}>
                <TouchableOpacity style={styles.shareBtn} activeOpacity={0.85} onPress={onShare}>
                  <Ionicons name="share-social" size={18} color={Colors.primary} />
                  <Text style={styles.shareBtnText}>Dəvət et</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>

            {/* Members */}
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Qoşulan şagirdlər</Text>
              <View style={styles.countPill}><Text style={styles.countPillText}>{cls?.memberCount ?? members.length}</Text></View>
            </View>

            {members.length === 0 ? (
              <View style={styles.center}>
                <Ionicons name="people-outline" size={44} color={Colors.primaryFixed} />
                <Text style={styles.emptyText}>Hələ qoşulan yoxdur</Text>
                <Text style={styles.emptySub}>Kodu şagirdlərinlə paylaş — qoşulanda burada görünəcəklər.</Text>
              </View>
            ) : (
              members.map((m: ClassMember) => (
                <View key={m.id} style={styles.memberRow}>
                  <View style={styles.avatar}><Text style={styles.avatarText}>{getInitials(m.name)}</Text></View>
                  <Text style={styles.memberName}>{m.name}</Text>
                  <Ionicons name="checkmark-circle" size={18} color={Colors.tertiary} />
                </View>
              ))
            )}

            <Text style={styles.note}>
              İpucu: Qoşulan şagirdlər həm də "Şagirdlərim" panelində performansları ilə görünür.
            </Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.primary },

  scroll: { padding: 20, gap: 16, paddingBottom: 40 },
  center: { paddingTop: 40, alignItems: 'center', gap: 8 },
  loadingText: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  emptyText: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  emptySub: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', maxWidth: 260 },

  errorCard: {
    alignItems: 'center', gap: 10, paddingVertical: 32, paddingHorizontal: 20,
    backgroundColor: Colors.surfaceLowest, borderRadius: 20,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  errorTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  errorSub: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', maxWidth: 280, lineHeight: 19 },
  retryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6,
    backgroundColor: Colors.primary, borderRadius: 999, paddingHorizontal: 22, paddingVertical: 12,
  },
  retryBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },

  inviteCard: {
    borderRadius: 24, padding: 24, alignItems: 'center', gap: 8, overflow: 'hidden',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 16 }, shadowOpacity: 0.2, shadowRadius: 32, elevation: 6,
  },
  inviteAura: { position: 'absolute', top: -50, right: -50, width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255,255,255,0.12)' },
  inviteLabel: { fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.85)', letterSpacing: 2 },
  inviteCode: { fontSize: 40, fontWeight: '900', color: '#fff', letterSpacing: 3 },
  inviteHint: { fontSize: 12, color: 'rgba(255,255,255,0.9)', textAlign: 'center', maxWidth: 280, lineHeight: 18 },
  inviteBtns: { marginTop: 10 },
  shareBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fff', borderRadius: 999, paddingHorizontal: 24, paddingVertical: 12,
  },
  shareBtnText: { fontSize: 15, fontWeight: '800', color: Colors.primary },

  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.textPrimary },
  countPill: { backgroundColor: Colors.primaryLight, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 3 },
  countPillText: { fontSize: 13, fontWeight: '800', color: Colors.primary },

  memberRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  memberName: { flex: 1, fontSize: 14, fontWeight: '700', color: Colors.textPrimary },

  note: { fontSize: 11, color: Colors.textMuted, textAlign: 'center', lineHeight: 16, marginTop: 4 },
});
