export const SERVICE_URLS = {
  USER:
    (typeof process !== 'undefined' ? process.env.USER_SERVICE_URL : undefined) ??
    'http://localhost:3001',
  AUTH:
    (typeof process !== 'undefined' ? process.env.AUTH_SERVICE_URL : undefined) ??
    'http://localhost:3002',
  SCORE:
    (typeof process !== 'undefined' ? process.env.SCORE_SERVICE_URL : undefined) ??
    'http://localhost:3003',
} as const;