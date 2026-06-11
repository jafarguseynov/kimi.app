import apiClient from './client';

export interface Specialization {
  id: string;
  name: string;
}

export const getSpecializations = () =>
  apiClient.get<Specialization[]>('/specializations').then((r) => r.data);
