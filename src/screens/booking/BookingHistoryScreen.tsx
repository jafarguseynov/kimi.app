import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useQuery } from '@tanstack/react-query';
import { getStudentBookings, getTeacherBookings, Booking } from '../../api/booking.api';
import { getOrCreateChat } from '../../api/chat.api';
import { useUserStore } from '../../store/user.store';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type TabType = 'Hamısı' | 'Aktiv' | 'Tarixçə';
const TABS: TabType[] = ['Hamısı', 'Aktiv', 'Tarixçə'];

type StatusType = 'pending' | 'confirmed' | 'cancelled' | 'completed';

const STATUS_CONFIG: Record<StatusType, { label: string; bg: string; text: string }> = {
  pending:   { label: 'Gözləmədə',   bg: '#fffbeb', text: '#d97706' },
  confirmed: { label: 'Qəbul edildi', bg: '#ecfdf5', text: '#059669' },
  completed: { label: 'Tamamlandı',  bg: Colors.primaryLight, text: Colors.primary },
  cancelled: { label: 'Ləğv edildi', bg: '#fff1f2', text: '#e11d48' },
};

const AVATAR_BG: Record<StatusType, string> = {
  pending:   '#fffbeb',
  confirmed: '#ecfdf5',
  completed: Colors.primaryLight,
  cancelled: Colors.surfaceLow,
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('az-AZ', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function BookingHistoryScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('Hamısı');
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useUserStore();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const isTeacher = user?.role === 'teacher';

  const { data: bookings = [], isLoading, refetch } = useQuery({
    queryKey: ['bookings', isTeacher ? 'teacher' : 'student'],
    queryFn: isTeacher ? getTeacherBookings : getStudentBookings,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const filtered = bookings.filter((b) => {
    if (activeTab === 'Aktiv') return b.status === 'pending' || b.status === 'confirmed';
    if (activeTab === 'Tarixçə') return b.status === 'completed' || b.status === 'cancelled';
    return true;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7} hitSlop={8} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dərs Müraciətləri</Text>
        <View style={[styles.headerBtn, styles.avatar]}>
          <Text style={styles.avatarText}>{getInitials(user?.name ?? 'KY')}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        <View style={styles.tabBar}>
          {TABS.map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tabBtn, activeTab === t && styles.tabBtnActive]}
              onPress={() => setActiveTab(t)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabBtnText, activeTab === t && styles.tabBtnTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.center}>
            <Ionicons name="calendar-outline" size={48} color={Colors.primaryFixed} />
            <Text style={styles.emptyText}>Müraciət tapılmadı</Text>
          </View>
        ) : (
          filtered.map((item: Booking) => {
            const status = item.status as StatusType;
            const cfg = STATUS_CONFIG[status];
            const personName = isTeacher
              ? (item.student?.name ?? 'Şagird')
              : (item.teacher?.name ?? 'Müəllim');
            const initials = getInitials(personName);
            const showInfo = status === 'pending' || status === 'confirmed';

            return (
              <View key={item.id} style={[styles.card, status === 'cancelled' && styles.cardDim]}>
                <View style={styles.cardHead}>
                  <View style={styles.cardHeadLeft}>
                    <View style={[styles.initialsCircle, { backgroundColor: AVATAR_BG[status] }]}>
                      {status === 'cancelled' ? (
                        <Ionicons name="person" size={20} color={Colors.textMuted} />
                      ) : (
                        <Text style={[styles.initialsText, { color: cfg.text }]}>{initials}</Text>
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.teacherName}>{personName}</Text>
                      <Text style={styles.subjectText}>{item.subject ?? 'Fənn göstərilməyib'}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                    <Text style={[styles.statusBadgeText, { color: cfg.text }]}>{cfg.label}</Text>
                  </View>
                </View>

                {showInfo && (
                  <View style={styles.infoGrid}>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Tarix</Text>
                      <View style={styles.infoValueRow}>
                        <Ionicons name="calendar-outline" size={15} color={Colors.textMuted} />
                        <Text style={styles.infoValue}>{formatDate(item.scheduledAt)}</Text>
                      </View>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Müddət</Text>
                      <Text style={[styles.infoValue, { fontWeight: '700' }]}>{item.duration} dəq</Text>
                    </View>
                  </View>
                )}

                {status === 'confirmed' && (
                  <TouchableOpacity
                    style={styles.joinBtn}
                    activeOpacity={0.85}
                    onPress={async () => {
                      const otherUserId = isTeacher ? item.student?.id : item.teacher?.id;
                      if (!otherUserId) return;
                      try {
                        const chat = await getOrCreateChat(otherUserId);
                        const parent = navigation.getParent() as any;
                        if (parent?.navigate) {
                          parent.navigate('Chat', {
                            screen: Routes.ChatRoom,
                            params: { chatId: chat.id, name: personName },
                          });
                        }
                      } catch (e: any) {
                        Alert.alert('Xəta', e?.response?.data?.message || 'Söhbət açıla bilmədi');
                      }
                    }}
                  >
                    <Ionicons name="chatbubble" size={18} color="#fff" />
                    <Text style={styles.joinBtnText}>Mesajla</Text>
                  </TouchableOpacity>
                )}

                {status === 'completed' && (
                  <View style={styles.ratingRow}>
                    <View style={styles.ratingLeft}>
                      <Ionicons name="checkmark-circle" size={18} color={Colors.tertiary} />
                      <Text style={styles.ratingText}>Tamamlandı</Text>
                    </View>
                    {!isTeacher && (
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => navigation.navigate(Routes.LeaveReview, {
                          bookingId: item.id,
                          teacherId: item.teacher?.id,
                          teacherName: personName,
                          teacherSubject: item.subject,
                        })}
                      >
                        <Text style={[styles.ratingText, { color: Colors.primary, fontWeight: '700' }]}>Rəy yaz →</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {status === 'cancelled' && (
                  <Text style={styles.rejectReason}>Bu rezervasiya ləğv edildi.</Text>
                )}
              </View>
            );
          })
        )}

        <View style={styles.adviceCard}>
          <LinearGradient colors={GRADIENT} style={styles.adviceIconBox} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Ionicons name="hardware-chip-outline" size={28} color="#fff" />
          </LinearGradient>
          <View style={styles.adviceBody}>
            <Text style={styles.adviceTitle}>Kimi Məsləhəti</Text>
            <Text style={styles.adviceText}>
              Müraciətlərinizə cavab almaq üçün orta gözləmə müddəti 2 saatdır. Şəxsi bildirişləri yoxlamağı unutma!
            </Text>
          </View>
        </View>
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
  avatar: { backgroundColor: Colors.primaryLight, borderWidth: 2, borderColor: Colors.primaryFixed },
  avatarText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  headerTitle: { fontSize: 17, fontWeight: '600', color: Colors.primary },

  scroll: { padding: 20, gap: 16, paddingBottom: 40 },

  tabBar: {
    flexDirection: 'row', backgroundColor: Colors.surfaceLow,
    borderRadius: 999, padding: 4, gap: 2,
  },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 999, alignItems: 'center' },
  tabBtnActive: {
    backgroundColor: Colors.surfaceLowest,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2,
  },
  tabBtnText: { fontSize: 13, fontWeight: '500', color: Colors.textMuted },
  tabBtnTextActive: { fontSize: 13, fontWeight: '700', color: Colors.primary },

  center: { paddingTop: 40, alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 14, color: Colors.textSecondary },

  card: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 20, gap: 14,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.06, shadowRadius: 40, elevation: 2,
  },
  cardDim: { opacity: 0.75 },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardHeadLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, marginRight: 10 },
  initialsCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  initialsText: { fontSize: 15, fontWeight: '700' },
  teacherName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  subjectText: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statusBadgeText: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },

  infoGrid: { flexDirection: 'row', gap: 16 },
  infoItem: { flex: 1, gap: 4 },
  infoLabel: { fontSize: 9, fontWeight: '700', color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  infoValueRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoValue: { fontSize: 13, fontWeight: '500', color: Colors.textPrimary },

  joinBtn: {
    backgroundColor: Colors.primary, borderRadius: 999,
    paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 3,
  },
  joinBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },

  ratingRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.surfaceLow, borderRadius: 14, padding: 14,
  },
  ratingLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ratingText: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },

  rejectReason: { fontSize: 12, color: Colors.textMuted, lineHeight: 18 },

  adviceCard: {
    backgroundColor: Colors.primaryLight + '1A', borderRadius: 20, padding: 20,
    flexDirection: 'row', gap: 14, alignItems: 'flex-start',
  },
  adviceIconBox: {
    width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 3,
    flexShrink: 0,
  },
  adviceBody: { flex: 1 },
  adviceTitle: { fontSize: 15, fontWeight: '800', color: Colors.primary, marginBottom: 4 },
  adviceText: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18 },
});
