import client from './client';

export interface PublicLessonRequest {
  id: string;
  studentName: string;
  subject: string;
  grade?: string;
  topic?: string;
  format?: string;
  frequency?: number;
  note?: string;
  interestedCount: number;
  createdAt: string;
}

export interface CreateLessonRequestPayload {
  subject: string;
  grade?: string;
  topic?: string;
  format?: string;
  frequency?: number;
  note?: string;
}

export const createLessonRequest = (data: CreateLessonRequestPayload) =>
  client.post('/lesson-request', data).then((r) => r.data);

export const listOpenRequests = (): Promise<PublicLessonRequest[]> =>
  client.get('/lesson-request').then((r) => r.data);

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
