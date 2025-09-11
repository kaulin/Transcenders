#!/bin/sh
# Cleanup script for removing build artifacts created by root containers
set -e

WORKSPACE_DIR="/workspace"

echo "Starting build artifact cleanup..."

# Remove dist directories (excluding node_modules)
echo "-- Removing dist/ directories..."
find "$WORKSPACE_DIR" -type d -name "node_modules" -prune -o -type d -name "dist" -print0 | xargs -0 rm -rfv || true

# Remove .turbo directories (excluding node_modules)
echo "-- Removing .turbo/ directories..."
find "$WORKSPACE_DIR" -type d -name "node_modules" -prune -o -type d -name ".turbo" -print0 | xargs -0 rm -rfv || true

# Remove tsbuildinfo files (excluding node_modules)
echo "-- Removing *.tsbuildinfo files..."
find "$WORKSPACE_DIR" -type d -name "node_modules" -prune -o -name "*.tsbuildinfo" -print0 | xargs -0 rm -fv || true

# Specific 1 dir artifacts
# Remove web/.vite directory
echo "-- Removing web/.vite"
rm -rf "$WORKSPACE_DIR/web/.vite"
rm -rf "$WORKSPACE_DIR/database/"
# Remove node_modules/.vite-temp directory
echo "-- Removing node_modules/.vite-temp"
rm -rf "$WORKSPACE_DIR/node_modules/.vite-temp"

# More if I find more root owned build artifacts after docker running

echo "Build artifact cleanup completed"