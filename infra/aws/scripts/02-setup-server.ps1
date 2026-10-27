# Step 2 — Configure the server and start the API + PostgreSQL.
# Idempotent: safe to re-run (re-pulls code, rebuilds the image, restarts).
# Assumes the repo is pushed to GitHub with docker-compose.ec2.yml committed.

. "$PSScriptRoot\config.ps1"
Assert-AwsCli | Out-Null

$ErrorActionPreference = 'Stop'

    $publicIp = Get-StackOutput -StackName $BACKEND_STACK -OutputKey PublicIp
Write-Host "Server: $publicIp" -ForegroundColor Cyan

if (-not (Test-Path $KEY_PATH)) { throw "Private key not found: $KEY_PATH" }

function Invoke-Remote {
    <#
    Runs a bash script on the instance.

    The script is uploaded with scp and executed with `bash <file>` instead of
    being piped through SSH stdin. Two reasons:

      * Passing a multi-line script as an SSH argument breaks under Windows
        PowerShell 5.1: it re-quotes the argument and bash then chokes on
        characters such as '(' in `if [ -f ... ]; then`.
      * Piping through stdin is fragile on Windows because the stream writer
        can inject a UTF-8 BOM, which bash reports as
        "syntax error near unexpected token 'then'".

    Use -Literal for scripts that must not be interpolated by PowerShell.
    #>
    param(
        [Parameter(Mandatory)][string]$Script,
        [switch]$Sudo
    )

    $sshArgs = @(
        '-i', $KEY_PATH,
        '-o', 'StrictHostKeyChecking=accept-new',
        '-o', 'ConnectTimeout=15',
        '-o', 'ServerAliveInterval=15',
        "ec2-user@$publicIp"
    )

    # A unique remote name keeps concurrent runs from colliding.
    $remoteFile = "/tmp/coffee-remote-$([guid]::NewGuid().ToString('N').Substring(0, 8)).sh"

    $tmp = New-TemporaryFile
    try {
        # ASCII-safe: every script we ship here is plain ASCII. Writing ASCII
        # guarantees bash never sees a stray multi-byte character.
        $body = ($Script -replace "`r`n", "`n")
        [System.IO.File]::WriteAllText($tmp.FullName, $body, [System.Text.Encoding]::ASCII)

        & scp -i $KEY_PATH -o StrictHostKeyChecking=accept-new -o ConnectTimeout=15 `
            $tmp.FullName "ec2-user@${publicIp}:$remoteFile" 2>$null
        if ($LASTEXITCODE -ne 0) { throw 'Failed to upload the remote script.' }

        $runCmd = if ($Sudo) { "sudo bash $remoteFile" } else { "bash $remoteFile" }

        $proc = New-Object System.Diagnostics.Process
        $proc.StartInfo.FileName = 'ssh'
        $proc.StartInfo.Arguments = ($sshArgs -join ' ') + ' ' + $runCmd
        $proc.StartInfo.UseShellExecute = $false
        $proc.StartInfo.RedirectStandardOutput = $true
        $proc.StartInfo.RedirectStandardError = $true
        $proc.StartInfo.CreateNoWindow = $true

        [void]$proc.Start()

        # Read stderr on a background thread. Reading stdout to completion
        # first deadlocks as soon as the remote command fills the stderr pipe
        # buffer (a `docker compose build` produces a lot of stderr).
        $stderrText = $null
        $errReader = $proc.StandardError.ReadToEndAsync()
        $stdout = $proc.StandardOutput.ReadToEnd()
        $proc.WaitForExit()
        $stderrText = $errReader.Result

        if ($stdout) { Write-Host $stdout.TrimEnd() }
        if ($stderrText) { Write-Host $stderrText.TrimEnd() -ForegroundColor DarkGray }

        $exitCode = $proc.ExitCode

        # Always clean up the uploaded script.
        & ssh @sshArgs "rm -f $remoteFile" 2>$null | Out-Null

        if ($exitCode -ne 0) {
            throw "Remote command failed (exit $exitCode)."
        }
    } finally {
        Remove-Item $tmp -Force -ErrorAction SilentlyContinue
    }
}

Write-Host ""
    Write-Host "== 1/4 Waiting for the instance to boot ==" -ForegroundColor Cyan
$ready = $false
for ($i = 1; $i -le 40; $i++) {
    & ssh -i $KEY_PATH -o StrictHostKeyChecking=accept-new -o ConnectTimeout=8 `
        "ec2-user@$publicIp" 'echo ready' 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) { $ready = $true; break }
    Write-Host "   waiting... ($i/40)" -ForegroundColor DarkGray
    Start-Sleep -Seconds 10
}
if (-not $ready) { throw 'Could not SSH into the instance. Check the security group and that the key matches.' }
    Write-Host "[ok]   SSH is up" -ForegroundColor Green

Write-Host ""
Write-Host "== 2/4 Waiting for cloud-init (Docker install) ==" -ForegroundColor Cyan
Invoke-Remote -Script @'
sudo cloud-init status --wait >/dev/null 2>&1 || true
docker --version
docker compose version
'@

    Write-Host ""
Write-Host "== 3/4 Preparing /opt/coffee/.env ==" -ForegroundColor Cyan
# Generate secrets locally, then push them over SSH (never via the shell history).
$dbPassword = -join ((48..57) + (97..122) | Get-Random -Count 40 | ForEach-Object { [char]$_ })
$jwtSecret = -join ((48..57) + (97..122) | Get-Random -Count 64 | ForEach-Object { [char]$_ })

$envFile = @"
POSTGRES_USER=coffee
POSTGRES_DB=coffee
POSTGRES_PASSWORD=$dbPassword
    JWT_SECRET=$jwtSecret
"@

$tmp = New-TemporaryFile
[System.IO.File]::WriteAllText($tmp.FullName, $envFile, [System.Text.Encoding]::ASCII)
& scp -i $KEY_PATH -o StrictHostKeyChecking=accept-new $tmp "ec2-user@${publicIp}:/tmp/coffee.env" 2>$null
Remove-Item $tmp -Force
if ($LASTEXITCODE -ne 0) { throw 'Failed to copy .env to the server.' }

# Keep an existing .env so re-runs do not rotate the DB password.
    Invoke-Remote -Script @'
if [ -f /opt/coffee/.env ]; then
  echo "[keep] /opt/coffee/.env already exists (secrets preserved)"
else
  mkdir -p /opt/coffee
  mv /tmp/coffee.env /opt/coffee/.env
  chmod 600 /opt/coffee/.env
  echo "[ok] created /opt/coffee/.env"
fi
rm -f /tmp/coffee.env
'@

Write-Host ""
Write-Host "== 4/4 Clone repo and start containers ==" -ForegroundColor Cyan
Invoke-Remote -Script @"
set -e
sudo mkdir -p $REMOTE_APP_DIR
sudo chown -R ec2-user:ec2-user /opt/coffee

if [ -d $REMOTE_APP_DIR/.git ]; then
      git -C $REMOTE_APP_DIR fetch --depth 1 origin $REPO_BRANCH
  git -C $REMOTE_APP_DIR reset --hard origin/$REPO_BRANCH
else
  git clone --depth 1 --branch $REPO_BRANCH $REPO_URL $REMOTE_APP_DIR
fi

cp /opt/coffee/.env $REMOTE_APP_DIR/.env
cd $REMOTE_APP_DIR
sudo docker compose -f docker-compose.ec2.yml up -d --build
sudo docker compose -f docker-compose.ec2.yml ps
"@

Write-Host ""
Write-Host "== Verifying the API ==" -ForegroundColor Cyan
$healthy = $false
for ($i = 1; $i -le 30; $i++) {
    try {
        $res = Invoke-RestMethod -Uri "http://${publicIp}/api/health" -TimeoutSec 8
        if ($res.ok) { $healthy = $true; break }
    } catch { }
       Write-Host "   waiting for the API... ($i/30)" -ForegroundColor DarkGray
    Start-Sleep -Seconds 6
}

if ($healthy) {
    Write-Host "[ok]   API healthy: http://$publicIp/api/health" -ForegroundColor Green
} else {
    Write-Host "[warn] API did not answer yet. Check logs:" -ForegroundColor Yellow
    Write-Host "       ssh -i `"$KEY_PATH`" ec2-user@$publicIp" -ForegroundColor Gray
    Write-Host "       cd $REMOTE_APP_DIR && sudo docker compose -f docker-compose.ec2.yml logs --tail 100" -ForegroundColor Gray
   }

Write-Host ""
Write-Host "Next: .\03-deploy-frontend.ps1" -ForegroundColor Cyan
