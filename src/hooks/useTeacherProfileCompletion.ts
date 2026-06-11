import { useUserStore } from '../store/user.store';

export interface CompletionItem {
  key: string;
  label: string;
  done: boolean;
}

export interface TeacherProfileCompletion {
  pct: number;
  items: CompletionItem[];
  nextStep?: CompletionItem;
  complete: boolean;
}

/**
 * Müəllim profilinin tamamlanma vəziyyəti — backend `computeCompletion` ilə eyni
 * 6 self-fillable element üzərində (verified admin-asılı olduğu üçün daxil deyil).
 * Tək mənbə: ProfileScreen, Home gate və setup ekranı bunu işlədir.
 */
export function useTeacherProfileCompletion(): TeacherProfileCompletion {
  const u = useUserStore((s) => s.user) as any;
  const items: CompletionItem[] = [
    { key: 'subjects', label: 'Fənlər', done: !!u?.subjects?.length },
    { key: 'hourlyRate', label: 'Dərs qiyməti', done: Number(u?.hourlyRate ?? 0) > 0 },
    { key: 'headline', label: 'Qısa təqdimat', done: !!u?.headline },
    { key: 'bio', label: 'Haqqımda', done: !!u?.bio },
    { key: 'introVideoUrl', label: 'Təqdimat videosu', done: !!u?.introVideoUrl },
    { key: 'offersFreeDemo', label: 'Pulsuz demo dərs', done: !!u?.offersFreeDemo },
  ];
  const doneCount = items.filter((i) => i.done).length;
  const pct = Math.round((doneCount / items.length) * 100);
  return {
    pct,
    items,
    nextStep: items.find((i) => !i.done),
    complete: doneCount === items.length,
  };
}
