export function getEnvVar(key: string, fallback: string): string {
  // Vite/browser build: import.meta.env is available
  const viteEnv = (typeof import.meta !== 'undefined' && (import.meta as any).env) ?? {};

  // Prefer Vite vars in the browser (must be prefixed with VITE_)
  const viteKey = `VITE_${key}`;
  if (viteEnv && viteKey in viteEnv && viteEnv[viteKey]) {
    return String(viteEnv[viteKey]);
  }

  // Node / service side
  if (typeof process !== 'undefined' && process.env && key in process.env && process.env[key]) {
    return String(process.env[key]);
  }

  return fallback;
}
