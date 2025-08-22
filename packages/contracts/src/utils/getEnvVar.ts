/**
 * Cross-platform environment variable access for both Node.js and browser
 */
export function getEnvVar(name: string, fallback: string): string {
  try {
    const viteEnv = (import.meta as any).env;
    if (viteEnv) {
      const v = viteEnv[`VITE_${name}`] ?? viteEnv[name];
      if (v !== undefined) return v;
    }
  } catch {}

  if (typeof process !== 'undefined' && process.env) {
    const v = process.env[`${name}`] ?? process.env[name];
    if (v !== undefined) return v;
  }
  return fallback;
}
