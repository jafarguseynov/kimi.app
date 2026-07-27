import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useTranslation } from '../../i18n';
import {
  getFriends, getFriendRequests, searchUsers, sendFriendRequest, respondFriendRequest,
  FriendItem, FriendSearchItem,
} from '../../api/friend.api';

const AURA: [string, string] = [Colors.gradientStart, Colors.gradientEnd];
const AVATAR = (seed: string) =>
  `https://api.dicebear.com/8.x/initials/png?seed=${encodeURIComponent(seed)}&backgroundColor=eef1f3&textColor=006190`;

export default function MyFriendsScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: friendsData, isLoading, refetch, isRefetching } = useQuery<FriendItem[]>({
    queryKey: ['friends'],
    queryFn: () => getFriends().catch(() => [] as FriendItem[]),
  });
  const { data: requestsData } = useQuery<FriendItem[]>({
    queryKey: ['friendRequests'],
    queryFn: () => getFriendRequests().catch(() => [] as FriendItem[]),
  });
  const friends: FriendItem[] = Array.isArray(friendsData) ? friendsData : [];
  const requests: FriendItem[] = Array.isArray(requestsData) ? requestsData : [];

  // Dost əlavə etmə modalı
  const [addOpen, setAddOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FriendSearchItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!addOpen) return;
    const q = query.trim();
    if (q.length < 2) { setResults([]); return; }
    let active = true;
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await searchUsers(q);
        if (active) setResults(Array.isArray(res) ? res : []);
      } catch { if (active) setResults([]); }
      finally { if (active) setSearching(false); }
    }, 350);
    return () => { active = false; clearTimeout(timer); };
  }, [query, addOpen]);

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ['friends'] });
    queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
  };

  const onSendRequest = async (u: FriendSearchItem) => {
    setBusyId(u.id);
    try {
      const res: any = await sendFriendRequest(u.id);
      setResults((prev) => prev.map((r) => r.id === u.id ? { ...r, relation: res?.status === 'accepted' ? 'friends' : 'requested' } : r));
      refreshAll();
    } catch { /* no-op */ } finally { setBusyId(null); }
  };

  const onRespond = async (f: FriendItem, accept: boolean) => {
    setBusyId(f.friendshipId);
    try {
      await respondFriendRequest(f.friendshipId, accept);
      refreshAll();
    } catch { /* no-op */ } finally { setBusyId(null); }
  };

  // Dostu duelə çağır → fənn/parametr seçimi (DuelMode) → real dəvət göndərilir.
  const challenge = (f: FriendItem) => {
    navigation.getParent()?.navigate('Exams', {
      screen: Routes.DuelMode,
      params: { challengeFriend: { id: f.id, name: f.name } },
    });
  };

  const lastSeenText = (iso: string | null) => {
    if (!iso) return t('social.offline');
    const d = new Date(iso);
    if (isNaN(d.getTime())) return t('social.offline');
    return t('social.lastSeenAt', { date: d.toLocaleDateString([], { day: '2-digit', month: 'short' }) });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('social.myFriends')}</Text>
        <TouchableOpacity hitSlop={8} style={styles.iconBtn} onPress={() => setAddOpen(true)}>
          <Ionicons name="person-add" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} colors={[Colors.primary]} />}
      >
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{t('social.studentMates')}</Text>
            <Text style={styles.subtitle}>{t('social.subtitle')}</Text>
          </View>
        </View>

        {/* Gələn dostluq sorğuları */}
        {requests.length > 0 && (
          <View style={{ gap: 12 }}>
            <Text style={styles.sectionLabel}>{t('social.requestsTitle')}</Text>
            {requests.map((r) => (
              <View key={r.friendshipId} style={styles.card}>
                <View style={styles.cardLeft}>
                  <View style={styles.avatarWrap}>
                    <Image source={{ uri: r.avatarUrl ?? AVATAR(r.name) }} style={styles.avatar} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{r.name}</Text>
                    <Text style={styles.statusOffline}>{t('social.requestsTitle')}</Text>
                  </View>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity style={styles.declineBtn} activeOpacity={0.85} disabled={busyId === r.friendshipId} onPress={() => onRespond(r, false)}>
                    <Ionicons name="close" size={18} color={Colors.danger} />
                  </TouchableOpacity>
                  <TouchableOpacity activeOpacity={0.9} disabled={busyId === r.friendshipId} onPress={() => onRespond(r, true)}>
                    <LinearGradient colors={AURA} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.challengeBtn}>
                      <Text style={styles.challengeBtnText}>{t('social.accept')}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Dostlar */}
        {isLoading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 12 }} />
        ) : friends.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={44} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>{t('social.emptyFriendsTitle')}</Text>
            <Text style={styles.emptySub}>{t('social.emptyFriendsSub')}</Text>
            <TouchableOpacity activeOpacity={0.9} onPress={() => setAddOpen(true)} style={{ marginTop: 4 }}>
              <LinearGradient colors={AURA} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.emptyCta}>
                <Ionicons name="person-add" size={18} color="#fff" />
                <Text style={styles.emptyCtaText}>{t('social.addFriendTitle')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ gap: 16 }}>
            {friends.map((f) => (
              <View key={f.friendshipId} style={styles.card}>
                <View style={styles.cardLeft}>
                  <View style={styles.avatarWrap}>
                    <Image source={{ uri: f.avatarUrl ?? AVATAR(f.name) }} style={styles.avatar} />
                    {f.online && <View style={styles.onlineDot} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{f.name}</Text>
                    {f.online ? (
                      <View style={styles.statusRow}>
                        <View style={styles.statusDot} />
                        <Text style={styles.statusOnline}>{t('social.active')}</Text>
                      </View>
                    ) : (
                      <View style={styles.statusRow}>
                        <Ionicons name="time-outline" size={12} color={Colors.textSecondary} />
                        <Text style={styles.statusOffline}>{lastSeenText(f.lastSeenAt)}</Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.actions}>
                  {f.online ? (
                    <TouchableOpacity activeOpacity={0.9} onPress={() => challenge(f)}>
                      <LinearGradient colors={AURA} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.challengeBtn}>
                        <Text style={styles.challengeBtnText}>{t('social.challenge')}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={[styles.challengeBtn, styles.challengeGhost]} activeOpacity={0.85} onPress={() => challenge(f)}>
                      <Text style={styles.challengeGhostText}>{t('social.challenge')}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Dost əlavə etmə modalı */}
      <Modal visible={addOpen} animationType="slide" transparent onRequestClose={() => setAddOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('social.addFriendTitle')}</Text>
              <TouchableOpacity hitSlop={8} onPress={() => { setAddOpen(false); setQuery(''); setResults([]); }}>
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.searchWrap}>
              <Ionicons name="search" size={18} color={Colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                value={query}
                onChangeText={setQuery}
                placeholder={t('social.searchPlaceholder')}
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searching && <ActivityIndicator color={Colors.primary} />}
            </View>

            <ScrollView style={{ maxHeight: 360 }} keyboardShouldPersistTaps="handled">
              {query.trim().length < 2 ? (
                <Text style={styles.searchHint}>{t('social.searchHint')}</Text>
              ) : results.length === 0 && !searching ? (
                <Text style={styles.searchHint}>{t('social.noResults')}</Text>
              ) : (
                results.map((u) => (
                  <View key={u.id} style={styles.resultRow}>
                    <Image source={{ uri: u.avatarUrl ?? AVATAR(u.name) }} style={styles.resultAvatar} />
                    <Text style={styles.resultName} numberOfLines={1}>{u.name}</Text>
                    {u.relation === 'friends' ? (
                      <Text style={styles.relationTag}>{t('social.friendsBtn')}</Text>
                    ) : u.relation === 'requested' ? (
                      <Text style={styles.relationTag}>{t('social.requestedBtn')}</Text>
                    ) : (
                      <TouchableOpacity style={styles.resultAddBtn} activeOpacity={0.85} disabled={busyId === u.id} onPress={() => onSendRequest(u)}>
                        {busyId === u.id ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.resultAddText}>{t('social.addBtn')}</Text>}
                      </TouchableOpacity>
                    )}
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, height: 60,
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceVariant + '4D',
    backgroundColor: Colors.background,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.3 },

  scroll: { paddingHorizontal: 24, paddingTop: 24, gap: 32 },

  titleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 16 },
  title: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.4 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 4, lineHeight: 20, maxWidth: 240 },
  addBtn: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.surfaceLowest,
    borderWidth: 1, borderColor: Colors.surfaceVariant + '4D',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 2,
  },

  card: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 24, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: Colors.surfaceVariant + '33',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 2,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.surfaceHigh,
    borderWidth: 2, borderColor: Colors.surfaceLowest,
  },
  avatarInitial: { alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primaryLight },
  avatarInitialText: { fontSize: 22, fontWeight: '700', color: Colors.primary },
  onlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: Colors.tertiaryContainer,
    borderWidth: 2, borderColor: Colors.surfaceLowest,
  },
  name: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.2 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.tertiaryContainer },
  statusOnline: { fontSize: 12, color: Colors.tertiary, fontWeight: '600' },
  statusOffline: { fontSize: 12, color: Colors.textSecondary },

  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyeBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  challengeBtn: {
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 3,
  },
  challengeBtnText: { fontSize: 13, fontWeight: '700', color: '#fff', letterSpacing: -0.1 },
  challengeGhost: {
    backgroundColor: Colors.primary + '0D',
    borderWidth: 1, borderColor: Colors.primary + '33',
    shadowOpacity: 0,
  },
  challengeGhostText: { fontSize: 13, fontWeight: '700', color: Colors.primary, letterSpacing: -0.1 },

  sectionLabel: { fontSize: 12, fontWeight: '800', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
  declineBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.dangerLight,
    alignItems: 'center', justifyContent: 'center',
  },

  empty: { alignItems: 'center', gap: 8, paddingVertical: 40 },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: Colors.textPrimary },
  emptySub: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: 24, lineHeight: 19 },
  emptyCta: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 20, paddingVertical: 12, borderRadius: 999,
  },
  emptyCtaText: { fontSize: 14, fontWeight: '800', color: '#fff' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 32, gap: 16,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: Colors.textPrimary },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.surfaceLowest, borderRadius: 14, paddingHorizontal: 14, height: 50,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  searchInput: { flex: 1, fontSize: 15, color: Colors.textPrimary },
  searchHint: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', paddingVertical: 24 },
  resultRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  resultAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.surfaceHigh },
  resultName: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  resultAddBtn: {
    backgroundColor: Colors.primary, borderRadius: 999,
    paddingHorizontal: 18, paddingVertical: 9, minWidth: 72, alignItems: 'center',
  },
  resultAddText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  relationTag: { fontSize: 12, fontWeight: '700', color: Colors.textMuted },
});
