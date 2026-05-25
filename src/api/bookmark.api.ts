import client from './client';

export type BookmarkTargetType = 'exam' | 'question' | 'flashcard' | 'teacher' | 'request';

export interface Bookmark {
  id: string;
  targetId: string;
  targetType: BookmarkTargetType;
  title: string | null;
  createdAt: string;
}

export interface BookmarkCheckResult {
  bookmarked: boolean;
  bookmarkId: string | null;
}

export const getBookmarks = (type?: BookmarkTargetType): Promise<Bookmark[]> =>
  client.get('/bookmark', { params: type ? { type } : {} }).then((r) => r.data);

export const addBookmark = (targetId: string, targetType: BookmarkTargetType, title?: string): Promise<Bookmark> =>
  client.post('/bookmark', { targetId, targetType, title }).then((r) => r.data);

export const removeBookmark = (bookmarkId: string): Promise<{ success: boolean }> =>
  client.delete(`/bookmark/${bookmarkId}`).then((r) => r.data);

export const checkBookmark = (targetId: string, targetType: BookmarkTargetType): Promise<BookmarkCheckResult> =>
  client.get('/bookmark/check', { params: { targetId, targetType } }).then((r) => r.data);
