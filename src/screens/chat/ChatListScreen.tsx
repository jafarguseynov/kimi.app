import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuery } from '@tanstack/react-query';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import client from '../../api/client';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useUserStore } from '../../store/user.store';
import { formatDate } from '../../utils/formatters';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type Props = { navigation: NativeStackNavigationProp<any> };

interface ChatItem {
  id: string;
  participant1: { id: string; name: string };
  participant2: { id: string; name: string };
  createdAt: string;
}

export default function ChatListScreen({ navigation }: Props) {
  const { user } = useUserStore();
  const { data: chats = [], isLoading } = useQuery<ChatItem[]>({
    queryKey: ['chats'],
    queryFn: async () => {
      const res = await client.get('/chat');
      return res.data;
    },
  });

  const getOther = (chat: ChatItem) =>
    chat.participant1.id === user?.id ? chat.participant2 : chat.participant1;

  const EmptyState = (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIllustration}>
        <View style={styles.emptyAura} />
        <View style={styles.emptyCardBg} />
        <View style={styles.emptyMainCard}>
          <View style={styles.emptyBubbleBadge}>
            <Ionicons name="chatbubble" size={28} color={Colors.tertiary} />
          </View>
          <LinearGradient colors={GRADIENT} style={styles.emptyRobotIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Ionicons name="hardware-chip" size={52} color="#fff" />
          </LinearGradient>
          <View style={styles.emptyLabel}>
            <Text style={styles.emptyLabelText}>Chat boşdur</Text>
          </View>
        </View>
        <View style={styles.emptyFloat1} />
        <View style={styles.emptyFloat2} />
      </View>

      <Text style={styles.emptyTitle}>Söhbət yoxdur</Text>
      <Text style={styles.emptySub}>
        Müəllimlərlə yazışmaq üçün bir dərs sorğusu göndər və ya mesaj yaz.
      </Text>

      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.emptyCtaWrap}
        onPress={() => navigation.navigate(Routes.TeacherList)}
      >
        <LinearGradient colors={GRADIENT} style={styles.emptyCta} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
          <Text style={styles.emptyCtaText}>Müəllimlərə bax</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <LinearGradient colors={GRADIENT} style={styles.headerAvatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Ionicons name="hardware-chip" size={20} color="#fff" />
          </LinearGradient>
          <Text style={styles.headerTitle}>Mesajlar</Text>
        </View>
        <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="create-outline" size={22} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator color={Colors.primary} style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(c) => c.id}
          renderItem={({ item }) => {
            const other = getOther(item);
            const initial = other.name[0]?.toUpperCase() ?? '?';
            return (
              <TouchableOpacity
                style={styles.chatItem}
                onPress={() =>
                  navigation.navigate(Routes.ChatRoom, {
                    chatId: item.id,
                    name: other.name,
                  })
                }
                activeOpacity={0.8}
              >
                <LinearGradient colors={GRADIENT} style={styles.avatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Text style={styles.avatarText}>{initial}</Text>
                </LinearGradient>
                <View style={styles.info}>
                  <Text style={styles.name}>{other.name}</Text>
                  <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.outlineVariant} />
              </TouchableOpacity>
            );
          }}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={EmptyState}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },

  list: { flexGrow: 1 },

  chatItem: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: Colors.surfaceLowest,
  },
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { fontSize: 20, fontWeight: '800', color: '#fff' },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  date: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
  sep: { height: 1, backgroundColor: Colors.borderLight, marginLeft: 86 },

  // Empty state
  emptyContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 32, paddingTop: 60, paddingBottom: 60, gap: 24,
  },
  emptyIllustration: {
    width: 240, height: 240, alignItems: 'center', justifyContent: 'center',
  },
  emptyAura: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: Colors.primary + '0D', borderRadius: 120,
  },
  emptyCardBg: {
    position: 'absolute', width: 200, height: 200,
    backgroundColor: Colors.surfaceLowest, borderRadius: 16,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.06, shadowRadius: 40, elevation: 3,
    transform: [{ rotate: '-6deg' }],
  },
  emptyMainCard: {
    width: 180, height: 180, backgroundColor: Colors.surfaceLowest, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', gap: 12,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.08, shadowRadius: 40, elevation: 4,
    transform: [{ rotate: '3deg' }],
  },
  emptyBubbleBadge: {
    position: 'absolute', top: -16, right: -8,
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: Colors.tertiaryContainer,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.tertiary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 4,
  },
  emptyRobotIcon: {
    width: 88, height: 88, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  emptyLabel: {
    backgroundColor: Colors.surfaceLow, borderRadius: 999,
    paddingHorizontal: 14, paddingVertical: 5,
  },
  emptyLabelText: { fontSize: 9, fontWeight: '800', color: Colors.outlineVariant, textTransform: 'uppercase', letterSpacing: 2 },
  emptyFloat1: {
    position: 'absolute', bottom: 16, left: 8,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.secondaryContainer + '80',
  },
  emptyFloat2: {
    position: 'absolute', top: 24, left: 24,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: Colors.gradientEnd,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 3,
  },
  emptyTitle: { fontSize: 26, fontWeight: '700', color: Colors.textPrimary, textAlign: 'center', letterSpacing: -0.5 },
  emptySub: { fontSize: 15, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24 },
  emptyCtaWrap: { width: '100%', borderRadius: 999, overflow: 'hidden' },
  emptyCta: {
    height: 60, borderRadius: 999, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 4,
  },
  emptyCtaText: { fontSize: 17, fontWeight: '600', color: '#fff' },
});
