import { Env, envVarSchema } from '@transcenders/contracts';
import envSchema from 'env-schema';
import path from 'path';

let cached: Env | null = null;

export const ENV = Object.freeze(loadEnv());

function loadEnv(): Env {
  if (cached) return cached;

  const raw = envSchema<Env>({
    schema: envVarSchema,
    dotenv: { path: path.resolve(process.cwd(), '../../.env') },
    env: true,
    // custom envs to construct in place
    data: { PROJECT_ROOT: path.resolve(process.cwd(), '../../') },
    expandEnv: true,
  });
  cached = raw;
  // #TODO testing lo
  console.log(raw);
  return cached;
}
