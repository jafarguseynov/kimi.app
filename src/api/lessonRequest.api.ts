import client from './client';

export interface PublicLessonRequest {
  id: string;
  studentName: string;
  subject: string;
  grade?: string;
  topic?: string;
  format?: string;
  frequency?: number;
  /** Şagirdin şəhəri — sorğu yaradılanda profilindən götürülür. */
  city?: string | null;
  /** Aylıq büdcə (AZN). null = şagird qeyd etməyib. */
  budget?: number | null;
  note?: string;
  interestedCount: number;
  createdAt: string;
}

/** §6 — serverdə hesablanmış uyğunluqla gələn sorğu. */
export interface MatchedLessonRequest extends PublicLessonRequest {
  matchScore: number;
  matchReasons: string[];
  alreadyInterested: boolean;
}

export interface MatchedRequestsResponse {
  /** Uyğun sorğuların ÜMUMİ sayı (kartda göstərilən limitdən çox ola bilər). */
  total: number;
  items: MatchedLessonRequest[];
}

export interface CreateLessonRequestPayload {
  subject: string;
  grade?: string;
  topic?: string;
  format?: string;
  frequency?: number;
  budget?: number;
  note?: string;
}

export const createLessonRequest = (data: CreateLessonRequestPayload) =>
  client.post('/lesson-request', data).then((r) => r.data);

export const listOpenRequests = (): Promise<PublicLessonRequest[]> =>
  client.get('/lesson-request').then((r) => r.data);

/**
 * Müəllimə UYĞUN açıq sorğular (§5/§6).
 * Uyğunluğu server hesablayır — burada heç bir filtr göndərilmir.
 */
export const listMatchedRequests = (limit = 20): Promise<MatchedRequestsResponse> =>
  client.get('/lesson-request/matched', { params: { limit } }).then((r) => r.data);

export interface MyLessonRequest {
  id: string;
  subject: string;
  grade?: string;
  topic?: string;
  note?: string;
  status: string;
  interestedCount: number;
  interestedTeachers: { id: string; name: string }[];
  createdAt: string;
}

export const listMyRequests = (): Promise<MyLessonRequest[]> =>
  client.get('/lesson-request/mine').then((r) => r.data);

export const expressInterest = (id: string) =>
  client.post(`/lesson-request/${id}/interest`).then((r) => r.data);

/**
 * «Müəllimimi tapdım» — sorğu sahibi sorğunu bağlayır.
 * Bağlanan sorğu açıq siyahıdan və müəllim uyğunluğundan dərhal çıxır.
 * `teacherId` göndərilsə, seçilən müəllimə ayrıca bildiriş gedir.
 */
export const closeMyRequest = (id: string, teacherId?: string) =>
  client
    .post<{ success: boolean; status: string }>(`/lesson-request/${id}/close`, { teacherId })
    .then((r) => r.data);
