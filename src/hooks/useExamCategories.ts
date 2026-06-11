import { useEffect, useState } from 'react';
import { getExamCategories, RemoteCategory } from '../api/exam.api';

/**
 * Admin paneldən idarə olunan imtahan kateqoriyalarını yükləyir.
 * Şəbəkə xətası və ya boş cavab olarsa `null` qaytarır — ekranlar
 * öz hardcode taksonomiyalarına (educationTaxonomy) düşürlər.
 */
export function useExamCategories(): RemoteCategory[] | null {
  const [remote, setRemote] = useState<RemoteCategory[] | null>(null);

  useEffect(() => {
    let alive = true;
    getExamCategories()
      .then((data) => {
        if (alive && Array.isArray(data) && data.length > 0) setRemote(data);
      })
      .catch(() => {
        /* offline / köhnə backend — fallback işləyəcək */
      });
    return () => {
      alive = false;
    };
  }, []);

  return remote;
}
