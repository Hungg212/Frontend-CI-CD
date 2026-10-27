# Teardown — delete everything so you stop being billed.
# Requires typing 'DELETE' to confirm.

. "$PSScriptRoot\config.ps1"
Assert-AwsCli | Out-Null

$ErrorActionPreference = 'Stop'

Write-Host "This will permanently delete:" -ForegroundColor Yellow
Write-Host "  - CloudFormation stack $FRONTEND_STACK (S3 bucket + CloudFront + its contents)"
Write-Host "  - CloudFormation stack $BACKEND_STACK  (EC2 + Elastic IP + SG + IAM role)"
Write-Host "  - Key pair $KEY_NAME"
Write-Host "  - All data in the EC2 Postgres volume" -ForegroundColor Red
Write-Host ""
$answer = Read-Host "Type DELETE to continue"
if ($answer -ne 'DELETE') { Write-Host 'Aborted.'; exit 0 }

# 1) Frontend stack first: the bucket must be empty before CloudFormation can remove it.
$bucket = $null
try { $bucket = Get-StackOutput -StackName $FRONTEND_STACK -OutputKey BucketName } catch { }

if ($bucket) {
    Write-Host "Emptying s3://$bucket (including versions)..." -ForegroundColor Cyan
    aws s3 rm "s3://$bucket" --recursive --region $AWS_REGION | Out-Null

    # Remove noncurrent versions + delete markers left by versioning
    $versions = aws s3api list-object-versions --bucket $bucket --region $AWS_REGION `
        --query '{Objects: Versions[].{Key:Key,VersionId:VersionId}}' --output json | ConvertFrom-Json
    if ($versions.Objects) {
        $versions | ConvertTo-Json -Depth 5 | Set-Content "$env:TEMP\del-versions.json" -Encoding ascii
        aws s3api delete-objects --bucket $bucket --region $AWS_REGION `
            --delete "file://$env:TEMP\del-versions.json" | Out-Null
        Remove-Item "$env:TEMP\del-versions.json" -Force
    }
    $markers = aws s3api list-object-versions --bucket $bucket --region $AWS_REGION `
        --query '{Objects: DeleteMarkers[].{Key:Key,VersionId:VersionId}}' --output json | ConvertFrom-Json
    if ($markers.Objects) {
        $markers | ConvertTo-Json -Depth 5 | Set-Content "$env:TEMP\del-markers.json" -Encoding ascii
        aws s3api delete-objects --bucket $bucket --region $AWS_REGION `
            --delete "file://$env:TEMP\del-markers.json" | Out-Null
        Remove-Item "$env:TEMP\del-markers.json" -Force
    }
}

Write-Host "Deleting $FRONTEND_STACK..." -ForegroundColor Cyan
aws cloudformation delete-stack --stack-name $FRONTEND_STACK --region $AWS_REGION
aws cloudformation wait stack-delete-complete --stack-name $FRONTEND_STACK --region $AWS_REGION

Write-Host "Deleting $BACKEND_STACK..." -ForegroundColor Cyan
aws cloudformation delete-stack --stack-name $BACKEND_STACK --region $AWS_REGION
aws cloudformation wait stack-delete-complete --stack-name $BACKEND_STACK --region $AWS_REGION

Write-Host "Deleting key pair..." -ForegroundColor Cyan
$deleted = Invoke-Aws @('ec2', 'delete-key-pair', '--key-name', $KEY_NAME, '--region', $AWS_REGION)
if (-not $deleted.Success) {
    Write-Host "[warn] Could not delete key pair (it may not exist)." -ForegroundColor Yellow
}

if (Test-Path $KEY_PATH) {
    Remove-Item $KEY_PATH -Force
    Write-Host "  removed $KEY_PATH" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Everything deleted. Also check:" -ForegroundColor Green
Write-Host "  - Billing -> Cost Explorer in 24h to confirm nothing is still running"
Write-Host "  - CloudWatch Logs groups (if you enabled log shipping)"
