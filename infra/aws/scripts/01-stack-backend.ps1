# Step 1 — Create the EC2 key pair and deploy the backend stack.
# Creates: EC2 t3.micro + Elastic IP + Security Group + IAM role (SSM).
# Takes ~4-6 minutes. Re-running the script updates the existing stack.

. "$PSScriptRoot\config.ps1"
Assert-AwsCli | Out-Null

$ErrorActionPreference = 'Stop'

Write-Host "== 1/3 Key pair ==" -ForegroundColor Cyan
aws ec2 describe-key-pairs --key-names $KEY_NAME --region $AWS_REGION *> $null
if ($LASTEXITCODE -eq 0) {
    Write-Host "[skip] '$KEY_NAME' already exists" -ForegroundColor Gray
    if (-not (Test-Path $KEY_PATH)) {
        throw "Key pair exists in AWS but $KEY_PATH is missing locally. You will not be able to SSH. Delete the key pair with: aws ec2 delete-key-pair --key-name $KEY_NAME --region $AWS_REGION"
    }
} else {
    aws ec2 create-key-pair --key-name $KEY_NAME --region $AWS_REGION `
        --key-type rsa --key-format pem `
        --query 'KeyMaterial' --output text | Set-Content -Path $KEY_PATH -NoNewline -Encoding ascii
    if ($LASTEXITCODE -ne 0) { throw 'Failed to create key pair.' }
    Write-Host "[ok]   Saved private key to $KEY_PATH" -ForegroundColor Green
}

# Tighten permissions (OpenSSH on Windows refuses overly open keys)
icacls $KEY_PATH /inheritance:r /grant:r "$($env:USERNAME):(R)" *> $null

Write-Host ""
Write-Host "== 2/3 Detect your public IP ==" -ForegroundColor Cyan
try {
    $myIp = (Invoke-RestMethod -Uri 'https://checkip.amazonaws.com' -TimeoutSec 15).Trim()
    $sshCidr = "$myIp/32"
    Write-Host "[ok]   SSH will be allowed from $sshCidr" -ForegroundColor Green
} catch {
    $sshCidr = '0.0.0.0/0'
    Write-Host "[warn] Could not detect your IP; SSH open to 0.0.0.0/0 (change it later)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "== 3/3 Deploy backend stack ==" -ForegroundColor Cyan
aws cloudformation deploy `
    --template-file "$PSScriptRoot\..\cloudformation\backend.yml" `
    --stack-name $BACKEND_STACK `
    --region $AWS_REGION `
    --capabilities CAPABILITY_IAM `
    --parameter-overrides `
        "ProjectName=$PROJECT" `
        "KeyName=$KEY_NAME" `
        "InstanceType=$INSTANCE_TYPE" `
        "SshLocation=$sshCidr" `
    --tags Project=$PROJECT ManagedBy=cloudformation

if ($LASTEXITCODE -ne 0) { throw 'CloudFormation deploy failed. See the events in the AWS Console.' }

$publicIp = Get-StackOutput -StackName $BACKEND_STACK -OutputKey PublicIp

# CloudFront rejects raw IPs as origins, so it needs a DNS name for the API.
# The EC2 public DNS only exists when the VPC has DNS hostnames enabled.
$instanceId = Get-StackOutput -StackName $BACKEND_STACK -OutputKey InstanceId
$vpcId = aws ec2 describe-instances --instance-ids $instanceId --region $AWS_REGION `
    --query 'Reservations[0].Instances[0].VpcId' --output text

if ($vpcId -and $vpcId -ne 'None') {
    $dnsEnabled = aws ec2 describe-vpc-attribute --vpc-id $vpcId --attribute enableDnsHostnames `
        --region $AWS_REGION --query 'EnableDnsHostnames.Value' --output text
    if ($dnsEnabled -ne 'True') {
        Write-Host "Enabling DNS hostnames on $vpcId (needed for CloudFront origin)..." -ForegroundColor Cyan
        aws ec2 modify-vpc-attribute --vpc-id $vpcId --enable-dns-hostnames --region $AWS_REGION
    }
}

Write-Host ""
Write-Host "Backend deployed." -ForegroundColor Green
Write-Host "  Public IP : $publicIp"
Write-Host "  SSH       : ssh -i `"$KEY_PATH`" ec2-user@$publicIp" -ForegroundColor Gray
Write-Host ""
Write-Host "Next: .\02-setup-server.ps1   (installs Docker on the instance, ~2 min)" -ForegroundColor Cyan
