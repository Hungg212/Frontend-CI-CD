#Requires -Version 5.1
<#
.SYNOPSIS
    Helper script để quản lý Ansible Vault cho coffee-home-blend
#>

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('create', 'edit', 'encrypt', 'rekey', 'verify', 'view')]
    [string]$Action
)

$ErrorActionPreference = 'Stop'
$AnsibleDir = $PSScriptRoot

function Write-Step { param($msg) Write-Host "`n===> $msg" -ForegroundColor Cyan }
function Write-OK   { param($msg) Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Warn { param($msg) Write-Host "  [!] $msg" -ForegroundColor Yellow }

switch ($Action) {
    'create' {
        Write-Step "Tạo vault MỚI (sẽ hỏi password)"
        wsl -d Ubuntu-22.04 bash -c "cd /mnt/d/Devopp/coffee-home-blend/infra/ansible && ansible-vault create group_vars/vault.yml"
    }

    'edit' {
        Write-Step "Mở vault để sửa (sẽ hỏi password)"
        wsl -d Ubuntu-22.04 bash -c "cd /mnt/d/Devopp/coffee-home-blend/infra/ansible && ansible-vault edit group_vars/vault.yml"
    }

    'view' {
        Write-Step "Xem nội dung vault (read-only, sẽ hỏi password)"
        wsl -d Ubuntu-22.04 bash -c "cd /mnt/d/Devopp/coffee-home-blend/infra/ansible && ansible-vault view group_vars/vault.yml"
    }

    'encrypt' {
        Write-Step "Mã hoá file plain-text → vault"
        Write-Warn "Đặt file vào group_vars/plain-secrets.yml, sau đó chạy encrypt"
        wsl -d Ubuntu-22.04 bash -c "cd /mnt/d/Devopp/coffee-home-blend/infra/ansible && [ -f group_vars/plain-secrets.yml ] && ansible-vault encrypt group_vars/plain-secrets.yml --output group_vars/vault.yml && rm group_vars/plain-secrets.yml || echo 'Khong tim thay group_vars/plain-secrets.yml'"
    }

    'rekey' {
        Write-Step "Đổi password vault"
        wsl -d Ubuntu-22.04 bash -c "cd /mnt/d/Devopp/coffee-home-blend/infra/ansible && ansible-vault rekey group_vars/vault.yml"
    }

    'verify' {
        Write-Step "Verify vault + chạy syntax check toàn bộ"
        Push-Location $AnsibleDir
        try {
            wsl -d Ubuntu-22.04 python3 -c "s=open('/mnt/d/Devopp/coffee-home-blend/infra/ansible/test-local.sh','rb').read().replace(b'\r\n',b'\n'); open('/tmp/check.sh','wb').write(s)"
            wsl -d Ubuntu-22.04 bash /tmp/check.sh
            Write-OK "Tất cả playbook pass syntax check"
        } finally {
            Pop-Location
        }
    }
}

Write-Host ""
