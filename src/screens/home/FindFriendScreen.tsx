import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../i18n';
import { searchUsers, sendFriendRequest, type FriendSearchItem } from '../../api/friend.api';

const AURA: [string, string] = [Colors.gradientStart, Colors.gradientEnd];
const AVATAR = (seed: string) =>
  `https://api.dicebear.com/8.x/initials/png?seed=${encodeURIComponent(seed)}&backgroundColor=eef1f3&textColor=006190`;

export default function FindFriendScreen() {
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FriendSearchItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const { t } = useTranslation();

  // Axtarış — debounce (350ms), ən az 2 hərf.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) { setResults([]); setSearching(false); return; }
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
  }, [query]);

  const onAdd = async (u: FriendSearchItem) => {
    setBusyId(u.id);
    try {
      const res: any = await sendFriendRequest(u.id);
      const nextRelation: FriendSearchItem['relation'] = res?.status === 'accepted' ? 'friends' : 'requested';
      setResults((prev) => prev.map((r) => (r.id === u.id ? { ...r, relation: nextRelation } : r)));
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
    } catch { /* no-op */ } finally { setBusyId(null); }
  };

  const q = query.trim();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8} style={styles.avatarWrap}>
            <Ionicons name="arrow-back" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>{t('findFriend.title')}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Search */}
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={20} color={Colors.outlineVariant} style={{ marginLeft: 16 }} />
          <TextInput
            placeholder={t('findFriend.searchPlaceholder')}
            placeholderTextColor={Colors.outlineVariant}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.searchInput}
          />
          {searching && <ActivityIndicator color={Colors.primary} style={{ marginRight: 16 }} />}
        </View>

        {/* User list / states */}
        {q.length < 2 ? (
          <Text style={styles.hint}>{t('findFriend.searchHint')}</Text>
        ) : results.length === 0 && !searching ? (
          <Text style={styles.hint}>{t('findFriend.noResults')}</Text>
        ) : (
          <View style={{ gap: 16 }}>
            {results.map((u) => (
              <View key={u.id} style={styles.userCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 }}>
                  <Image source={{ uri: u.avatarUrl ?? AVATAR(u.name) }} style={styles.userAvatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.userName} numberOfLines={1}>{u.name}</Text>
                    {u.subtitle ? (
                      <Text style={styles.userMeta} numberOfLines={1}>{u.subtitle}</Text>
                    ) : null}
                    {u.online && <Text style={styles.userSub}>{t('social.active')}</Text>}
                  </View>
                </View>
                {u.relation === 'friends' ? (
                  <View style={styles.friendPill}>
                    <Ionicons name="checkmark-circle" size={16} color={Colors.tertiary} />
                    <Text style={styles.friendPillText}>{t('findFriend.friend')}</Text>
                  </View>
                ) : u.relation === 'requested' ? (
                  <View style={[styles.actionBtn, styles.actionBtnSent]}>
                    <Ionicons name="hourglass" size={16} color={Colors.textSecondary} />
                    <Text style={styles.actionBtnSentText}>{t('findFriend.sent')}</Text>
                  </View>
                ) : u.relation === 'incoming' ? (
                  <View style={[styles.actionBtn, styles.actionBtnSent]}>
                    <Ionicons name="person-add" size={16} color={Colors.textSecondary} />
                    <Text style={styles.actionBtnSentText}>{t('findFriend.incoming')}</Text>
                  </View>
                ) : (
                  <TouchableOpacity activeOpacity={0.9} disabled={busyId === u.id} onPress={() => onAdd(u)}>
                    <LinearGradient
                      colors={AURA} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                      style={styles.actionBtn}
                    >
                      {busyId === u.id ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <>
                          <Ionicons name="person-add" size={16} color="#fff" />
                          <Text style={styles.actionBtnText}>{t('findFriend.add')}</Text>
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Footer encouragement card */}
        {q.length < 2 && (
          <View style={styles.footerCard}>
            <View style={styles.footerIcon}>
              <Ionicons name="trophy" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.footerText}>
              {t('findFriend.footerPre')}{'\n'}
              <Text style={{ fontWeight: '700', color: Colors.textPrimary }}>{t('findFriend.footerBold')}</Text>
            </Text>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, height: 72,
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceVariant + '80',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatarWrap: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.4 },

  scroll: { paddingHorizontal: 24, paddingTop: 24, gap: 24 },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surfaceLowest, borderRadius: 999,
    borderWidth: 1, borderColor: Colors.surfaceVariant + '99',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2,
  },
  searchInput: {
    flex: 1, paddingHorizontal: 12, paddingVertical: 14,
    fontSize: 15, color: Colors.textPrimary,
  },

  hint: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', paddingVertical: 24, lineHeight: 20 },

  userCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 32, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: Colors.surfaceVariant + '4D',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.04, shadowRadius: 18, elevation: 2,
  },
  userAvatar: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.surfaceHigh,
  },
  userName: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  userMeta: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  userSub: { fontSize: 13, color: Colors.tertiary, marginTop: 2, fontWeight: '600' },

  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, minWidth: 96, justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.18, shadowRadius: 12, elevation: 3,
  },
  actionBtnText: { fontSize: 13, fontWeight: '600', color: '#fff' },

  actionBtnSent: {
    backgroundColor: Colors.surfaceVariant + 'CC',
    borderWidth: 1, borderColor: Colors.surfaceVariant,
    shadowOpacity: 0,
  },
  actionBtnSentText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },

  friendPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999,
    backgroundColor: Colors.tertiary + '0D',
  },
  friendPillText: { fontSize: 13, fontWeight: '600', color: Colors.tertiary },

  footerCard: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 32, padding: 32,
    alignItems: 'center', gap: 16,
    borderWidth: 1, borderColor: Colors.surfaceVariant + '4D',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 14, elevation: 2,
  },
  footerIcon: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  footerText: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, maxWidth: 280 },
});
