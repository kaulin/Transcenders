#!/bin/sh
# Fixes ownership issues caused by containers running as root
set -e

SLEEP_INTERVAL=10
WORKSPACE_DIR="/workspace"
TARGET_USER_ID="${HOST_UID:-1000}"
TARGET_GROUP_ID="${HOST_GID:-1000}"

echo "Chown service starting - UID:$TARGET_USER_ID GID:$TARGET_GROUP_ID"

# Handle signals gracefully
trap 'echo "Chown service shutting down..."; exit 0' TERM INT

# Main loop
while true; do
    # Fix dist directories
    find "$WORKSPACE_DIR" -type d -name "dist" -exec chown -R "$TARGET_USER_ID:$TARGET_GROUP_ID" {} + 2>/dev/null || true
    
    # Fix .turbo directories
    find "$WORKSPACE_DIR" -type d -name ".turbo" -exec chown -R "$TARGET_USER_ID:$TARGET_GROUP_ID" {} + 2>/dev/null || true
    
    # Fix .vite directory
    find "$WORKSPACE_DIR" -type d -name ".vite" -exec chown -R "$TARGET_USER_ID:$TARGET_GROUP_ID" {} + 2>/dev/null || true
    
    # Fix tsbuildinfo files
    find "$WORKSPACE_DIR" -name "*.tsbuildinfo" -exec chown "$TARGET_USER_ID:$TARGET_GROUP_ID" {} + 2>/dev/null || true
    
    echo "Chown cycle completed"
    sleep "$SLEEP_INTERVAL"
done