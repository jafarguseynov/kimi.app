import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../constants/colors';

const AURA: [string, string] = [Colors.gradientStart, Colors.gradientEnd];
const AVATAR = (seed: string) =>
  `https://api.dicebear.com/8.x/initials/png?seed=${encodeURIComponent(seed)}&backgroundColor=eef1f3&textColor=006190`;

type Status = 'add' | 'sent' | 'friend';

interface UserCard {
  id: string;
  name: string;
  sub: string;
  status: Status;
}

const USERS: UserCard[] = [
  { id: 'u1', name: 'Elvin Məmmədov', sub: 'Riyaziyyat həvəskarı', status: 'add' },
  { id: 'u2', name: 'Leyla Əliyeva', sub: 'Fizika üzrə mütəxəssis', status: 'sent' },
  { id: 'u3', name: 'Kamran Quliyev', sub: 'İngilis dili öyrənir', status: 'friend' },
];

export default function FindFriendScreen() {
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState('');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={8} style={styles.avatarWrap}>
            <Image source={{ uri: AVATAR('Sən') }} style={styles.avatar} />
          </TouchableOpacity>
          <Text style={styles.title}>Dost tap</Text>
        </View>
        <TouchableOpacity style={styles.bellBtn} hitSlop={8}>
          <Ionicons name="notifications" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={20} color={Colors.outlineVariant} style={{ marginLeft: 16 }} />
          <TextInput
            placeholder="İstifadəçi axtar..."
            placeholderTextColor={Colors.outlineVariant}
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
          />
        </View>

        {/* User list */}
        <View style={{ gap: 16 }}>
          {USERS.map((u) => (
            <View key={u.id} style={styles.userCard}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 }}>
                <Image source={{ uri: AVATAR(u.name) }} style={styles.userAvatar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.userName}>{u.name}</Text>
                  <Text style={styles.userSub}>{u.sub}</Text>
                </View>
              </View>
              {u.status === 'add' && (
                <TouchableOpacity activeOpacity={0.9}>
                  <LinearGradient
                    colors={AURA} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={styles.actionBtn}
                  >
                    <Ionicons name="person-add" size={16} color="#fff" />
                    <Text style={styles.actionBtnText}>Əlavə et</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
              {u.status === 'sent' && (
                <View style={[styles.actionBtn, styles.actionBtnSent]}>
                  <Ionicons name="hourglass" size={16} color={Colors.textSecondary} />
                  <Text style={styles.actionBtnSentText}>Göndərildi</Text>
                </View>
              )}
              {u.status === 'friend' && (
                <View style={styles.friendPill}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.tertiary} />
                  <Text style={styles.friendPillText}>Dost</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Footer encouragement card */}
        <View style={styles.footerCard}>
          <View style={styles.footerIcon}>
            <Ionicons name="trophy" size={24} color={Colors.primary} />
          </View>
          <Text style={styles.footerText}>
            Dostlarınla yarış və inkişaf et.{'\n'}
            <Text style={{ fontWeight: '700', color: Colors.textPrimary }}>Birlikdə daha güclüsünüz!</Text>
          </Text>
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
    paddingHorizontal: 24, height: 72,
    borderBottomWidth: 1, borderBottomColor: Colors.surfaceVariant + '80',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatarWrap: {
    width: 44, height: 44, borderRadius: 22, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.surfaceVariant,
    backgroundColor: Colors.surfaceHigh,
  },
  avatar: { width: '100%', height: '100%' },
  title: { fontSize: 22, fontWeight: '700', color: Colors.textPrimary, letterSpacing: -0.4 },
  bellBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.surfaceLowest,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.surfaceVariant + '80',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },

  scroll: { paddingHorizontal: 24, paddingTop: 24, gap: 40 },

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
  userSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },

  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999,
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
