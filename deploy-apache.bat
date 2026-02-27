@echo off
echo =========================================
echo   CTOS Beta - Deploy to Apache on Pi
echo =========================================
echo.

echo [1/4] Building production bundle...
call npx vite build
if %errorlevel% neq 0 (
    echo Build failed!
    pause
    exit /b %errorlevel%
)
echo.

echo [2/4] Creating temporary transfer folder on Pi...
ssh owner@192.168.1.148 "mkdir -p ~/ctos-transfer"
echo.

echo [3/4] Copying files to Pi... (You may be prompted for the Pi password)
scp -r dist owner@192.168.1.148:~/ctos-transfer/
echo.

echo [4/4] Moving files to Apache web root... (You may be prompted for the Pi password again)
ssh -t owner@192.168.1.148 "sudo rm -rf /var/www/html/* && sudo cp -r ~/ctos-transfer/dist/* /var/www/html/ && sudo chown -R www-data:www-data /var/www/html/ && rm -rf ~/ctos-transfer"
echo.

echo =========================================
echo   Deployment complete!
echo   View your app at: http://192.168.1.148/
echo =========================================
pause
