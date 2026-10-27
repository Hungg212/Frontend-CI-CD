# Shared settings for the AWS free-tier deploy scripts.
# Edit these values, then run the numbered scripts in this folder.

# --- AWS ---
# New AWS accounts ("Sign up for AWS (new)") are often pinned to a single
# Region. This account (863421994977) only accepts ap-southeast-2 (Sydney);
# every other Region is refused by a service control policy.
# $AWS_REGION is resolved at runtime by Resolve-AwsRegion below, so the
# hardcoded value here is only a preference / fallback.
$AWS_REGION_PREFERRED = 'ap-southeast-2'   # Sydney: the only Region this account may use
$AWS_REGION  = $AWS_REGION_PREFERRED
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

function Invoke-Aws {
    <#
    Runs an AWS CLI command and never throws because AWS wrote to stderr.
    PowerShell 5.1 turns native stderr output into a terminating error when
    $ErrorActionPreference is 'Stop', which breaks expected failure checks
    such as "does this key pair exist yet?".
    Returns an object: [pscustomobject]@{ Success = $bool; Output = $string }
    #>
    param(
        [Parameter(Mandatory)][string[]]$Arguments
    )

    $prevPreference = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'

    try {
        $result = & aws @Arguments 2>$null
        $ok = ($LASTEXITCODE -eq 0)
    } finally {
        $ErrorActionPreference = $prevPreference
    }

    $text = ''
    if ($null -ne $result) {
        $text = ($result | Out-String).Trim()
    }

    return [pscustomobject]@{
        Success = $ok
        Output  = $text
    }
}

function Resolve-AwsRegion {
    <#
    New AWS accounts ("Sign up for AWS (new)") are pinned to a single Region
    chosen from the contact address country. Any other Region is refused by a
    service control policy, so a hardcoded region silently breaks every call.
    This probes a small candidate list with a cheap read-only call and returns
    the first Region the account is actually allowed to use.
    Sets $AWS_REGION in the caller's scope and returns it.
    #>
    param(
        [string[]]$Candidates = @(
            $AWS_REGION_PREFERRED,
            'ap-southeast-2',   # Sydney
            'ap-southeast-1',   # Singapore
            'ap-northeast-1',   # Tokyo
            'eu-north-1',       # Stockholm
            'us-east-2',        # Ohio
            'us-east-1'         # N. Virginia
        )
    )

    $unique = @($Candidates | Where-Object { $_ } | Select-Object -Unique)

    foreach ($r in $unique) {
        # describe-vpcs succeeds in every usable Region and fails with
        # UnauthorizedOperation in the Regions an SCP blocks. Probing with
        # describe-key-pairs would be wrong: it also fails when the key simply
        # does not exist yet, which would mask an unusable Region.
        $probe = Invoke-Aws @('ec2', 'describe-vpcs', '--region', $r, '--output', 'json')
        if ($probe.Success) {
            if ($r -ne $AWS_REGION) {
                Write-Host "[info] Account is pinned to Region '$r' (not '$AWS_REGION'). Using '$r'." -ForegroundColor Yellow
            }
            $script:AWS_REGION = $r
            $global:AWS_REGION = $r
            return $r
        }
    }

    Write-Host "[warn] No candidate Region was usable. Keeping '$AWS_REGION'." -ForegroundColor Yellow
    return $AWS_REGION
}
