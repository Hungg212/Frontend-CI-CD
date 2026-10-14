$ErrorActionPreference = "Continue"
$repo = "D:\Devopp\coffee-home-blend"

Set-Location $repo
Write-Host "=== Git Status ==="
& git status --short

Write-Host "`n=== Git Add ==="
& git add -A

Write-Host "`n=== Git Commit ==="
$msg = "fix: update CI/CD workflows and husky hooks"
& git commit -m $msg

Write-Host "`n=== Git Push ==="
& git push origin main

Write-Host "`n=== Done ==="
