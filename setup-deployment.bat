@echo off
echo ========================================
echo   MM Bank - Quick Deployment Setup
echo ========================================
echo.

echo Step 1: Check if Git is installed...
git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git is not installed!
    echo Please install Git from: https://git-scm.com/download/win
    pause
    exit /b 1
)
echo Git found!
echo.

echo Step 2: Initialize Git repository...
git init
echo Git initialized!
echo.

echo Step 3: Add all files...
git add .
echo Files added!
echo.

echo Step 4: Create initial commit...
git commit -m "Initial commit - MM Bank ready for deployment"
echo Commit created!
echo.

echo ========================================
echo   Next Steps:
echo ========================================
echo.
echo 1. Create a new repository on GitHub
echo    - Go to: https://github.com/new
echo    - Name it: mm-bank
echo    - DO NOT initialize with README
echo.
echo 2. Connect your local repo to GitHub:
echo    git remote add origin https://github.com/YOUR_USERNAME/mm-bank.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo 3. Deploy Backend to Railway:
echo    - Go to: https://railway.app
echo    - Deploy from GitHub
echo    - Add environment variables (see DEPLOYMENT.md)
echo.
echo 4. Deploy Frontend to Vercel:
echo    - Go to: https://vercel.com
echo    - Import from GitHub
echo    - Set VITE_API_URL to your Railway URL
echo.
echo 5. See DEPLOYMENT.md for detailed instructions
echo.
pause
