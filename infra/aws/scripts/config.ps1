# Shared settings for the AWS free-tier deploy scripts.
# Edit these values, then run the numbered scripts in this folder.

# --- AWS ---
$AWS_REGION  = 'ap-southeast-1'      # Singapore: closest to Vietnam, no extra cost
$PROJECT     = 'coffee-home-blend'

# --- Backend stack ---
$BACKEND_STACK  = "$PROJECT-backend"
$KEY_NAME       = "$PROJECT-key"
$INSTANCE_TYPE  = 't3.micro'         # ~$9.64/month in ap-southeast-1
$KEY_PATH       = "$PSScriptRoot\$KEY_NAME.pem"

# --- Frontend stack ---
$FRONTEND_STACK = "$PROJECT-frontend"

# --- Git repo (used on the server to pull code) ---
$REPO_URL = 'https://github.com/Hungg212/Frontend-CI-CD.git'
$REPO_BRANCH = 'main'

# --- Server paths ---
$REMOTE_APP_DIR = '/opt/coffee/app'

# A terminal opened before the AWS CLI was installed still has the old PATH.
# Add the install directory to this session so the scripts work immediately.
$awsExe = Get-Command aws -ErrorAction SilentlyContinue
if (-not $awsExe) {
    foreach ($dir in @(
            "$env:LOCALAPPDATA\Programs\Amazon\AWSCLIV2",
            "$env:ProgramFiles\Amazon\AWSCLIV2",
            "$env:ProgramFiles\Amazon\AWSCLI"
        )) {
        if (Test-Path (Join-Path $dir 'aws.exe')) {
            $env:PATH = "$dir;$env:PATH"
            break
        }
    }
}

function Get-AwsExe {
    # A terminal opened before the AWS CLI install will not see the new PATH
    # entry, so fall back to the known install locations.
    $cmd = Get-Command aws -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }

    $candidates = @(
        "$env:LOCALAPPDATA\Programs\Amazon\AWSCLIV2\aws.exe",
        "$env:ProgramFiles\Amazon\AWSCLIV2\aws.exe",
        "$env:ProgramFiles\Amazon\AWSCLI\aws.exe"
    )
    foreach ($c in $candidates) {
        if (Test-Path $c) { return $c }
    }
    return $null
}

function Get-StackOutput {
    param(
        [Parameter(Mandatory)][string]$StackName,
        [Parameter(Mandatory)][string]$OutputKey
    )
    $value = aws cloudformation describe-stacks `
        --stack-name $StackName `
        --region $AWS_REGION `
        --query "Stacks[0].Outputs[?OutputKey=='$OutputKey'].OutputValue" `
        --output text
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($value) -or $value -eq 'None') {
        throw "Could not read output '$OutputKey' from stack '$StackName'."
    }
    return $value.Trim()
}

function Assert-AwsCli {
    $exe = Get-AwsExe
    if (-not $exe) {
        throw 'AWS CLI not found. Install it: winget install --id Amazon.AWSCLI --exact'
    }

    $identity = aws sts get-caller-identity --output json 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw 'Not authenticated. Run: aws configure  (region: ap-southeast-1, output: json)'
    }
    return ($identity | ConvertFrom-Json)
}
