#!/bin/sh
# Cleanup script for removing build artifacts created by root containers
set -e

WORKSPACE_DIR="/workspace"

echo "🧹 Starting build artifact cleanup..."

# Remove dist directories
echo "Removing dist/ directories..."
find "$WORKSPACE_DIR" -type d -name "dist" -exec rm -rf {} + 2>/dev/null || true

# Remove .turbo directories  
echo "Removing .turbo/ directories..."
find "$WORKSPACE_DIR" -type d -name ".turbo" -exec rm -rf {} + 2>/dev/null || true

# Remove .vite directory
echo "Removing .vite/ directories..."
find "$WORKSPACE_DIR" -type d -name ".vite" -exec rm -rf {} + 2>/dev/null || true

# Remove tsbuildinfo files
echo "Removing *.tsbuildinfo files..."
find "$WORKSPACE_DIR" -name "*.tsbuildinfo" -exec rm -f {} + 2>/dev/null || true

# More if I find more root owned build artifacts after docker running

echo "Build artifact cleanup completed"