import client from './client';

export interface Certificate {
  id: string;
  examId: string;
  examTitle: string;
  score: number;
  total: number;
  percentage: number;
  issuedAt: string;
}

export const getCertificates = (): Promise<Certificate[]> =>
  client.get('/exam/certificates').then(r => r.data);

export const getCertificate = (examId: string): Promise<Certificate> =>
  client.get(`/exam/certificate/${examId}`).then(r => r.data);
