# Step 4 — End-to-end verification.
# Read-only: checks health, CORS path through CloudFront, admin login, SPA routing.

. "$PSScriptRoot\config.ps1"
Assert-AwsCli | Out-Null

$ErrorActionPreference = 'Stop'

$publicIp = Get-StackOutput -StackName $BACKEND_STACK -OutputKey PublicIp
$siteUrl  = Get-StackOutput -StackName $FRONTEND_STACK -OutputKey FrontendUrl
$apiUrl   = Get-StackOutput -StackName $FRONTEND_STACK -OutputKey ApiThroughCloudFrontUrl

$failures = @()

function Test-Step {
    param([string]$Name, [scriptblock]$Action)
    Write-Host "--- $Name" -ForegroundColor Cyan
    try {
        & $Action
        Write-Host "    [ok]" -ForegroundColor Green
    } catch {
        Write-Host "    [FAIL] $($_.Exception.Message)" -ForegroundColor Red
        $script:failures += $Name
    }
}

Test-Step 'EC2 API health (direct)' {
    $r = Invoke-RestMethod -Uri "http://${publicIp}/api/health" -TimeoutSec 15
    if (-not $r.ok) { throw 'health.ok is false' }
    Write-Host "    $($r | ConvertTo-Json -Compress)" -ForegroundColor Gray
}

Test-Step 'API health through CloudFront (HTTPS)' {
    $r = Invoke-RestMethod -Uri "$apiUrl/health" -TimeoutSec 20
    if (-not $r.ok) { throw 'health.ok is false via CloudFront' }
}

Test-Step 'Products endpoint returns data (DB seeded)' {
    $r = Invoke-RestMethod -Uri "$apiUrl/products?limit=3" -TimeoutSec 20
    $count = @($r.products).Count
    if ($count -eq 0) { throw 'No products returned — the DB may not be seeded' }
    Write-Host "    $count product(s) returned" -ForegroundColor Gray
}

Test-Step 'Admin login works (seed user)' {
    $body = @{ email = 'admin@coffeehome.vn'; password = 'admin123' } | ConvertTo-Json
    $r = Invoke-RestMethod -Uri "$apiUrl/auth/login" -Method Post -Body $body `
        -ContentType 'application/json' -TimeoutSec 20
    if (-not $r.token) { throw 'No token returned' }
    Write-Host "    token length: $($r.token.Length)" -ForegroundColor Gray
}

Test-Step 'SPA index.html served over HTTPS' {
    $r = Invoke-WebRequest -Uri $siteUrl -UseBasicParsing -TimeoutSec 20
    if ($r.StatusCode -ne 200) { throw "HTTP $($r.StatusCode)" }
    if ($r.Content -notmatch '<div id="root"') { throw 'index.html does not look like the Vite app' }
    Write-Host "    HTTP $($r.StatusCode), $($r.RawContentLength) bytes" -ForegroundColor Gray
}

Test-Step 'API 404 returns JSON, not index.html (error passthrough)' {
    # A global CustomErrorResponse would swallow API errors and return the SPA
    # shell with 200. This asserts the /api/* behavior is left alone.
    try {
        Invoke-RestMethod -Uri "$apiUrl/products/this-slug-does-not-exist" -TimeoutSec 20 | Out-Null
        throw 'Expected a 404 for an unknown product slug, got a success response'
    } catch {
        $resp = $_.Exception.Response
        if (-not $resp) { throw }
        $code = [int]$resp.StatusCode
        if ($code -ne 404) { throw "Expected HTTP 404, got $code (another failed slug?)" }
        Write-Host "    HTTP 404 as expected" -ForegroundColor Gray
    }
}

Test-Step 'SPA deep link falls back to index.html' {
    $r = Invoke-WebRequest -Uri "$siteUrl/admin/products" -UseBasicParsing -TimeoutSec 20
    if ($r.StatusCode -ne 200) { throw "HTTP $($r.StatusCode) (CloudFront custom error response missing?)" }
    if ($r.Content -notmatch '<div id="root"') { throw 'Did not get index.html' }
}

Test-Step 'HTTPS is enforced (HTTP redirects)' {
    $httpUrl = $siteUrl -replace '^https://', 'http://'
    Add-Type -AssemblyName System.Net.Http -ErrorAction SilentlyContinue

    $handler = New-Object System.Net.Http.HttpClientHandler
    $handler.AllowAutoRedirect = $false
    $client = New-Object System.Net.Http.HttpClient($handler)
    $client.Timeout = [TimeSpan]::FromSeconds(20)
    try {
        $resp = $client.GetAsync($httpUrl).GetAwaiter().GetResult()
        $code = [int]$resp.StatusCode
        if ($code -lt 300 -or $code -ge 400) {
            throw "HTTP returned $code instead of a redirect to HTTPS"
        }
        Write-Host "    redirected with $code" -ForegroundColor Gray
    } finally {
        $client.Dispose()
        $handler.Dispose()
    }
}

Write-Host ""
if ($failures.Count -eq 0) {
    Write-Host "All checks passed." -ForegroundColor Green
    Write-Host "  Site: $siteUrl" -ForegroundColor White
    Write-Host "  Login: admin@coffeehome.vn / admin123" -ForegroundColor Gray
} else {
    Write-Host "Failed checks: $($failures -join ', ')" -ForegroundColor Red
    Write-Host "See TROUBLESHOOTING in infra/aws/README.md" -ForegroundColor Yellow
    exit 1
}
