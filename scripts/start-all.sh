#!/bin/bash
set -euo pipefail
trap "kill 0" SIGINT SIGTERM EXIT

concurrently \
  --graceful-kill \
  --signal SIGTERM \
  --names 'USER,AUTH,SCORE,FRONTEND' \
  --prefix-colors 'auto' \
  'node services/user-service/dist/server.js' \
  'node services/auth-service/dist/server.js' \
  'node services/score-service/dist/server.js' \
  'npm run dev --workspace=web'
  