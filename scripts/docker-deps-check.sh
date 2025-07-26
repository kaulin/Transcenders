#!/bin/sh
# Docker dependency management script with timestamp-based change detection
# Mirrors Makefile setup-check logic but for Docker shared node_modules volume
#
# WORKFLOW:
# 1. When running in Docker: Manages shared node_modules volume for all services
# 2. When running locally: Can be used for local dependency management
# 3. If you add/remove packages locally: Restart the deps container to sync changes
#    Example: docker-compose restart deps-builder
# 4. The script detects changes by comparing timestamps of package.json files
#    with the .deps-complete marker file in the node_modules directory

set -e
WORKSPACE_DIR="$(pwd)"
NODE_MODULES_DIR="${WORKSPACE_DIR}/node_modules"
DEPS_COMPLETE_FILE="${NODE_MODULES_DIR}/.deps-complete"

# Ensure node_modules directory exists
mkdir -p "${NODE_MODULES_DIR}"

# Function to check if dependencies need to be updated
check_deps_needed() {
    echo "🔍 Checking if dependencies need to be updated..."
    
    # If node_modules doesn't exist, we need to install
    if [ ! -d "${NODE_MODULES_DIR}" ]; then
        echo "📦 node_modules directory not found - installation needed"
        return 0
    fi
    
    # If .deps-complete marker doesn't exist, we need to install
    if [ ! -f "${DEPS_COMPLETE_FILE}" ]; then
        echo "📦 .deps-complete marker not found - installation needed"
        return 0
    fi
    
    # Check if root package files are newer than marker
    if [ "package.json" -nt "${DEPS_COMPLETE_FILE}" ]; then
        echo "📦 Root package.json is newer than marker - installation needed"
        return 0
    fi
    
    if [ "package-lock.json" -nt "${DEPS_COMPLETE_FILE}" ]; then
        echo "📦 Root package-lock.json is newer than marker - installation needed"
        return 0
    fi
    
    # Check if any workspace package.json files are newer than marker
    if find packages services web -name "package.json" -newer "${DEPS_COMPLETE_FILE}" 2>/dev/null | grep -q .; then
        echo "📦 Workspace package.json files are newer than marker - installation needed"
        return 0
    fi
    
    echo "✅ Dependencies are up to date (using cache)"
    return 1
}

# Function to install dependencies
install_dependencies() {
    echo "📦 Installing dependencies..."
    npm ci --include=dev
    # Create completion marker with current timestamp
    touch "${DEPS_COMPLETE_FILE}"
    echo "✅ Dependencies installed and cached"
}

# Function to show dependency status
show_status() {
    echo "📊 Dependency Status:"
    echo "   - Workspace: ${WORKSPACE_DIR}"
    echo "   - Node modules: ${NODE_MODULES_DIR}"
    echo "   - Marker file: ${DEPS_COMPLETE_FILE}"
    
    if [ -f "${DEPS_COMPLETE_FILE}" ]; then
        # Try different date formats for cross-platform compatibility
        last_updated=$(date -r "${DEPS_COMPLETE_FILE}" 2>/dev/null || stat -f "%Sm" "${DEPS_COMPLETE_FILE}" 2>/dev/null || echo 'unknown')
        echo "   - Last updated: ${last_updated}"
    else
        echo "   - Last updated: never"
    fi
    
    if [ -d "${NODE_MODULES_DIR}" ]; then
        echo "   - Node modules size: $(du -sh "${NODE_MODULES_DIR}" 2>/dev/null | cut -f1 || echo 'unknown')"
    else
        echo "   - Node modules: not installed"
    fi
}

# Main execution
main() {
    echo "🚀 Docker Dependency Manager Starting..."
    
    # Show current status
    show_status
    
    # Check if dependencies need updating and install if needed
    if check_deps_needed; then
        install_dependencies
    fi
    
    # Show final status
    show_status
    
    echo "✅ Dependency management complete"
    echo "📁 node_modules is ready for use"
}

# Handle signals gracefully
trap 'echo "🛑 Received shutdown signal, exiting..."; exit 0' TERM INT

# Run main function
main