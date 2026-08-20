import apiClient from './client';

/**
 * Şagird profilinin tamamlanması.
 *
 * ⚠️ Faiz və "nə çatışır" siyahısı SERVERDƏ hesablanır (müəllim tərəfindəki
 * məntiqin eynisi) — mobil yalnız göstərir. Beləcə tələblər dəyişəndə OTA
 * lazım olmur.
 */

export type StudentFieldKey =
  | 'school' | 'grade' | 'gender' | 'birthDate' | 'city' | 'avatar' | 'goal';

export interface StudentCompletionField {
  key: StudentFieldKey;
  label: string;
  hint: string;
  required: boolean;
  weight: number;
  done: boolean;
  /** 'avatar' → şəkil seçimi, 'editProfile' → profil redaktəsi */
  editTarget: string;
}

export interface StudentCompletionState {
  pct: number;
  complete: boolean;
  /** Yalnız məcburi sahələr dolubmu. */
  requiredComplete: boolean;
  fields: StudentCompletionField[];
  missing: StudentCompletionField[];
  nextStep: StudentCompletionField | null;
  totalCount: number;
  doneCount: number;
}

export const getStudentCompletion = () =>
  apiClient.get<StudentCompletionState>('/profile/completion').then((r) => r.data);

/** Kart və redaktə ekranı eyni keşi paylaşır — saxlandıqdan sonra dərhal yenilənir. */
export const STUDENT_COMPLETION_KEY = ['studentCompletion'] as const;
