#Requires -Version 5.1
<#
.SYNOPSIS
    Helper script để quản lý Ansible Vault cho coffee-home-blend
.DESCRIPTION
    Tạo / sửa / encrypt / decrypt file vault + verify syntax
.NOTES
    Chạy từ PowerShell:  .\vault-helper.ps1 -Action create
#>

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('create', 'edit', 'encrypt', 'rekey', 'verify', 'init-template')]
    [string]$Action
)

$ErrorActionPreference = 'Stop'
$AnsibleDir = $PSScriptRoot

function Write-Step { param($msg) Write-Host "`n===> $msg" -ForegroundColor Cyan }
function Write-OK   { param($msg) Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Warn { param($msg) Write-Host "  [!] $msg" -ForegroundColor Yellow }

switch ($Action) {
    'init-template' {
        Write-Step "Tạo file template vault (nếu chưa có)"
        $vaultFile = Join-Path $AnsibleDir 'group_vars\all\vault.yml'
        $example   = Join-Path $AnsibleDir 'group_vars\all\vault.yml.example'

        if (Test-Path $vaultFile) {
            Write-Warn "vault.yml đã tồn tại — không ghi đè"
        } elseif (Test-Path $example) {
            Copy-Item $example $vaultFile
            Write-OK "Đã copy template → $vaultFile"
            Write-Host "  Bây giờ hãy sửa nội dung vault.yml bằng editor yêu thích" -ForegroundColor Gray
        } else {
            Write-Warn "Không tìm thấy vault.yml.example"
        }
    }

    'create' {
        Write-Step "Tạo vault MỚI (sẽ hỏi password)"
        wsl -d Ubuntu-22.04 bash -c "cd /mnt/d/Devopp/coffee-home-blend/infra/ansible && ansible-vault create group_vars/all/vault.yml"
    }

    'edit' {
        Write-Step "Mở vault để sửa (sẽ hỏi password)"
        wsl -d Ubuntu-22.04 bash -c "cd /mnt/d/Devopp/coffee-home-blend/infra/ansible && ansible-vault edit group_vars/all/vault.yml"
    }

    'encrypt' {
        Write-Step "Mã hoá file vault (nếu đang ở dạng plain-text)"
        wsl -d Ubuntu-22.04 bash -c "cd /mnt/d/Devopp/coffee-home-blend/infra/ansible && ansible-vault encrypt group_vars/all/vault.yml"
    }

    'rekey' {
        Write-Step "Đổi password vault"
        wsl -d Ubuntu-22.04 bash -c "cd /mnt/d/Devopp/coffee-home-blend/infra/ansible && ansible-vault rekey group_vars/all/vault.yml"
    }

    'verify' {
        Write-Step "Verify vault + chạy syntax check toàn bộ"
        Push-Location $AnsibleDir
        try {
            # Convert CRLF -> LF nếu cần (cho file shell)
            wsl -d Ubuntu-22.04 python3 -c "s=open('/mnt/d/Devopp/check-ansible-vars.sh','rb').read().replace(b'\r\n',b'\n'); open('/tmp/check.sh','wb').write(s)"
            wsl -d Ubuntu-22.04 bash /tmp/check.sh
            Write-OK "Tất cả playbook pass syntax check"
        } finally {
            Pop-Location
        }
    }
}

Write-Host ""
