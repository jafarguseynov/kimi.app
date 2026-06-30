import { storage, STORAGE_KEYS } from './storage';
import { submitExam } from '../../api/exam.api';
import { submitCollectionTest } from '../../api/examCollection.api';
import { ExamResult } from '../../types/exam.types';

/**
 * Offline submit növbəsi.
 * İmtahan offline bitirilirsə cavablar diskə yazılır; internet qayıdanda
 * avtomatik göndərilir və nəticə (bal) hesablanır.
 */
export interface QueuedExam {
  localId: string;            // unikal yerli id (dedup üçün)
  kind: 'exam' | 'collection';
  examId: string;             // adi imtahan id-si (kind='exam')
  collectionId?: string;      // kolleksiya id-si (kind='collection')
  questionIds?: string[];     // kolleksiya üçün verilmiş suallar
  answers: Record<string, string>;
  timeSpent: number;
  type?: 'practice' | 'monthly' | 'national' | 'live';
  title?: string;             // istifadəçiyə göstərmək üçün
  queuedAt: number;
}

type ResultHandler = (result: ExamResult, item: QueuedExam) => void;

let onResultReady: ResultHandler | null = null;
export function setOnResultReady(cb: ResultHandler) {
  onResultReady = cb;
}

async function readQueue(): Promise<QueuedExam[]> {
  return (await storage.get<QueuedExam[]>(STORAGE_KEYS.examQueue)) ?? [];
}

async function writeQueue(items: QueuedExam[]): Promise<void> {
  await storage.set(STORAGE_KEYS.examQueue, items);
}

/** Növbəyə əlavə et (offline submit). */
export async function enqueueExam(item: QueuedExam): Promise<void> {
  const q = await readQueue();
  if (q.some((x) => x.localId === item.localId)) return;
  q.push(item);
  await writeQueue(q);
}

export async function getQueue(): Promise<QueuedExam[]> {
  return readQueue();
}

export async function hasPending(): Promise<boolean> {
  return (await readQueue()).length > 0;
}

let flushing = false;

/** Növbəni boşalt — hər elementi göndər; uğurlu olanları çıxar. */
export async function flushQueue(): Promise<void> {
  if (flushing) return;
  flushing = true;
  try {
    let q = await readQueue();
    if (q.length === 0) return;

    for (const item of [...q]) {
      try {
        const result =
          item.kind === 'collection' && item.collectionId
            ? await submitCollectionTest(item.collectionId, item.questionIds ?? [], item.answers, item.timeSpent)
            : await submitExam(item.examId, item.answers, item.timeSpent, item.type);

        // uğurlu — növbədən çıxar və nəticəni bildir
        q = q.filter((x) => x.localId !== item.localId);
        await writeQueue(q);
        onResultReady?.(result, item);
      } catch (err: any) {
        const status = err?.response?.status;
        // Şəbəkə xətası / server 5xx → keçici, sonra yenidən cəhd (növbədə qalır).
        if (!err?.response || (typeof status === 'number' && status >= 500)) {
          break;
        }
        // Daimi müştəri xətası (4xx, məs. sessiya/exam tapılmadı) → sonsuz təkrar olmasın, çıxar.
        q = q.filter((x) => x.localId !== item.localId);
        await writeQueue(q);
      }
    }
  } finally {
    flushing = false;
  }
}
