/**
 * Cross-platform environment variable access for both Node.js and browser
 */
export function getEnvVar(name: string, fallback: string): string {
  // Node.js environment
  if (typeof process !== 'undefined' && process.env) {
    return process.env[name] ?? fallback;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const importMeta = import.meta as any;
    if (importMeta?.env?.[`VITE_${name}`]) {
      return importMeta.env[`VITE_${name}`];
    }
  } catch {
    // import.meta doesn't exist, continue to fallback
  }

  return fallback;
}
