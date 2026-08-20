import apiClient from './client';

export interface Specialization {
  id: string;
  name: string;
  /**
   * Admin paneldən yüklənmiş ikon şəkli. Boş/null ola bilər — o halda tətbiq
   * öz daxili vektor ikonunu göstərir (bax: HomeScreen `SubjectIconView`).
   */
  iconUrl?: string | null;
}

export const getSpecializations = () =>
  apiClient.get<Specialization[]>('/specializations').then((r) => r.data);
