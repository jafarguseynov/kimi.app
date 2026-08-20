import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../i18n';
import { getBlockedUsers, unblockUser, type BlockedUser } from '../../api/block.api';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

const initials = (n: string) => n.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

/** @handle əvəzinə rol yazılır — istifadəçi adları sistemdə yoxdur. */
const roleLabel = (role: string, t: (k: string) => string) =>
  role === 'teacher'
    ? t('blockedUsers.roleTeacher')
    : role === 'parent'
      ? t('blockedUsers.roleParent')
      : t('blockedUsers.roleStudent');

export default function BlockedUsersScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [query, setQuery] = useState('');

  const { data: users = [], isLoading, isError, refetch } = useQuery<BlockedUser[]>({
    queryKey: ['blockedUsers'],
    queryFn: getBlockedUsers,
  });

  const unblockMut = useMutation({
    mutationFn: (id: string) => unblockUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blockedUsers'] });
      qc.invalidateQueries({ queryKey: ['chats'] });
    },
    onError: () => Alert.alert(t('blockedUsers.errorTitle'), t('blockedUsers.errorBody')),
  });

  const filtered = useMemo(() => {
    if (!query.trim()) return users;
    const q = query.toLowerCase();
    return users.filter((u) => u.name?.toLowerCase().includes(q));
  }, [users, query]);

  const unblock = (u: BlockedUser) => {
    Alert.alert(t('blockedUsers.unblockTitle'), t('blockedUsers.unblockBody', { name: u.name }), [
      { text: t('blockedUsers.cancel'), style: 'cancel' },
      { text: t('blockedUsers.unblock'), onPress: () => unblockMut.mutate(u.id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('blockedUsers.headerTitle')}</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="ban" size={36} color={Colors.primary} />
          </View>
          <Text style={styles.heroTitle}>{t('blockedUsers.heroTitle')}</Text>
          <Text style={styles.heroSub}>
            {t('blockedUsers.heroSub')}
          </Text>
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={20} color={Colors.textMuted} style={styles.searchIcon} />
          <TextInput
            value={query} onChangeText={setQuery}
            placeholder={t('blockedUsers.searchPlaceholder')}
            placeholderTextColor={Colors.textMuted + 'AA'}
            style={styles.searchInput}
          />
        </View>

        {isLoading ? (
          <ActivityIndicator color={Colors.primary} style={{ paddingVertical: 40 }} />
        ) : isError ? (
          <View style={styles.empty}>
            <Ionicons name="cloud-offline-outline" size={42} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>{t('blockedUsers.errorTitle')}</Text>
            <Text style={styles.emptySub}>{t('blockedUsers.errorBody')}</Text>
            <TouchableOpacity style={styles.retryBtn} activeOpacity={0.85} onPress={() => refetch()}>
              <Text style={styles.retryText}>{t('blockedUsers.retry')}</Text>
            </TouchableOpacity>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="checkmark-circle-outline" size={42} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>{users.length === 0 ? t('blockedUsers.emptyTitleNone') : t('blockedUsers.emptyTitleNoResult')}</Text>
            <Text style={styles.emptySub}>
              {users.length === 0 ? t('blockedUsers.emptySubNone') : t('blockedUsers.emptySubNoResult')}
            </Text>
          </View>
        ) : (
          <View style={{ gap: 14 }}>
            {filtered.map((u) => (
              <View key={u.id} style={styles.card}>
                <View style={styles.cardLeft}>
                  <View style={styles.avatarWrap}>
                    {u.avatarUrl ? (
                      <Image source={{ uri: u.avatarUrl }} style={[styles.avatar, styles.avatarMuted]} />
                    ) : (
                      <LinearGradient
                        colors={[Colors.surfaceHigh, Colors.surfaceHighest ?? Colors.surfaceHigh]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={[styles.avatar, styles.avatarMuted]}
                      >
                        <Text style={styles.avatarInitial}>{initials(u.name)}</Text>
                      </LinearGradient>
                    )}
                    <View style={styles.blockBadge}>
                      <Ionicons name="ban" size={12} color={Colors.danger} />
                    </View>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name} numberOfLines={1}>{u.name}</Text>
                    <Text style={styles.handle}>{roleLabel(u.role, t)}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.unblockBtn, unblockMut.isPending && { opacity: 0.5 }]}
                  activeOpacity={0.85}
                  disabled={unblockMut.isPending}
                  onPress={() => unblock(u)}
                >
                  <Text style={styles.unblockText}>{t('blockedUsers.unblock')}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.footerCount}>
          {users.length === 0 ? t('blockedUsers.footerCountNone') : t('blockedUsers.footerCountSome', { count: users.length })}
        </Text>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, height: 60,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.primary, letterSpacing: -0.2 },

  scroll: { padding: 24, paddingBottom: 48 },

  /* Hero */
  hero: { alignItems: 'center', textAlign: 'center', marginBottom: 32 },
  heroIcon: {
    width: 80, height: 80, borderRadius: 20,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  heroTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, marginBottom: 8, letterSpacing: -0.3 },
  heroSub: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', lineHeight: 19, maxWidth: 320 },

  /* Search */
  searchWrap: {
    position: 'relative',
    backgroundColor: Colors.surfaceLowest,
    borderRadius: 16, marginBottom: 32,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.02, shadowRadius: 30, elevation: 1,
  },
  searchIcon: { position: 'absolute', left: 16, top: 16, zIndex: 1 },
  searchInput: {
    paddingVertical: 16, paddingLeft: 48, paddingRight: 24,
    fontSize: 15, color: Colors.textPrimary,
  },

  empty: { alignItems: 'center', gap: 6, paddingVertical: 40 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginTop: 8 },
  emptySub: { fontSize: 12, color: Colors.textSecondary, textAlign: 'center', maxWidth: 260, lineHeight: 18 },
  retryBtn: {
    marginTop: 12, paddingHorizontal: 24, paddingVertical: 10,
    borderRadius: 999, backgroundColor: Colors.surfaceHigh,
  },
  retryText: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },

  /* Card */
  card: {
    backgroundColor: Colors.surfaceLowest, borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 20, elevation: 2,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  avatarMuted: { opacity: 0.8 },
  avatarInitial: { fontSize: 20, fontWeight: '800', color: Colors.textSecondary },
  blockBadge: {
    position: 'absolute', bottom: -4, right: -4,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1,
  },
  name: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  handle: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },

  unblockBtn: {
    paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: Colors.surfaceHigh,
    borderRadius: 999,
  },
  unblockText: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },

  footerCount: {
    textAlign: 'center', color: Colors.textMuted,
    fontSize: 11, marginTop: 48, marginBottom: 16,
  },
});
