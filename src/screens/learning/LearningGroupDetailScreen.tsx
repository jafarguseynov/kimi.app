import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { Colors } from '../../constants/colors';
import { useUserStore } from '../../store/user.store';
import { useTranslation } from '../../i18n';

const GRADIENT: [string, string] = [Colors.gradientStart, Colors.gradientEnd];

type Tab = 'chat' | 'materials' | 'members';

type Message = {
  id: string;
  authorName: string;
  authorInitials: string;
  authorColor: string;
  text: string;
  time: string;
  isMine?: boolean;
};

type Material = {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'link' | 'note';
  meta: string;
};

type Member = {
  id: string;
  name: string;
  initials: string;
  color: string;
  role: string;
  online: boolean;
};

const SEED_MESSAGES: Message[] = [
  { id: 'm1', authorName: 'Aysu Q.', authorInitials: 'AQ', authorColor: '#F59E0B', text: 'Salam hamıya! Bu gün hansı mövzunu müzakirə edək?', time: '10:02' },
  { id: 'm2', authorName: 'Murad H.', authorInitials: 'MH', authorColor: '#16A34A', text: 'Dünən kvadrat tənliklərə baxırdım, diskriminantı tam başa düşmədim 🤔', time: '10:05' },
  { id: 'm3', authorName: 'Leyla Ə.', authorInitials: 'LƏ', authorColor: Colors.primary, text: 'D = b² − 4ac. Müsbətdirsə 2 kök, sıfırdırsa 1, mənfidirsə həqiqi kök yoxdur.', time: '10:07' },
  { id: 'm4', authorName: 'Murad H.', authorInitials: 'MH', authorColor: '#16A34A', text: 'Çoox sağ ol! İndi aydındır 👍', time: '10:08' },
  { id: 'm5', authorName: 'Kamran T.', authorInitials: 'KT', authorColor: '#DB2777', text: 'Sabah olimpiada sınağı keçirək? Sual paylaşaram', time: '10:14' },
];

const SEED_MATERIALS: Material[] = [
  { id: 'r1', title: 'Kvadrat tənliklər — qısa konspekt', type: 'pdf', meta: 'PDF · 12 səhifə · 2.4 MB' },
  { id: 'r2', title: 'Diskriminant izahı (video)', type: 'video', meta: 'Video · 8:42 dəq' },
  { id: 'r3', title: 'Khan Academy — Quadratic basics', type: 'link', meta: 'Xarici link · khanacademy.org' },
  { id: 'r4', title: 'Həftəlik test (15 sual)', type: 'note', meta: 'Qısa qeyd · 5 dəq' },
  { id: 'r5', title: 'Olimpiada hazırlığı toplu', type: 'pdf', meta: 'PDF · 48 səhifə · 8.1 MB' },
];

const SEED_MEMBERS: Member[] = [
  { id: 'u1', name: 'Aysu Quliyeva', initials: 'AQ', color: '#F59E0B', role: 'Moderator', online: true },
  { id: 'u2', name: 'Leyla Əliyeva', initials: 'LƏ', color: Colors.primary, role: 'Üzv · LVL 14', online: true },
  { id: 'u3', name: 'Murad Həsənov', initials: 'MH', color: '#16A34A', role: 'Üzv · LVL 11', online: true },
  { id: 'u4', name: 'Kamran Talıbov', initials: 'KT', color: '#DB2777', role: 'Üzv · LVL 9', online: true },
  { id: 'u5', name: 'Nigar Mahmudova', initials: 'NM', color: '#0EA5E9', role: 'Üzv · LVL 16', online: false },
  { id: 'u6', name: 'Rəşad İsmayılov', initials: 'Rİ', color: '#7C3AED', role: 'Üzv · LVL 8', online: false },
];

export default function LearningGroupDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useTranslation();
  const { user } = useUserStore();
  const params = (route.params ?? {}) as {
    groupId: string;
    title: string;
    members?: number;
    online?: number;
    level?: string;
    isChallenge?: boolean;
  };

  const [tab, setTab] = useState<Tab>('chat');
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<Message[]>(SEED_MESSAGES);
  const listRef = useRef<FlatList<Message>>(null);

  const myName = user?.name ?? t('learning.you');
  const myInitials = myName
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    const msg: Message = {
      id: `me-${Date.now()}`,
      authorName: myName,
      authorInitials: myInitials,
      authorColor: Colors.primary,
      text,
      time: new Date().toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' }),
      isMine: true,
    };
    setMessages((prev) => [...prev, msg]);
    setDraft('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
  };

  const openMaterial = (m: Material) => {
    Alert.alert(m.title, `${m.meta}\n\n${t('learning.materialDemoMsg')}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()} hitSlop={8} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={Colors.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.headerTitle} numberOfLines={1}>{params.title}</Text>
          <Text style={styles.headerSub}>
            {t('learning.membersN', { n: (params.members ?? 0) + 1 })}
            {params.online != null && params.online > 0 ? t('learning.onlineSuffix', { n: params.online }) : ''}
          </Text>
        </View>
        <TouchableOpacity style={styles.iconBtn} hitSlop={8} activeOpacity={0.7}
          onPress={() => Alert.alert(t('learning.groupSettings'), t('learning.groupSettingsMsg'))}
        >
          <Ionicons name="ellipsis-vertical" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {(['chat', 'materials', 'members'] as Tab[]).map((tb) => {
          const labels = { chat: t('learning.tabChat'), materials: t('learning.tabMaterials'), members: t('learning.tabMembers') };
          const counts = { chat: messages.length, materials: SEED_MATERIALS.length, members: SEED_MEMBERS.length + 1 };
          const active = tab === tb;
          return (
            <TouchableOpacity key={tb} style={styles.tab} activeOpacity={0.8} onPress={() => setTab(tb)}>
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {labels[tb]} <Text style={[styles.tabCount, active && { color: Colors.primary }]}>{counts[tb]}</Text>
              </Text>
              {active && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Body */}
      {tab === 'chat' && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            contentContainerStyle={styles.chatList}
            renderItem={({ item }) => (
              <View style={[styles.msgRow, item.isMine && styles.msgRowMine]}>
                {!item.isMine && (
                  <View style={[styles.msgAvatar, { backgroundColor: item.authorColor }]}>
                    <Text style={styles.msgAvatarText}>{item.authorInitials}</Text>
                  </View>
                )}
                <View style={[styles.msgBubble, item.isMine && styles.msgBubbleMine]}>
                  {!item.isMine && <Text style={[styles.msgAuthor, { color: item.authorColor }]}>{item.authorName}</Text>}
                  <Text style={[styles.msgText, item.isMine && { color: '#fff' }]}>{item.text}</Text>
                  <Text style={[styles.msgTime, item.isMine && { color: 'rgba(255,255,255,0.7)' }]}>{item.time}</Text>
                </View>
              </View>
            )}
          />
          <View style={styles.inputBar}>
            <TouchableOpacity style={styles.inputAttach} hitSlop={8}
              onPress={() => Alert.alert(t('learning.attachFile'), t('learning.attachFileMsg'))}
            >
              <Ionicons name="add" size={22} color={Colors.primary} />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              value={draft}
              onChangeText={setDraft}
              placeholder={t('learning.messagePlaceholder')}
              placeholderTextColor={Colors.textMuted}
              multiline
              returnKeyType="send"
              onSubmitEditing={send}
            />
            <TouchableOpacity
              style={[styles.sendBtn, !draft.trim() && { opacity: 0.4 }]}
              disabled={!draft.trim()}
              onPress={send}
              activeOpacity={0.85}
            >
              <LinearGradient colors={GRADIENT} style={styles.sendBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Ionicons name="send" size={16} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      {tab === 'materials' && (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
          {SEED_MATERIALS.map((m) => {
            const meta = MATERIAL_META[m.type];
            return (
              <TouchableOpacity key={m.id} style={styles.matRow} activeOpacity={0.85} onPress={() => openMaterial(m)}>
                <View style={[styles.matIcon, { backgroundColor: meta.bg }]}>
                  <Ionicons name={meta.icon} size={22} color={meta.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.matTitle}>{m.title}</Text>
                  <Text style={styles.matMeta}>{m.meta}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.outlineVariant} />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {tab === 'members' && (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
          <View style={styles.memberRow}>
            <View style={[styles.memberAvatar, { backgroundColor: Colors.primary }]}>
              <Text style={styles.memberAvatarText}>{myInitials}</Text>
              <View style={styles.onlineDot} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.memberName}>{myName} <Text style={styles.youTag}>{t('learning.youTag')}</Text></Text>
              <Text style={styles.memberRole}>{t('learning.justJoined')}</Text>
            </View>
          </View>
          {SEED_MEMBERS.map((u) => (
            <View key={u.id} style={styles.memberRow}>
              <View style={[styles.memberAvatar, { backgroundColor: u.color }]}>
                <Text style={styles.memberAvatarText}>{u.initials}</Text>
                {u.online && <View style={styles.onlineDot} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.memberName}>{u.name}</Text>
                <Text style={styles.memberRole}>{u.role}</Text>
              </View>
              <TouchableOpacity
                style={styles.memberAction}
                hitSlop={8}
                onPress={() => Alert.alert(u.name, t('learning.dmComingSoon'))}
              >
                <Ionicons name="chatbubble-outline" size={18} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const MATERIAL_META: Record<Material['type'], { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }> = {
  pdf: { icon: 'document-text', color: '#DC2626', bg: '#FEE2E2' },
  video: { icon: 'play-circle', color: '#7C3AED', bg: '#EDE9FE' },
  link: { icon: 'link', color: '#0EA5E9', bg: '#E0F2FE' },
  note: { icon: 'reader', color: '#F59E0B', bg: '#FEF3C7' },
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  iconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 15, fontWeight: '800', color: Colors.textPrimary },
  headerSub: { fontSize: 11, color: Colors.textSecondary, marginTop: 2, fontWeight: '600' },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  tabText: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary },
  tabTextActive: { color: Colors.primary },
  tabCount: { fontSize: 11, color: Colors.textMuted, fontWeight: '700' },
  tabUnderline: {
    position: 'absolute', bottom: 0, height: 2.5, width: 32,
    backgroundColor: Colors.primary, borderRadius: 2,
  },

  // Chat
  chatList: { padding: 16, gap: 12 },
  msgRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-end', maxWidth: '85%' },
  msgRowMine: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
  msgAvatar: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  msgAvatarText: { color: '#fff', fontWeight: '800', fontSize: 11 },
  msgBubble: {
    backgroundColor: '#fff',
    borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8, gap: 2,
    borderWidth: 1, borderColor: Colors.borderLight,
    maxWidth: '100%',
  },
  msgBubbleMine: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  msgAuthor: { fontSize: 11, fontWeight: '800' },
  msgText: { fontSize: 14, color: Colors.textPrimary, lineHeight: 19 },
  msgTime: { fontSize: 9, color: Colors.textMuted, alignSelf: 'flex-end', marginTop: 2, fontWeight: '600' },

  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: Colors.borderLight,
  },
  inputAttach: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.surfaceLow,
    alignItems: 'center', justifyContent: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surfaceLow,
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
    fontSize: 14, color: Colors.textPrimary, maxHeight: 100,
    minHeight: 36,
  },
  sendBtn: { borderRadius: 18 },
  sendBtnGrad: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },

  // Materials
  matRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff',
    borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  matIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  matTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  matMeta: { fontSize: 11, color: Colors.textSecondary, marginTop: 2, fontWeight: '600' },

  // Members
  memberRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff',
    borderRadius: 16, padding: 12,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  memberAvatar: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  memberAvatarText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  onlineDot: {
    position: 'absolute', right: -1, bottom: -1,
    width: 11, height: 11, borderRadius: 6,
    backgroundColor: '#16A34A',
    borderWidth: 2, borderColor: '#fff',
  },
  memberName: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  youTag: { fontSize: 11, color: Colors.primary, fontWeight: '700' },
  memberRole: { fontSize: 11, color: Colors.textSecondary, marginTop: 2, fontWeight: '600' },
  memberAction: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#EEF2FF',
    alignItems: 'center', justifyContent: 'center',
  },
});
