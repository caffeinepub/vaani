#!/bin/bash

# VAANI Testing Build Redeploy Script
# This script redeploys the existing VAANI project without initializing a new canister.
# Safe to run multiple times - includes automatic retry on failure.

set -e

echo "🚀 Starting VAANI testing build redeploy..."

# Function to run deployment
deploy() {
  echo "📦 Building frontend..."
  cd frontend
  npm run build
  
  echo "🌐 Deploying to Internet Computer..."
  dfx deploy --network ic
  
  echo "✅ Deployment complete!"
  dfx canister --network ic id frontend
}

# Main deployment with retry logic
MAX_RETRIES=2
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if deploy; then
    echo "🎉 VAANI testing build deployed successfully!"
    exit 0
  else
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
      echo "⚠️  Deployment failed. Retrying ($RETRY_COUNT/$MAX_RETRIES)..."
      sleep 5
    else
      echo "❌ Deployment failed after $MAX_RETRIES attempts."
      echo "Please check the error messages above and try again manually."
      exit 1
    fi
  fi
done
