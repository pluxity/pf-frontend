#!/bin/bash
# 로컬 nginx 테스트를 위한 빌드 및 배포 스크립트

set -e

echo "🚀 Starting local staging deployment..."

# 1. Clean previous build
echo "📦 Cleaning previous builds..."
rm -rf deploy
mkdir -p deploy/admin

# 2. Build apps with staging.local environment
echo "🔨 Building demo-app..."
cd apps/demo-app
pnpm build:staging
cd ../..

echo "🔨 Building demo-admin..."
cd apps/demo-admin
pnpm build:staging
cd ../..

# 3. Copy build results to deploy directory
echo "📁 Copying build results..."
cp -r apps/demo-app/dist/* deploy/
cp -r apps/demo-admin/dist/* deploy/admin/

echo "✅ Deployment complete!"
echo ""
echo "📂 Build results in: ./deploy"
echo "   - App: ./deploy/"
echo "   - Admin: ./deploy/admin/"
echo ""
echo "🌐 Start nginx with:"
echo "   nginx -c $(pwd)/nginx.conf"
echo ""
echo "🔗 Access:"
echo "   - App: http://localhost:8080/"
echo "   - Admin: http://localhost:8080/admin"
echo "   - API: http://localhost:8080/plug/api → http://dev.pluxity.com/plug/api"
