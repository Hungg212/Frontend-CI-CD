# Step 0 — Check the local toolchain (install what is missing).
# Safe to re-run.

. "$PSScriptRoot\config.ps1"

Write-Host "== Checking tools ==" -ForegroundColor Cyan

# ---------------------------------------------------------------- AWS CLI
if (Get-Command aws -ErrorAction SilentlyContinue) {
    $v = (aws --version 2>&1) -join ' '
    Write-Host "[ok]   AWS CLI : $v" -ForegroundColor Green
} else {
    Write-Host "[miss] AWS CLI not installed." -ForegroundColor Yellow
    Write-Host "       winget install --id Amazon.AWSCLI --exact" -ForegroundColor Gray
}

# --------------------------------------------------------------- Node/npm
if (Get-Command node -ErrorAction SilentlyContinue) {
    Write-Host "[ok]   Node    : $(node -v)" -ForegroundColor Green
} else {
    Write-Host "[miss] Node.js 20+ required for the frontend build." -ForegroundColor Yellow
}

# ----------------------------------------------------------------- Docker
if (Get-Command docker -ErrorAction SilentlyContinue) {
    Write-Host "[ok]   Docker  : $((docker --version 2>&1) -join ' ')" -ForegroundColor Green
} else {
    Write-Host "[info] Docker not found locally."
    Write-Host "       Not required: the API image is built on the EC2 instance." -ForegroundColor Gray
}

# -------------------------------------------------------------------- Git
if (Get-Command git -ErrorAction SilentlyContinue) {
    Write-Host "[ok]   Git     : $((git --version 2>&1) -join ' ')" -ForegroundColor Green
} else {
    Write-Host "[miss] Git required (the server pulls the repo)." -ForegroundColor Yellow
}

# -------------------------------------------------------------------- ssh
if (Get-Command ssh -ErrorAction SilentlyContinue) {
    Write-Host "[ok]   ssh     : available" -ForegroundColor Green
} else {
    Write-Host "[miss] OpenSSH client required. Install the 'OpenSSH Client' optional feature." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "== Checking AWS credentials ==" -ForegroundColor Cyan

try {
    $who = Assert-AwsCli
    Write-Host "[ok]   Account $($who.Account)  ARN: $($who.Arn)" -ForegroundColor Green
} catch {
    Write-Host "[miss] $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Create an access key first:" -ForegroundColor Gray
    Write-Host "  AWS Console -> IAM -> Users -> your user -> Security credentials ->" -ForegroundColor Gray
    Write-Host "  Create access key -> choose 'Command Line Interface (CLI)'" -ForegroundColor Gray
    Write-Host "Then run:" -ForegroundColor Gray
    Write-Host "  aws configure" -ForegroundColor White
    Write-Host "  (region: $AWS_REGION, output: json)" -ForegroundColor Gray
    exit 1
}

Write-Host ""
Write-Host "== Checking an existing key pair / stacks ==" -ForegroundColor Cyan
aws ec2 describe-key-pairs --key-names $KEY_NAME --region $AWS_REGION *> $null
if ($LASTEXITCODE -eq 0) {
    Write-Host "[info] Key pair '$KEY_NAME' already exists in $AWS_REGION" -ForegroundColor Gray
    if (-not (Test-Path $KEY_PATH)) {
        Write-Host "       but $KEY_PATH is missing. Either restore it or delete the key pair" -ForegroundColor Yellow
        Write-Host "       and re-run 01-stack-backend.ps1." -ForegroundColor Yellow
    }
}

foreach ($s in @($BACKEND_STACK, $FRONTEND_STACK)) {
    $status = aws cloudformation describe-stacks --stack-name $s --region $AWS_REGION `
        --query 'Stacks[0].StackStatus' --output text 2>$null
    if ($LASTEXITCODE -eq 0 -and $status -ne 'None') {
        Write-Host "[info] Stack '$s' exists (status: $status)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Ready. Next: .\01-stack-backend.ps1" -ForegroundColor Green
