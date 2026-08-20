import apiClient from './client';

/**
 * Müəllim profilinin tamamlanması və yayımlanması.
 *
 * ⚠️ Faiz, status və "yayımlana bilər?" qərarı BURADA hesablanmır —
 * hamısı serverdən gəlir. Müştəri özü 100% olduğunu iddia edə bilmir (§31).
 */

export type ProfileSection =
  | 'photo' | 'basic' | 'about' | 'education'
  | 'experience' | 'teaching' | 'format' | 'location';

export type TeacherProfileStatus =
  | 'draft' | 'incomplete' | 'ready' | 'published' | 'unpublished' | 'suspended';

export type CompletionLevel = 'low' | 'medium' | 'high' | 'complete';

export interface CompletionField {
  key: string;
  label: string;
  hint: string;
  section: ProfileSection;
  sectionLabel: string;
  required: boolean;
  weight: number;
  done: boolean;
  /** 'avatar' → şəkil seçimi, 'editProfile' → profil redaktəsi */
  editTarget: string;
}

export interface CompletionSection {
  key: ProfileSection;
  label: string;
  done: boolean;
  total: number;
  completed: number;
}

export interface TeacherCompletionState {
  pct: number;
  complete: boolean;
  level: CompletionLevel;
  levelLabel: string;
  status: TeacherProfileStatus;
  publiclyVisible: boolean;
  canPublish: boolean;
  inGrace: boolean;
  graceUntil: string | null;
  fields: CompletionField[];
  missing: CompletionField[];
  sections: CompletionSection[];
  remainingSections: number;
  nextStep: CompletionField | null;
  publishedAt: string | null;
  messages: { incomplete: string; motivation: string; published: string };
}

export const getTeacherCompletion = () =>
  apiClient.get<TeacherCompletionState>('/teacher-profile/completion').then((r) => r.data);

export const publishTeacherProfile = () =>
  apiClient.post<TeacherCompletionState>('/teacher-profile/publish').then((r) => r.data);

export const unpublishTeacherProfile = () =>
  apiClient.post<TeacherCompletionState>('/teacher-profile/unpublish').then((r) => r.data);

/** Backend `PROFILE_INCOMPLETE` xətası — yayımlama rədd ediləndə (§14). */
export interface IncompleteError {
  error: 'PROFILE_INCOMPLETE';
  message: string;
  pct: number;
  missing: { key: string; label: string; hint: string; section: ProfileSection }[];
}

export function asIncompleteError(err: any): IncompleteError | null {
  const data = err?.response?.data;
  if (data?.error === 'PROFILE_INCOMPLETE') return data as IncompleteError;
  // Nest bəzən cavabı `message` obyektinin içinə yerləşdirir.
  if (data?.message?.error === 'PROFILE_INCOMPLETE') return data.message as IncompleteError;
  return null;
}
