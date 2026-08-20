// Tanıtım videosu köməkçiləri — YouTube linkindən qapaq (thumbnail) şəkli çıxarır.

// Dəstəklənən formalar:
//   https://www.youtube.com/watch?v=ID
//   https://youtu.be/ID
//   https://www.youtube.com/embed/ID
//   https://www.youtube.com/shorts/ID
//   https://m.youtube.com/watch?v=ID
export function getYoutubeId(url?: string | null): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m?.[1]) return m[1];
  }
  return null;
}

// Video qapaq şəkli URL-i (YouTube olmayan linklərdə null).
export function getVideoThumbnail(url?: string | null): string | null {
  const id = getYoutubeId(url);
  if (!id) return null;
  // hqdefault demək olar ki, həmişə mövcuddur (maxres bəzən yoxdur).
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}
