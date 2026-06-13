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
