export const UserConfig = {
  OFFLINE_TIMEOUT_MINUTES: 2,
  CLEANUP_INTERVAL_MINUTES: 1,
  AVATAR: {
    MAX_FILE_SIZE: 10 * 1024 * 1024,
    RESIZE_DIMENSION: 300,
    QUALITY: 80,
    ALLOWED_TYPES: ['image/*'],
  },
} as const;
