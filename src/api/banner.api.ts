import client from './client';

export interface Banner {
  id: string;
  imageUrl: string;
  title: string | null;
  linkUrl: string | null;
  placement: string;
  sortOrder: number;
  isActive: boolean;
}

export const getBanners = (placement = 'home'): Promise<Banner[]> =>
  client.get('/banners', { params: { placement } }).then((r) => r.data);
