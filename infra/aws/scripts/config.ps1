# Shared settings for the AWS free-tier deploy scripts.
# Edit these values, then run the numbered scripts in this folder.

# --- AWS ---
$AWS_REGION  = 'ap-southeast-1'      # Singapore: closest to Vietnam, no extra cost
$PROJECT     = 'coffee-home-blend'

# --- Backend stack ---
$BACKEND_STACK  = "$PROJECT-backend"
$KEY_NAME       = "$PROJECT-key"
$INSTANCE_TYPE  = 't3.micro'         # free tier: 750 h/month
$KEY_PATH       = "$PSScriptRoot\$KEY_NAME.pem"

# --- Frontend stack ---
$FRONTEND_STACK = "$PROJECT-frontend"

# --- Git repo (used on the server to pull code) ---
$REPO_URL = 'https://github.com/Hungg212/Frontend-CI-CD.git'
$REPO_BRANCH = 'main'

# --- Server paths ---
$REMOTE_APP_DIR = '/opt/coffee/app'

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
    if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
        throw 'AWS CLI not found. Install it first: https://aws.amazon.com/cli/ (msiexec / winget install Amazon.AWSCLI)'
    }
    $identity = aws sts get-caller-identity --output json 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw 'Not authenticated. Run: aws configure'
    }
    return ($identity | ConvertFrom-Json)
}
