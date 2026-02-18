# SmartPOS+ Deployment Script
# This script will help you deploy your PWA easily

Write-Host "`n=================================" -ForegroundColor Cyan
Write-Host "  SmartPOS+ Deployment Helper" -ForegroundColor Green
Write-Host "=================================`n" -ForegroundColor Cyan

$userChoice = Read-Host @"
Choose deployment method:
1. Start local server (for testing on your network)
2. Show Netlify upload instructions
3. Create ZIP for manual upload

Enter choice (1, 2, or 3): 
"@

switch ($userChoice) {
    "1" {
        Write-Host "`nStarting local server...`n" -ForegroundColor Yellow
        Write-Host "Your app will be available at:" -ForegroundColor Cyan
        Write-Host "  - This computer: http://localhost:5000" -ForegroundColor White
        
        $ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -like "*Wi-Fi*" -or $_.InterfaceAlias -like "*Ethernet*"}).IPAddress | Select-Object -First 1
        Write-Host "  - Other devices: http://$ip:5000`n" -ForegroundColor White
        Write-Host "Press Ctrl+C to stop the server`n" -ForegroundColor Yellow
        
        # Check if server files exist
        if (Test-Path "dist/index.js") {
            npm run start
        } else {
            Write-Host "Build not found. Running npm run build first..." -ForegroundColor Yellow
            npm run build
            npm run start
        }
    }
    "2" {
        Write-Host "`n📤 Netlify Upload Instructions:`n" -ForegroundColor Cyan
        
        $publicPath = Resolve-Path "dist/public"
        
        Write-Host "1. Go to: https://www.netlify.com" -ForegroundColor White
        Write-Host "2. Sign up (free account)" -ForegroundColor White
        Write-Host "3. Click 'Add new site' → 'Deploy manually'" -ForegroundColor White
        Write-Host "4. Open this folder in File Explorer:" -ForegroundColor White
        Write-Host "   $publicPath" -ForegroundColor Green
        Write-Host "5. Drag the 'public' FOLDER into Netlify" -ForegroundColor White
        Write-Host "6. Done! You'll get a URL like: https://your-app.netlify.app`n" -ForegroundColor Green
        
        Write-Host "Press Enter to open File Explorer at the location..." -ForegroundColor Yellow
        Read-Host
        explorer.exe $publicPath
    }
    "3" {
        Write-Host "`n📦 Creating deployment ZIP...`n" -ForegroundColor Cyan
        
        $zipPath = "SmartPOS-Deploy.zip"
        
        if (Test-Path $zipPath) {
            Remove-Item $zipPath
        }
        
        Compress-Archive -Path "dist/public\*" -DestinationPath $zipPath -Force
        
        Write-Host "✅ ZIP created: $zipPath`n" -ForegroundColor Green
        Write-Host "You can now:" -ForegroundColor Cyan
        Write-Host "1. Upload this ZIP to Netlify, Vercel, or any hosting service" -ForegroundColor White
        Write-Host "2. Extract and upload the contents" -ForegroundColor White
        Write-Host "`nPress Enter to open the ZIP location..." -ForegroundColor Yellow
        Read-Host
        explorer.exe .
    }
    default {
        Write-Host "Invalid choice!" -ForegroundColor Red
    }
}

