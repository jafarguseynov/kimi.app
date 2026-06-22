import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../../api/client';
import { Colors } from '../../constants/colors';
import { useTranslation } from '../../i18n';

interface SchoolData {
  id: string;
  name: string;
  code: string;
  memberCount: number;
}

export default function SchoolScreen() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<'join' | 'create'>('join');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const qc = useQueryClient();

  const { data: school, isLoading } = useQuery<SchoolData | null>({
    queryKey: ['mySchool'],
    queryFn: async () => {
      const res = await client.get('/school/my');
      return res.data;
    },
  });

  const { mutate: join, isPending: joining } = useMutation({
    mutationFn: async () => client.post('/school/join', { code }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mySchool'] });
      setCode('');
    },
    onError: (e: any) => Alert.alert(t('school.errorTitle'), e.response?.data?.message ?? t('school.errorBody')),
  });

  const { mutate: create, isPending: creating } = useMutation({
    mutationFn: async () => client.post('/school/create', { name }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mySchool'] });
      setName('');
    },
    onError: (e: any) => Alert.alert(t('school.errorTitle'), e.response?.data?.message ?? t('school.errorBody')),
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  if (school) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('school.myTitle')}</Text>
        </View>
        <View style={styles.schoolCard}>
          <Text style={styles.schoolIcon}>🏫</Text>
          <Text style={styles.schoolName}>{school.name}</Text>
          <View style={styles.codeRow}>
            <Text style={styles.codeLabel}>{t('school.codeLabel')}</Text>
            <Text style={styles.codeValue}>{school.code}</Text>
          </View>
          <Text style={styles.members}>{t('school.members', { count: school.memberCount })}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('school.title')}</Text>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'join' && styles.tabActive]}
          onPress={() => setTab('join')}
        >
          <Text style={[styles.tabText, tab === 'join' && styles.tabTextActive]}>{t('school.tabJoin')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'create' && styles.tabActive]}
          onPress={() => setTab('create')}
        >
          <Text style={[styles.tabText, tab === 'create' && styles.tabTextActive]}>{t('school.tabCreate')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        {tab === 'join' ? (
          <>
            <Text style={styles.label}>{t('school.codeFieldLabel')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('school.codePlaceholder')}
              placeholderTextColor={Colors.textMuted}
              value={code}
              onChangeText={setCode}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={[styles.btn, joining && { opacity: 0.6 }]}
              onPress={() => join()}
              disabled={joining || code.trim().length < 4}
            >
              <Text style={styles.btnText}>{joining ? t('school.joining') : t('school.join')}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.label}>{t('school.nameFieldLabel')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('school.namePlaceholder')}
              placeholderTextColor={Colors.textMuted}
              value={name}
              onChangeText={setName}
            />
            <TouchableOpacity
              style={[styles.btn, creating && { opacity: 0.6 }]}
              onPress={() => create()}
              disabled={creating || name.trim().length < 3}
            >
              <Text style={styles.btnText}>{creating ? t('school.creating') : t('school.create')}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 20, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },
  schoolCard: {
    margin: 20,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  schoolIcon: { fontSize: 48, marginBottom: 12 },
  schoolName: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, marginBottom: 12 },
  codeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  codeLabel: { fontSize: 14, color: Colors.textSecondary },
  codeValue: { fontSize: 18, fontWeight: '900', color: Colors.primary, letterSpacing: 2 },
  members: { fontSize: 14, color: Colors.textMuted },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
  tabTextActive: { color: '#fff' },
  form: { paddingHorizontal: 20 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginBottom: 8 },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    fontSize: 16,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  btn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
