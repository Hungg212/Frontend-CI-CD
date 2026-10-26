# Step 3 — Deploy the frontend: S3 + CloudFront + /api proxy.
# Builds the Vite app, creates/updates the frontend stack, uploads, invalidates.

. "$PSScriptRoot\config.ps1"
Assert-AwsCli | Out-Null

$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path "$PSScriptRoot\..\..\.."

$publicIp = Get-StackOutput -StackName $BACKEND_STACK -OutputKey PublicIp

# CloudFront rejects raw IP addresses as custom origins, so we need a DNS name
# pointing at the EC2 box. Try the EC2 public DNS first (free, stable), then
# fall back to <ip>.nip.io, which resolves any dotted IPv4 without a signup.
# A candidate is only usable if it actually resolves from here.
function Test-OriginDns {
    param([string]$Name)
    if ([string]::IsNullOrWhiteSpace($Name) -or $Name -eq 'None') { return $false }
    try {
        $resolved = [System.Net.Dns]::GetHostAddresses($Name)
        return ($resolved.Count -gt 0)
    } catch {
        return $false
    }
}

$apiOrigin = $null
$ec2Dns = $null
try { $ec2Dns = Get-StackOutput -StackName $BACKEND_STACK -OutputKey PublicDns } catch { }

foreach ($candidate in @($ec2Dns, "$publicIp.nip.io")) {
    if (Test-OriginDns -Name $candidate) {
        $apiOrigin = $candidate.Trim()
        break
    }
    Write-Host "   origin candidate '$candidate' does not resolve, trying next" -ForegroundColor DarkGray
}

if (-not $apiOrigin) {
    throw @"
No usable DNS name for the API origin.

CloudFront requires a hostname, not an IP. Fix one of these:
  1) Enable DNS hostnames in the VPC:
       aws ec2 modify-vpc-attribute --vpc-id <vpcId> --enable-dns-hostnames
  2) Or set ApiOriginDomain manually when deploying frontend.yml.
"@
}

Write-Host "API origin: $apiOrigin  (IP $publicIp)" -ForegroundColor Cyan

Write-Host ""
Write-Host "== 1/4 Deploy frontend stack ==" -ForegroundColor Cyan
aws cloudformation deploy `
    --template-file "$PSScriptRoot\..\cloudformation\frontend.yml" `
    --stack-name $FRONTEND_STACK `
    --region $AWS_REGION `
    --parameter-overrides `
        "ProjectName=$PROJECT" `
        "ApiOriginDomain=$apiOrigin" `
        "PriceClass=PriceClass_All" `
    --tags Project=$PROJECT ManagedBy=cloudformation

if ($LASTEXITCODE -ne 0) { throw 'Frontend stack deploy failed.' }

$bucket = Get-StackOutput -StackName $FRONTEND_STACK -OutputKey BucketName
$distId = Get-StackOutput -StackName $FRONTEND_STACK -OutputKey DistributionId
$siteUrl = Get-StackOutput -StackName $FRONTEND_STACK -OutputKey FrontendUrl

Write-Host "  Bucket: $bucket"
Write-Host "  Dist  : $distId"

Write-Host ""
Write-Host "== 2/4 Build the frontend ==" -ForegroundColor Cyan
Push-Location $repoRoot
try {
    if (-not (Test-Path 'node_modules')) {
        Write-Host "   installing dependencies..." -ForegroundColor DarkGray
        npm ci
        if ($LASTEXITCODE -ne 0) { throw 'npm ci failed.' }
    }

    # Do NOT set VITE_API_BASE_URL to '' here: PowerShell deletes the variable,
    # and Vite would then fall back to .env (http://localhost:4000/api) and bake
    # that into the production bundle. .env.production already sets it empty,
    # so just make sure nothing from the shell leaks in.
    Remove-Item Env:\VITE_API_BASE_URL -ErrorAction SilentlyContinue
    Remove-Item Env:\VITE_APP_ENV -ErrorAction SilentlyContinue

    npm run build
    if ($LASTEXITCODE -ne 0) { throw 'Frontend build failed.' }

    # Guard: a production bundle must never contain the dev API host.
    $leak = Select-String -Path (Join-Path $repoRoot 'dist\assets\*.js') `
        -Pattern 'localhost:4000' -List -ErrorAction SilentlyContinue
    if ($leak) {
        throw "Build leaked a dev API URL into $($leak[0].Filename). Check .env / .env.production."
    }
} finally {
    Pop-Location
}

$distDir = Join-Path $repoRoot 'dist'
if (-not (Test-Path (Join-Path $distDir 'index.html'))) { throw "Build output missing: $distDir\index.html" }

Write-Host ""
Write-Host "== 3/4 Upload to S3 ==" -ForegroundColor Cyan

# Hashed assets: cache forever
aws s3 sync $distDir "s3://$bucket" `
    --region $AWS_REGION `
    --delete `
    --exclude 'index.html' `
    --exclude '*.map' `
    --cache-control 'public,max-age=31536000,immutable'
if ($LASTEXITCODE -ne 0) { throw 's3 sync (assets) failed.' }

# index.html + service worker-ish files: never cache
aws s3 cp (Join-Path $distDir 'index.html') "s3://$bucket/index.html" `
    --region $AWS_REGION `
    --cache-control 'no-cache,no-store,must-revalidate' `
    --content-type 'text/html; charset=utf-8'
if ($LASTEXITCODE -ne 0) { throw 's3 cp (index.html) failed.' }

Write-Host ""
Write-Host "== 4/4 Invalidate CloudFront ==" -ForegroundColor Cyan
$invalidation = aws cloudfront create-invalidation `
    --distribution-id $distId `
    --paths '/*' `
    --query 'Invalidation.Id' --output text
Write-Host "  Invalidation: $invalidation" -ForegroundColor Gray

Write-Host ""
Write-Host "Frontend deployed!" -ForegroundColor Green
Write-Host "  Site : $siteUrl" -ForegroundColor White
Write-Host "  API  : $siteUrl/api/health" -ForegroundColor Gray
Write-Host ""
Write-Host "CloudFront takes 3-10 min to finish the first deploy." -ForegroundColor Yellow
Write-Host "Next: .\04-verify.ps1 (checks everything end to end)" -ForegroundColor Cyan
