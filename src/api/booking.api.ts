import api from './client';

export interface TeacherSlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface Booking {
  id: string;
  scheduledAt: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  subject?: string;
  note?: string;
  duration: number;
  teacher?: { id: string; name: string; email: string };
  student?: { id: string; name: string; email: string };
}

export const getTeacherSlots = (teacherId: string) =>
  api.get<TeacherSlot[]>(`/booking/slots/${teacherId}`).then((r) => r.data);

export const createBooking = (data: {
  teacherId: string;
  scheduledAt: string;
  subject?: string;
  note?: string;
}) => api.post<Booking>('/booking/create', data).then((r) => r.data);

export const getStudentBookings = () =>
  api.get<Booking[]>('/booking/history').then((r) => r.data);

export const getTeacherBookings = () =>
  api.get<Booking[]>('/booking/teacher').then((r) => r.data);

export const confirmBooking = (id: string) =>
  api.put<Booking>(`/booking/${id}/confirm`).then((r) => r.data);

export const cancelBooking = (id: string) =>
  api.put<Booking>(`/booking/${id}/cancel`).then((r) => r.data);

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  student?: { id: string; name: string };
  createdAt: string;
}

export const getTeacherReviews = (teacherId: string) =>
  api.get<Review[]>(`/booking/reviews/${teacherId}`).then((r) => r.data);

export const submitReview = (bookingId: string, data: { rating: number; comment?: string }) =>
  api.post<void>(`/booking/review/${bookingId}`, data).then((r) => r.data);
