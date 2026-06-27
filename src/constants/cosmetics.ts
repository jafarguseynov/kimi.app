// Sikkə dükanı kosmetikləri — emoji əsaslı (asset lazım deyil).
// Premium olanlar müvafiq paket alınanda açılır (server: ownedPacks).

export interface CosmeticOption {
  id: string;
  emoji: string;
  premium: boolean;
}

// Avatarlar — premium id-ləri server PREMIUM_AVATARS ilə eyni olmalıdır.
export const AVATARS: CosmeticOption[] = [
  { id: 'smile', emoji: '😀', premium: false },
  { id: 'cool', emoji: '😎', premium: false },
  { id: 'star', emoji: '🤩', premium: false },
  { id: 'book', emoji: '📚', premium: false },
  { id: 'rocket', emoji: '🚀', premium: false },
  { id: 'cat', emoji: '🐱', premium: false },
  { id: 'fox', emoji: '🦊', premium: true },
  { id: 'panda', emoji: '🐼', premium: true },
  { id: 'unicorn', emoji: '🦄', premium: true },
  { id: 'dragon', emoji: '🐲', premium: true },
  { id: 'ninja', emoji: '🥷', premium: true },
  { id: 'astronaut', emoji: '👨‍🚀', premium: true },
];

export const avatarEmoji = (id?: string | null): string | null =>
  id ? AVATARS.find((a) => a.id === id)?.emoji ?? null : null;

// Stikerlər — söhbətdə göndərilir (mesaj type='sticker', content=emoji).
export const STICKERS: CosmeticOption[] = [
  { id: 'thumbsup', emoji: '👍', premium: false },
  { id: 'clap', emoji: '👏', premium: false },
  { id: 'fire', emoji: '🔥', premium: false },
  { id: 'heart', emoji: '❤️', premium: false },
  { id: 'laugh', emoji: '😂', premium: false },
  { id: 'ok', emoji: '🆗', premium: false },
  { id: 'party', emoji: '🥳', premium: true },
  { id: 'trophy', emoji: '🏆', premium: true },
  { id: 'brain', emoji: '🧠', premium: true },
  { id: 'medal', emoji: '🥇', premium: true },
  { id: 'rocket2', emoji: '🚀', premium: true },
  { id: 'hundred', emoji: '💯', premium: true },
];
