#!/bin/sh
set -eu

echo "🔍 Waiting for dependencies to be installed..."

# Wait for the .deps-complete marker file
DEPS_COMPLETE_FILE="/workspace/node_modules/.deps-complete"
TIMEOUT=300
ELAPSED=0

while [ ! -f "${DEPS_COMPLETE_FILE}" ]; do
    if [ ${ELAPSED} -ge ${TIMEOUT} ]; then
        echo "❌ Timeout waiting for dependencies. Check deps-service logs."
        exit 1
    fi
    
    echo "⏳ Dependencies not ready yet... waiting (${ELAPSED}s/${TIMEOUT}s)"
    sleep 5
    ELAPSED=$((ELAPSED + 5))
done

echo "✅ Dependencies are ready! Starting ${SERVICE_NAME}..."

# Start the service with turbo dev (this filter with '...' runs dev on everything that the service depends on)
# exec npx turbo dev --filter=${SERVICE_NAME}...
# but with package-service its less memory usage so we are not watching same package changes from multiple containers
# package-service case
if [[ $SERVICE_NAME == package-service ]]; then
  cd /workspace && exec npx turbo dev:package
fi
exec npx turbo dev