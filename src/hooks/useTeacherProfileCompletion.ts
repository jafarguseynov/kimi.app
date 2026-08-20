import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '../store/user.store';
import {
  getTeacherCompletion,
  type TeacherCompletionState,
  type CompletionField,
} from '../api/teacherProfile.api';

export type CompletionItem = CompletionField & { key: string; label: string; done: boolean };

export interface TeacherProfileCompletion {
  pct: number;
  items: CompletionItem[];
  /** Yalnız məcburi + tamamlanmamış (§6 "çatışmayan məlumatlar"). */
  missing: CompletionItem[];
  nextStep?: CompletionItem;
  complete: boolean;
  state: TeacherCompletionState | null;
  isLoading: boolean;
  refresh: () => void;
}

export const TEACHER_COMPLETION_KEY = ['teacher-profile-completion'] as const;

/**
 * Müəllim profilinin tamamlanma vəziyyəti.
 *
 * ⚠️ Hesablama SERVERDƏDİR — mobil, veb və admin eyni rəqəmi görür (§25).
 * Əvvəllər bu hook 6 sahəni özü sayırdı və backend qaydası dəyişəndə
 * mobil fərqli faiz göstərirdi; indi tək mənbə `/teacher-profile/completion`.
 */
export function useTeacherProfileCompletion(): TeacherProfileCompletion {
  const user = useUserStore((s) => s.user);
  const qc = useQueryClient();
  const isTeacher = user?.role === 'teacher';

  const { data, isLoading } = useQuery({
    queryKey: TEACHER_COMPLETION_KEY,
    queryFn: getTeacherCompletion,
    enabled: isTeacher,
    staleTime: 30_000,
  });

  const items = (data?.fields ?? []) as CompletionItem[];
  const missing = (data?.missing ?? []) as CompletionItem[];

  return {
    pct: data?.pct ?? 0,
    items,
    missing,
    nextStep: (data?.nextStep ?? undefined) as CompletionItem | undefined,
    // Məlumat gəlməyibsə "tam" saymırıq — yanlış 100% göstərməkdənsə
    // kartı göstərmək daha az zərərlidir.
    complete: data?.complete ?? false,
    state: data ?? null,
    isLoading,
    refresh: () => { qc.invalidateQueries({ queryKey: TEACHER_COMPLETION_KEY }); },
  };
}

/** Profil dəyişdikdən sonra faizi dərhal yeniləmək üçün (§33). */
export function invalidateTeacherCompletion(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: TEACHER_COMPLETION_KEY });
}
