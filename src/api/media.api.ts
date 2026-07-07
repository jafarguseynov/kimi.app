import apiClient from './client';

/**
 * Lokal şəkil URI-sini backend-ə (/media/upload) yükləyir və ictimai URL qaytarır.
 * S3 konfiqurasiya olunmayıbsa backend placeholder URL qaytara bilər — bu halda
 * çağıran tərəf lokal URI-yə fallback etməlidir.
 */
export const uploadImage = async (uri: string): Promise<string> => {
  const name = uri.split('/').pop() || `photo-${Date.now()}.jpg`;
  const match = /\.(\w+)$/.exec(name);
  const type = match ? `image/${match[1].toLowerCase() === 'jpg' ? 'jpeg' : match[1].toLowerCase()}` : 'image/jpeg';

  const form = new FormData();
  form.append('file', { uri, name, type } as any);

  const res = await apiClient.post<{ url: string; key: string }>('/media/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 45000,
  });
  return res.data.url;
};

const isUsableUrl = (url?: string) => !!url && /^https?:\/\//.test(url) && !url.includes('placeholder.kimi.az');

const MIME_BY_EXT: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif',
  mp4: 'video/mp4', mov: 'video/quicktime', m4v: 'video/x-m4v', webm: 'video/webm',
};

/**
 * Şəkil və ya video faylını yükləyir. Yükləmə alınmasa və ya server yalnız
 * placeholder qaytarsa (S3 konfiqurasiya olunmayıb) xəta atır — çünki lokal URI
 * digər istifadəçilər üçün əlçatan deyil.
 */
export const uploadMediaStrict = async (uri: string): Promise<string> => {
  const name = uri.split('/').pop() || `media-${Date.now()}.jpg`;
  const ext = (/\.(\w+)$/.exec(name)?.[1] ?? 'jpg').toLowerCase();
  const type = MIME_BY_EXT[ext] ?? 'image/jpeg';

  const form = new FormData();
  form.append('file', { uri, name, type } as any);

  const res = await apiClient.post<{ url: string; key: string }>('/media/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 180000,
  });
  if (!isUsableUrl(res.data.url)) throw new Error('UPLOAD_NOT_AVAILABLE');
  return res.data.url;
};

/**
 * Şəkli yükləməyə çalışır; uğursuz olsa və ya yalnız placeholder qaytarılsa
 * lokal URI-ni qaytarır (eyni cihazda göstərilə bilsin deyə).
 */
export const uploadImageOrFallback = async (localUri: string): Promise<string> => {
  try {
    const url = await uploadImage(localUri);
    return isUsableUrl(url) ? url : localUri;
  } catch {
    return localUri;
  }
};
