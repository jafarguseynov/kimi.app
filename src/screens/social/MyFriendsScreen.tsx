import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../i18n';

const AURA: [string, string] = [Colors.gradientStart, Colors.gradientEnd];
const AVATAR = (seed: string) =>
  `https://api.dicebear.com/8.x/initials/png?seed=${encodeURIComponent(seed)}&backgroundColor=eef1f3&textColor=006190`;

interface Friend {
  id: string;
  name: string;
  online: boolean;
  lastSeen?: string;
  initial?: string;
}

const FRIENDS: Friend[] = [
  { id: 'f1', name: 'Aysel Məmmədova', online: true },
  { id: 'f2', name: 'Orxan Əliyev', online: false, lastSeen: '2 saat əvvəl' },
  { id: 'f3', name: 'Nərmin Quliyeva', online: false, lastSeen: 'dünən', initial: 'N' },
];

export default function MyFriendsScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [filter] = useState<'all' | 'online'>('all');

  const visible = filter === 'online' ? FRIENDS.filter((f) => f.online) : FRIENDS;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('social.myFriends')}</Text>
        <TouchableOpacity hitSlop={8} style={styles.iconBtn}>
          <Ionicons name="search" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{t('social.studentMates')}</Text>
            <Text style={styles.subtitle}>{t('social.subtitle')}</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} activeOpacity={0.85}>
            <Ionicons name="person-add" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={{ gap: 16 }}>
          {visible.map((f) => (
            <View key={f.id} style={styles.card}>
              <View style={styles.cardLeft}>
                <View style={styles.avatarWrap}>
                  {f.initial ? (
                    <View style={[styles.avatar, styles.avatarInitial]}>
                      <Text style={styles.avatarInitialText}>{f.initial}</Text>
                    </View>
                  ) : (
                    <Image source={{ uri: AVATAR(f.name) }} style={styles.avatar} />
                  )}
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
                      <Text style={styles.statusOffline}>{f.lastSeen}</Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity style={styles.eyeBtn} hitSlop={6}>
                  <Ionicons name="eye-outline" size={18} color={Colors.textSecondary} />
                </TouchableOpacity>
                {f.online ? (
                  <TouchableOpacity activeOpacity={0.9}>
                    <LinearGradient
                      colors={AURA} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                      style={styles.challengeBtn}
                    >
                      <Text style={styles.challengeBtnText}>{t('social.challenge')}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={[styles.challengeBtn, styles.challengeGhost]} activeOpacity={0.85}>
                    <Text style={styles.challengeGhostText}>{t('social.challenge')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>

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
});
