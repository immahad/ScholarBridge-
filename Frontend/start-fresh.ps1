# This script clears the Vite server cache 
# and starts a development server with browser debugging enabled

Write-Host "🔥 Clearing Vite cache..." -ForegroundColor Yellow
Remove-Item -Path "node_modules/.vite" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "🔄 Clearing browser cache and cookies for localhost:3000..." -ForegroundColor Yellow
Start-Process "chrome" "--incognito http://localhost:3000/admin/dashboard" -ErrorAction SilentlyContinue

Write-Host "🚀 Starting Vite dev server..." -ForegroundColor Green
$env:DEBUG = "vite:*"
npm run dev
