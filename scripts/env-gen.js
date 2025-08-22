#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

const env = process.argv[2] || 'local';
const outFile = '.env';

const PORTS = {
  USER: env === 'production' ? 3000 : 3001,
  AUTH: env === 'production' ? 3000 : 3002,
  SCORE: env === 'production' ? 3000 : 3003,
};

function usage() {
  console.log('Usage: node env-gen.js <local|docker|production>');
  process.exit(1);
}

let nodeEnv;
switch (env) {
  case 'local':
  case 'docker':
    nodeEnv = 'development';
    break;
  case 'production':
    nodeEnv = 'production';
    break;
  default:
    console.error(`Error: invalid environment '${env}'`);
    usage();
}

let existingContent = '';
try {
  existingContent = readFileSync(outFile, 'utf8');
} catch {
  // File doesn't exist, that's fine
}

// Parse existing variables into a Map
const envVars = new Map();
existingContent.split('\n').forEach((line) => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key) {
      envVars.set(key, valueParts.join('='));
    }
  }
});

// Helper to set/update environment variables
function setEnvVar(key, value) {
  envVars.set(key, value);
}

// Get UID/GID
function getUid() {
  try {
    return process.getuid?.() || execSync('id -u', { encoding: 'utf8' }).trim();
  } catch {
    return '1000'; // fallback
  }
}

function getGid() {
  try {
    return process.getgid?.() || execSync('id -g', { encoding: 'utf8' }).trim();
  } catch {
    return '1000'; // fallback
  }
}

// Set basic environment variables
// setEnvVar('NODE_ENV', nodeEnv);
setEnvVar('HOST_UID', getUid());
setEnvVar('HOST_GID', getGid());
setEnvVar('GOOGLE_REDIRECT_URI', `http://localhost:${PORTS.AUTH}/auth/google/callback`);
setEnvVar('FRONTEND_URL', 'http://localhost:5173');
setEnvVar('MAIL_FROM', '"Transcenders Auth <auth@transcenders.online>"');

// prod overrides
if (env === 'production') {
  setEnvVar('FRONTEND_URL', 'http://app.transcenders.online');
  setEnvVar('GOOGLE_REDIRECT_URI', `http://api.transcenders.online/auth/google/callback`);
}

// Set service URLs
Object.entries(PORTS).forEach(([service, port]) => {
  const serviceLower = service.toLowerCase();

  const serviceUrl =
    env === 'local' ? `http://localhost:${port}` : `http://${serviceLower}-service:${port}`;

  let viteUrl = `http://localhost:${port}`;
  if (env === 'production') {
    viteUrl = `https://api.transcenders.online`;
  }

  setEnvVar(`${service}_SERVICE_URL`, serviceUrl);
  setEnvVar(`VITE_${service}_SERVICE_URL`, viteUrl);
});

// Write the .env file
const content =
  Array.from(envVars.entries())
    .map(([key, value]) => `${key}=${value}`)
    .join('\n') + '\n';

writeFileSync(outFile, content);
console.log(`.env updated for '${env}'`);
