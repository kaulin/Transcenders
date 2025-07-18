import type { ResizeOptions, WebpOptions } from 'sharp';

export const UserConfig = {
  OFFLINE_TIMEOUT_MINUTES: 0,
  CLEANUP_INTERVAL_MINUTES: 1,
} as const;

export const AvatarConfig = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, //10 mb

  // Dimensions
  WIDTH: 300 as const,
  HEIGHT: 300 as const,

  // Sharp resize options (directly from Sharp types)
  RESIZE_OPTIONS: {
    fit: 'cover',
    position: 'center',
    background: { r: 255, g: 255, b: 255, alpha: 1 },
  } satisfies ResizeOptions,

  // Output format
  OUTPUT_FORMAT: 'webp' as const,

  // Format-specific options
  WEBP_OPTIONS: {
    quality: 80,
    effort: 4,
    lossless: false,
  } satisfies WebpOptions,

  // Default avatar settings
  DEFAULT_AVATAR: {
    FILENAME: 'avatarCat1.avif' as const,
    PREFIX_FILTER: 'avatarCat' as const, // Filter for default avatars
  },

  // Random cats API settings
  RANDOM_CATS: {
    DEFAULT_LIMIT: 10 as const,
    DEFAULT_IMAGE_SIZE: 'med' as const, // 'small', 'med', 'full'
    DEFAULT_MIME_TYPES: 'jpeg,jpg,avif,png' as const,
    API_URL: 'https://api.thecatapi.com/v1/images/search' as const,
  },
} as const;
