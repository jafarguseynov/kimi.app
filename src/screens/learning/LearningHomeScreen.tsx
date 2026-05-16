import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getSubjects, getFlashcards } from '../../api/learning.api';
import { useLearningStore } from '../../store/learning.store';
import { Colors } from '../../constants/colors';
import { Routes } from '../../constants/routes';

type Props = { navigation: NativeStackNavigationProp<any> };

const SUBJECT_ICONS: Record<string, string> = {
  Riyaziyyat: '🔢',
  Fizika: '⚛️',
  Kimya: '🧪',
  Biologiya: '🧬',
  Tarix: '📜',
  Coğrafiya: '🌍',
  İngilis: '🇬🇧',
  default: '📚',
};

export default function LearningHomeScreen({ navigation }: Props) {
  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: getSubjects,
  });
  const setCards = useLearningStore((s) => s.setCards);

  const startSession = async (subject: string) => {
    const cards = await getFlashcards(subject);
    if (cards.length === 0) return;
    setCards(cards, subject);
    navigation.navigate(Routes.FlashcardSession);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Öyrən</Text>
        <Text style={styles.subtitle}>Hansı mövzunu öyrənmək istəyirsən?</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={subjects}
          keyExtractor={(s) => s}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.subjectCard}
              onPress={() => startSession(item)}
              activeOpacity={0.8}
            >
              <Text style={styles.subjectIcon}>{SUBJECT_ICONS[item] ?? SUBJECT_ICONS.default}</Text>
              <Text style={styles.subjectName}>{item}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Hələ mövzu yoxdur</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { padding: 20, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: 15, color: Colors.textSecondary, marginTop: 4 },
  list: { padding: 16 },
  row: { gap: 12, marginBottom: 12 },
  subjectCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  subjectIcon: { fontSize: 36, marginBottom: 10 },
  subjectName: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: Colors.textMuted, fontSize: 15 },
});
