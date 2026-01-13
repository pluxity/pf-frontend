@echo off
REM 로컬 nginx 테스트를 위한 빌드 및 배포 스크립트

echo 🚀 Starting local staging deployment...

REM 1. Clean previous build
echo 📦 Cleaning previous builds...
if exist deploy rmdir /s /q deploy
mkdir deploy\admin

REM 2. Build apps with staging.local environment
echo 🔨 Building demo-app...
cd apps\demo-app
call pnpm build:staging
cd ..\..

echo 🔨 Building demo-admin...
cd apps\demo-admin
call pnpm build:staging
cd ..\..

REM 3. Copy build results to deploy directory
echo 📁 Copying build results...
xcopy /s /e /y apps\demo-app\dist\* deploy\
xcopy /s /e /y apps\demo-admin\dist\* deploy\admin\

echo.
echo ✅ Deployment complete!
echo.
echo 📂 Build results in: .\deploy
echo    - App: .\deploy\
echo    - Admin: .\deploy\admin\
echo.
echo 🌐 Start nginx with:
echo    nginx -c %CD%\nginx.conf
echo.
echo 🔗 Access:
echo    - App: http://localhost:8080/
echo    - Admin: http://localhost:8080/admin
echo    - API: http://localhost:8080/plug/api → http://dev.pluxity.com/plug/api
