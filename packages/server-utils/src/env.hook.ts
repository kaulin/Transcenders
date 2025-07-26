import { Env, envVarSchema } from '@transcenders/contracts';
import envSchema from 'env-schema';

let cached: Env | null = null;

export const ENV = Object.freeze(loadEnv());

export function loadEnv(): Env {
  if (cached) return cached;

  const raw = envSchema<Env>({
    schema: envVarSchema,
    dotenv: true,
    env: true,
  });

  cached = raw;
  return cached;
}
