#!/usr/bin/env bash
set -euo pipefail

# usage: ./generate-env.sh local|docker|production

# service→port map
declare -A PORTS=(
  [USER]=3001
  [AUTH]=3002
  [SCORE]=3003
)

ENV=${1:-local}
OUT=".env"

usage() {
  echo "Usage: $0 <local|docker|production>"
  exit 1
}

case "$ENV" in
  local|docker)
    NODE_ENV=development
    ;;
  production)
    NODE_ENV=production
    ;;
  *)
    echo "Error: invalid environment '$ENV'"
    usage
    ;;
esac

touch "$OUT"

# update or append
set_env_var() {
  local key=$1 val=$2
  sed -i "/^${key}=/d" "$OUT"
	sed -i -e '$a\' "$OUT"
	echo "${key}=${val}" >> "$OUT"
}

# basic envs
set_env_var NODE_ENV "$NODE_ENV"
set_env_var HOST_UID "$(id -u)"
set_env_var HOST_GID "$(id -g)"
set_env_var GOOGLE_REDIRECT_URI "http://localhost:${PORTS[AUTH]}/auth/google/callback"
set_env_var FRONTEND_URL "http://localhost:5173"

for SVC in "${!PORTS[@]}"; do
  svc_lc=$(echo "$SVC" | tr '[:upper:]' '[:lower:]')
  port=${PORTS[$SVC]}

  # service URL logic
  if [[ $ENV == local ]]; then
    svc_url="http://localhost:$port"
  else
    svc_url="http://${svc_lc}-service:$port"
  fi

  # vite URLs are always localhost for now
  vite_url="http://localhost:$port"

  set_env_var "${SVC}_SERVICE_URL"   "$svc_url"
  set_env_var "VITE_${SVC}_SERVICE_URL" "$vite_url"
done

echo ".env updated for '$ENV'"