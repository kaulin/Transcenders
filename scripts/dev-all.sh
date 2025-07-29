#!/bin/bash
set -euo pipefail
trap "kill 0" SIGINT SIGTERM EXIT

concurrently \
  --graceful-kill \
  --signal SIGTERM \
  --names 'USER,AUTH,SCORE,FRONTEND' \
  --prefix-colors 'auto' \
  'tsx watch --inspect=0.0.0.0:9227 services/user-service/src/server.ts' \
  'tsx watch --inspect=0.0.0.0:9228 services/auth-service/src/server.ts' \
  'tsx watch --inspect=0.0.0.0:9229 services/score-service/src/server.ts' \
  'npm run dev --workspace=web'
  