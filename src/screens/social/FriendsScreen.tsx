import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];
const ONLINE_COLOR = '#10B981';

type Friend = { id: string; name: string; initial: string; isOnline: boolean };

const FRIENDS: Friend[] = [
  { id: '1', name: 'Aysel', initial: 'A', isOnline: true },
  { id: '2', name: 'Orxan', initial: 'O', isOnline: false },
  { id: '3', name: 'Nərmin', initial: 'N', isOnline: false },
];

function AvatarCircle({ initial, size }: { initial: string; size: number }) {
  return (
    <LinearGradient
      colors={GRADIENT}
      style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Text style={{ fontSize: size * 0.34, fontWeight: '800', color: '#fff' }}>
        {initial}
      </Text>
    </LinearGradient>
  );
}

export default function FriendsScreen() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  const filtered = FRIENDS.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerAvatar}>
          <AvatarCircle initial="S" size={40} />
        </View>
        <Text style={styles.headerTitle}>{t('social.myFriends')}</Text>
        <TouchableOpacity activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="notifications-outline" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Section heading */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>{t('social.studentMates')}</Text>
          <TouchableOpacity activeOpacity={0.75} hitSlop={8}>
            <Ionicons name="person-add-outline" size={22} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('social.searchPlaceholder')}
            placeholderTextColor={Colors.textSecondary}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Friend cards */}
        <View style={styles.list}>
          {filtered.map((friend) => (
            <View key={friend.id} style={styles.card}>
              {/* Avatar + status dot */}
              <View style={styles.avatarWrap}>
                <AvatarCircle initial={friend.initial} size={52} />
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: friend.isOnline ? ONLINE_COLOR : Colors.outlineVariant },
                  ]}
                />
              </View>

              {/* Name + status */}
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{friend.name}</Text>
                <Text
                  style={[
                    styles.cardStatus,
                    { color: friend.isOnline ? ONLINE_COLOR : Colors.textSecondary },
                  ]}
                >
                  {friend.isOnline ? t('social.online') : t('social.offline')}
                </Text>
              </View>

              {/* Actions */}
              <View style={styles.cardActions}>
                <TouchableOpacity activeOpacity={0.7} hitSlop={6}>
                  <Ionicons name="eye-outline" size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.85}>
                  {friend.isOnline ? (
                    <LinearGradient
                      colors={GRADIENT}
                      style={styles.challengeBtn}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Ionicons name="flash-outline" size={14} color="#fff" />
                      <Text style={styles.challengeBtnText}>{t('social.challenge')}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={[styles.challengeBtn, styles.challengeBtnOff]}>
                      <Ionicons name="flash-outline" size={14} color={Colors.textSecondary} />
                      <Text style={styles.challengeBtnTextOff}>{t('social.challenge')}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, height: 64,
    backgroundColor: 'rgba(255,255,255,0.7)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  headerAvatar: { borderRadius: 20, overflow: 'hidden' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.primary },

  scroll: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 48, gap: 16 },

  sectionRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },

  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.surfaceLow, borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 12,
  },
  searchInput: {
    flex: 1, fontSize: 15, color: Colors.textPrimary, padding: 0,
  },

  list: { gap: 12 },

  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surfaceLowest, borderRadius: 20, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12, elevation: 1,
  },
  avatarWrap: { position: 'relative' },
  statusDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 12, height: 12, borderRadius: 6,
    borderWidth: 2, borderColor: Colors.surfaceLowest,
  },

  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  cardStatus: { fontSize: 12, marginTop: 2 },

  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },

  challengeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
  },
  challengeBtnOff: { backgroundColor: Colors.surfaceContainer },
  challengeBtnText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  challengeBtnTextOff: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
});
