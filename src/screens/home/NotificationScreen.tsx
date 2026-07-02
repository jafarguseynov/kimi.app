import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';
import { useNotifications, useMarkRead, useMarkAllRead } from '../../hooks/useFeed';
import { NotificationItem } from '../../api/notification.api';
import { formatDate } from '../../utils/formatters';
import { useTranslation } from '../../i18n';

type IconName = keyof typeof Ionicons.glyphMap;

function getNotifMeta(item: NotificationItem): { icon: IconName; iconColor: string; iconBg: string } {
  const title = (item.title ?? '').toLowerCase();
  if (title.includes('imtahan')) return { icon: 'clipboard-outline', iconColor: Colors.primary, iconBg: Colors.primaryLight };
  if (title.includes('yarış') || title.includes('medal') || title.includes('liqa')) return { icon: 'ribbon-outline', iconColor: Colors.tertiary, iconBg: '#e8fdf3' };
  if (title.includes('bonus') || title.includes('referal') || title.includes('hədiyyə')) return { icon: 'gift-outline', iconColor: Colors.secondary, iconBg: Colors.secondaryContainer };
  if (title.includes('cavab') || title.includes('müəllim')) return { icon: 'chatbubble-outline', iconColor: Colors.textSecondary, iconBg: Colors.surfaceLow };
  if (title.includes('dərs') || title.includes('tələb')) return { icon: 'checkmark-circle-outline', iconColor: Colors.textSecondary, iconBg: Colors.surfaceLow };
  return { icon: 'notifications-outline', iconColor: Colors.primary, iconBg: Colors.primaryLight };
}

function NotifCard({ item, onRead }: { item: NotificationItem; onRead: (id: string) => void }) {
  const meta = getNotifMeta(item);
  return (
    <TouchableOpacity
      style={[styles.card, item.isRead ? styles.cardRead : styles.cardUnread]}
      onPress={() => !item.isRead && onRead(item.id)}
      activeOpacity={0.8}
    >
      <View style={[styles.cardRow, item.isRead && { opacity: 0.6 }]}>
        <View style={[styles.iconBox, { backgroundColor: meta.iconBg }]}>
          <Ionicons name={meta.icon} size={24} color={meta.iconColor} />
        </View>
        <View style={styles.cardContent}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            {!item.isRead && <View style={styles.dot} />}
          </View>
          <Text style={styles.cardBody}>{item.body}</Text>
          <View style={styles.timeRow}>
            <Ionicons name="time-outline" size={13} color={Colors.outline} />
            <Text style={styles.cardTime}>{formatDate(item.createdAt)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function NotificationScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { data: rawNotifications = [], isLoading } = useNotifications();
  // Çat mesajlarını feed-dən çıxar (başlıq "💬 ..."). Söhbətlər yalnız Mesajlar
  // bölməsində olmalıdır; backend artıq yenilərini saxlamır, bu köhnələri də gizlədir.
  const notifications = rawNotifications.filter((n) => !(n.title ?? '').startsWith('💬'));
  const { mutate: markRead } = useMarkRead();
  const { mutate: markAll } = useMarkAllRead();

  const unread = notifications.filter((n) => !n.isRead).length;

  const openMenu = () => {
    Alert.alert(
      t('notif.title'),
      t('notif.menuMsg'),
      [
        {
          text: t('notif.markAllRead'),
          onPress: () => markAll(),
        },
        {
          text: t('notif.settings'),
          onPress: () => navigation.navigate(Routes.NotificationSettings),
        },
        { text: t('notif.cancel'), style: 'cancel' },
      ],
      { cancelable: true },
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.7} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('notif.title')}</Text>
        </View>
        <TouchableOpacity style={styles.headerBtn} onPress={openMenu} activeOpacity={0.7} hitSlop={8}>
          <Ionicons name="ellipsis-vertical" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator color={Colors.primary} style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <NotifCard item={item} onRead={markRead} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.greeting}>
              <Text style={styles.greetingTitle}>{t('notif.greeting')}</Text>
              <Text style={styles.greetingSub}>
                {unread > 0
                  ? t('notif.unreadSub', { n: unread })
                  : t('notif.allRead')}
              </Text>
            </View>
          }
          ListFooterComponent={
            notifications.length > 0 ? (
              <View style={styles.footer}>
                <Text style={styles.footerText}>{t('notif.noOlder')}</Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIllustration}>
                <View style={styles.emptyAura} />
                <View style={styles.emptyCard}>
                  <View style={styles.emptyBellFloat}>
                    <Ionicons name="notifications-off-outline" size={20} color={Colors.primary + '66'} />
                  </View>
                  <LinearGradient
                    colors={[Colors.gradientStart, Colors.gradientEnd]}
                    style={styles.emptyIconBg}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons name="notifications-outline" size={48} color="#fff" />
                  </LinearGradient>
                  <View style={styles.emptyBadge}>
                    <Text style={styles.emptyBadgeText}>{t('notif.emptyBadge')}</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.emptyTitle}>{t('notif.emptyTitle')}</Text>
              <Text style={styles.emptySub}>
                {t('notif.emptySub')}
              </Text>
            </View>
          }
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },

  list: { paddingHorizontal: 24, paddingBottom: 40 },

  greeting: { marginBottom: 24, paddingTop: 32, alignItems: 'center', gap: 6 },
  greetingTitle: { fontSize: 28, fontWeight: '800', color: Colors.textPrimary },
  greetingSub: { fontSize: 16, fontWeight: '500', color: Colors.textSecondary, textAlign: 'center' },

  card: {
    borderRadius: 20, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04, shadowRadius: 16, elevation: 1,
  },
  cardUnread: { backgroundColor: Colors.surfaceLowest },
  cardRead: { backgroundColor: Colors.surfaceLow + 'AA' },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  iconBox: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardContent: { flex: 1 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, flex: 1 },
  dot: {
    width: 9, height: 9, borderRadius: 4.5,
    backgroundColor: Colors.primary, marginLeft: 8, flexShrink: 0,
  },
  cardBody: { fontSize: 14, color: Colors.textSecondary, lineHeight: 21 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10 },
  cardTime: { fontSize: 11, fontWeight: '600', color: Colors.outline, textTransform: 'uppercase', letterSpacing: 0.5 },

  footer: { paddingTop: 40, paddingBottom: 20, alignItems: 'center' },
  footerText: { fontSize: 11, fontWeight: '700', color: Colors.textLight, textTransform: 'uppercase', letterSpacing: 1.2 },

  empty: { alignItems: 'center', paddingTop: 40, paddingHorizontal: 32, gap: 20 },
  emptyIllustration: {
    width: 200, height: 200, alignItems: 'center', justifyContent: 'center',
  },
  emptyAura: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: Colors.primary + '0A', borderRadius: 100,
  },
  emptyCard: {
    width: 160, height: 160, backgroundColor: Colors.surfaceLowest, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', gap: 12,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.06, shadowRadius: 32, elevation: 3,
  },
  emptyBellFloat: {
    position: 'absolute', top: -10, right: -10,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  emptyIconBg: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  emptyBadge: {
    backgroundColor: Colors.surfaceLow, borderRadius: 999,
    paddingHorizontal: 12, paddingVertical: 4,
  },
  emptyBadgeText: { fontSize: 9, fontWeight: '800', color: Colors.outlineVariant, textTransform: 'uppercase', letterSpacing: 1.5 },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, textAlign: 'center', letterSpacing: -0.3 },
  emptySub: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
});
