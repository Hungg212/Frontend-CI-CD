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
    Write-Host "STEP 1 - create a user with an access key in the AWS Console:" -ForegroundColor Cyan
    Write-Host "  https://console.aws.amazon.com/iam/users -> Create user" -ForegroundColor Gray
    Write-Host "  Name        : coffee-deployer" -ForegroundColor Gray
    Write-Host "  Console access: leave UNCHECKED (CLI only)" -ForegroundColor Gray
    Write-Host "  Permissions : attach these 6 policies directly:" -ForegroundColor Gray
    Write-Host "                 AmazonEC2FullAccess" -ForegroundColor Gray
    Write-Host "                 AmazonS3FullAccess" -ForegroundColor Gray
    Write-Host "                 CloudFrontFullAccess" -ForegroundColor Gray
    Write-Host "                 AWSCloudFormationFullAccess" -ForegroundColor Gray
    Write-Host "                 IAMFullAccess" -ForegroundColor Gray
    Write-Host "                 AmazonSSMFullAccess" -ForegroundColor Gray
    Write-Host "  Security credentials -> Create access key -> 'Command Line Interface (CLI)'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "STEP 2 - run this on your machine (it stores the key in ~/.aws):" -ForegroundColor Cyan
    Write-Host "  aws configure" -ForegroundColor White
    Write-Host "    AWS Access Key ID     : <paste>" -ForegroundColor Gray
    Write-Host "    AWS Secret Access Key : <paste>" -ForegroundColor Gray
    Write-Host "    Default region name   : $AWS_REGION" -ForegroundColor Gray
    Write-Host "    Default output format : json" -ForegroundColor Gray
    Write-Host ""
    Write-Host "STEP 3 - verify:" -ForegroundColor Cyan
    Write-Host "  aws sts get-caller-identity" -ForegroundColor White
    Write-Host ""
    Write-Host "Then re-run .\00-prereq.ps1" -ForegroundColor Green
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

# ------------------------------------------------- Free Plan vs credits check
# Accounts created on/after 2025-07-15 get $100 credit and a 6-month Free Plan
# instead of the old 12-month usage-limited free tier. The difference matters:
# the Free Plan *closes the account* at 6 months unless you upgrade to Paid.
Write-Host ""
Write-Host "== Checking account plan ==" -ForegroundColor Cyan

$planJson = aws freetier get-account-plan-state --output json 2>$null
if ($LASTEXITCODE -eq 0 -and $planJson) {
    try {
        $plan = $planJson | ConvertFrom-Json
    } catch {
        $plan = $null
    }
}

if ($plan) {
    $amt = if ($plan.accountPlanRemainingCredits) { $plan.accountPlanRemainingCredits.amount } else { $null }
    $cur = if ($plan.accountPlanRemainingCredits) { $plan.accountPlanRemainingCredits.unit } else { 'USD' }

    Write-Host "[info] Plan      : $($plan.accountPlanType)  ($($plan.accountPlanStatus))" -ForegroundColor Gray
    if ($null -ne $amt) {
        Write-Host "[info] Credits   : $amt $cur remaining" -ForegroundColor Gray
    }
    if ($plan.accountPlanExpirationDate) {
        $exp = [datetime]$plan.accountPlanExpirationDate
        Write-Host "[info] Plan ends : $($exp.ToString('yyyy-MM-dd'))  (upgrade to Paid before this)" -ForegroundColor Gray
    }

    if ($plan.accountPlanType -eq 'FREE') {
        Write-Host ""
        Write-Host "  This is a Free Plan account. Three things to know:" -ForegroundColor Yellow
        Write-Host "  1. No surprise bills. The Free Plan cannot exceed its credit," -ForegroundColor Gray
        Write-Host "     so you will never be charged while on this plan." -ForegroundColor Gray
        Write-Host "  2. The account CLOSES 6 months after sign-up unless you upgrade" -ForegroundColor Gray
        Write-Host "     to Paid (Console -> Settings -> Billing -> Upgrade). Data is" -ForegroundColor Gray
        Write-Host "     deleted 90 days after that, so upgrade before the date above." -ForegroundColor Gray
        Write-Host "  3. Every service this project uses is allowed on the Free Plan" -ForegroundColor Gray
        Write-Host "     (EC2, EBS, S3, CloudFront, CloudFormation, IAM, SSM, VPC)." -ForegroundColor Gray
    }
} else {
    Write-Host "[info] Could not read the account plan via the freetier API." -ForegroundColor Gray
    Write-Host "       Check Console -> Billing: a 'credits remaining' panel means" -ForegroundColor Gray
    Write-Host "       the new credit model (Free Plan, 6 months) applies." -ForegroundColor Gray
}

Write-Host ""
Write-Host "== Cost sanity check ==" -ForegroundColor Cyan
Write-Host "Expected burn: ~\$11.3/month (t3.micro + 20GB gp3 EBS)." -ForegroundColor Gray
Write-Host "That means \$100 lasts ~8 months of runtime, but the Free Plan" -ForegroundColor Gray
Write-Host "expires at 6 months first - roughly \$68 spent, \$32 left over." -ForegroundColor Gray
Write-Host "Watch the burn rate: Console -> Billing -> Budgets." -ForegroundColor Gray

Write-Host ""
Write-Host "Ready. Next: .\01-stack-backend.ps1" -ForegroundColor Green
