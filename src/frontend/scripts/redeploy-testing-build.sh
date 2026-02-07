#!/bin/bash

# VAANI Testing Build Redeploy Script
# Version: 40 - Premium Apple-Style Header & Landing Page Polish
# Purpose: Safely redeploy the existing VAANI testing build with retry logic
# Usage: ./scripts/redeploy-testing-build.sh

set -e

echo "🚀 VAANI Testing Build Redeploy - Version 40"
echo "=============================================="
echo ""
echo "📋 Changes in this build:"
echo "  • Compact, premium header spacing (h-14, refined padding)"
echo "  • Improved landing page typography and whitespace"
echo "  • Polished Creator Zone card visual density"
echo "  • Apple-style minimal aesthetic throughout"
echo ""
echo "⚠️  IMPORTANT: Verify the following after deployment:"
echo "  1. Header spacing is compact and balanced across all breakpoints"
echo "  2. Logo (h-8) is left-aligned and clickable, navigates to /"
echo "  3. Auth controls stay anchored to top-right in both states"
echo "  4. Landing page typography hierarchy feels premium"
echo "  5. Creator Zone card spacing is polished and consistent"
echo ""

# Function to check if dfx is running
check_dfx() {
    if ! dfx ping > /dev/null 2>&1; then
        echo "❌ Error: dfx is not running or not responding"
        echo "   Please start dfx with: dfx start --background"
        exit 1
    fi
}

# Function to deploy with retry logic
deploy_with_retry() {
    local max_attempts=3
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        echo "📦 Deployment attempt $attempt of $max_attempts..."
        
        if dfx deploy frontend; then
            echo "✅ Frontend deployed successfully!"
            return 0
        else
            echo "⚠️  Deployment attempt $attempt failed"
            if [ $attempt -lt $max_attempts ]; then
                echo "   Retrying in 5 seconds..."
                sleep 5
            fi
        fi
        
        attempt=$((attempt + 1))
    done
    
    echo "❌ All deployment attempts failed"
    return 1
}

# Main deployment flow
echo "1️⃣  Checking dfx status..."
check_dfx

echo ""
echo "2️⃣  Stopping frontend canister..."
if dfx canister stop frontend 2>/dev/null; then
    echo "✅ Frontend canister stopped"
else
    echo "⚠️  Frontend canister was not running (this is okay)"
fi

echo ""
echo "3️⃣  Deploying frontend with retry logic..."
if deploy_with_retry; then
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "  1. Open your browser and navigate to the frontend URL"
    echo "  2. Verify header spacing and alignment (see DEPLOYMENT_VERIFICATION.md)"
    echo "  3. Test landing page typography and whitespace"
    echo "  4. Check Creator Zone card polish"
    echo "  5. Test authentication flow and admin features"
    echo "  6. Verify responsive behavior across breakpoints"
    echo ""
    echo "📄 Full verification checklist: frontend/DEPLOYMENT_VERIFICATION.md"
else
    echo ""
    echo "❌ Deployment failed after multiple attempts"
    echo ""
    echo "🔧 Troubleshooting steps:"
    echo "  1. Check dfx logs: dfx canister logs frontend"
    echo "  2. Verify backend is running: dfx canister status backend"
    echo "  3. Try manual deployment: dfx deploy frontend --mode reinstall"
    echo "  4. Check for build errors in the output above"
    exit 1
fi
