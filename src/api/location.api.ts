import apiClient from './client';

export type LocationType = 'region' | 'district' | 'settlement';

export interface LocationItem {
  id: string;
  name: string;
  type: LocationType;
  parentId: string | null;
}

export interface SchoolItem {
  id: string;
  name: string;
  code: string;
}

export const getLocations = (parentId?: string) =>
  apiClient
    .get<LocationItem[]>('/location', { params: parentId ? { parentId } : {} })
    .then((r) => r.data);

export const getSchoolsAt = (locationId: string) =>
  apiClient.get<SchoolItem[]>(`/location/${locationId}/schools`).then((r) => r.data);
