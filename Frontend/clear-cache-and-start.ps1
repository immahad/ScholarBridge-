// Clear cache and start development server
cd $PSScriptRoot
Write-Host "Cleaning Vite cache..."
Remove-Item -Path "node_modules/.vite" -Recurse -ErrorAction SilentlyContinue
Write-Host "Starting development server..."
npm run dev
