# Ansible Vault — Hướng dẫn nhanh

## Cấu trúc vault

```
infra/ansible/
├── group_vars/
│   ├── all.yml          ← Main vars, load vault bằng `vars_files: [vault.yml]`
│   ├── dbservers.yml
│   ├── webservers.yml
│   └── vault.yml        ← FILE VAULT (đã mã hoá, KHÔNG commit)
└── .vault-pass          ← Password file (KHÔNG commit, có trong .gitignore)
```

> **Quan trọng**: `vault.yml` đặt **cùng cấp** với `all.yml` (không phải trong `group_vars/all/`) để `vars_files: [vault.yml]` resolve đúng đường dẫn.

## Bước 1 — Tạo vault (lần đầu)

Vault chứa 2 secret bắt buộc:

| Tên biến | Mục đích | Gợi ý giá trị |
|---|---|---|
| `vault_db_password` | Mật khẩu user `backend_user` PostgreSQL | ≥16 ký tự, chữ hoa/thường/số/ký tự đặc biệt |
| `vault_jwt_secret` | Secret ký JWT token | Random ≥32 ký tự (vd: `openssl rand -base64 48`) |

### Tạo nhanh bằng PowerShell helper:

```powershell
cd D:\Devopp\coffee-home-blend\infra\ansible
.\vault-helper.ps1 -Action create
```

→ Sẽ mở editor trong WSL. Bạn gõ:

```yaml
vault_db_password: "CoffeeDB_StrongP@ss_2026!"
vault_jwt_secret: "paste-output-cua-openssl-rand-base64-48"
```

→ Lưu + thoát. File `group_vars/vault.yml` được mã hoá AES-256 tự động.

### Tạo JWT secret random:

```powershell
# Trong WSL
openssl rand -base64 48
```

## Bước 2 — Verify vault

```powershell
.\vault-helper.ps1 -Action verify
```

Lệnh này sẽ:
- Chạy `--syntax-check` cho 5 playbook
- Liệt kê biến resolve từ `group_vars`

## Bước 3 — Dùng vault khi chạy playbook

### Cách 1: Hỏi password mỗi lần

```bash
ansible-playbook -i inventories/dev.ini playbooks/site.yml --ask-vault-pass
```

### Cách 2: Dùng file password (local dev)

```bash
echo "your-vault-password" > .vault-pass
chmod 600 .vault-pass
ansible-playbook -i inventories/dev.ini playbooks/site.yml --vault-password-file .vault-pass
```

## Bước 4 — Tích hợp Jenkins

Trong `Jenkinsfile.backend`, dùng credential `vault-password`:

```groovy
stage('Deploy with Ansible') {
    steps {
        sshagent(['vps-ssh-key']) {
            withCredentials([string(credentialsId: 'vault-password', variable: 'VAULT_PASS')]) {
                sh """
                    set -e
                    cd \${ANSIBLE_DIR}
                    ansible-playbook -i inventories/\${DEPLOY_ENV}.ini \
                        playbooks/deploy-backend.yml \
                        -e "app_version=\${IMAGE_TAG} \
                            app_artifact=\${WORKSPACE}/backend-\${IMAGE_TAG}.tar.gz \
                            deploy_user=\${SSH_USER}" \
                        --vault-password-file <(echo "\$VAULT_PASS") \
                        --diff
                """
            }
        }
    }
}
```

## Lệnh vault thường dùng

| Lệnh | Mục đích |
|---|---|
| `ansible-vault create <file>` | Tạo file vault mới |
| `ansible-vault edit <file>` | Sửa file vault |
| `ansible-vault view <file>` | Xem (read-only) |
| `ansible-vault encrypt <file>` | Mã hoá file plain-text |
| `ansible-vault decrypt <file>` | Giải mã |
| `ansible-vault rekey <file>` | Đổi password |
| `ansible-vault --version` | Xem phiên bản |

## ⚠️ Bảo mật

- ✅ `vault.yml` **đã có trong `.gitignore`**
- ✅ `.vault-pass` **đã có trong `.gitignore`**
- ✅ KHÔNG lưu password vault trong file text trong repo
- ✅ Jenkins dùng credential `vault-password` (Secret text) chứ không hardcode
- ✅ Trên VPS, vault password chỉ cần cho **bootstrap lần đầu**; deploy sau dùng SSH key
- ✅ Đổi vault password mỗi 3-6 tháng bằng `ansible-vault rekey`

## Lỗi thường gặp

| Lỗi | Nguyên nhân | Cách sửa |
|---|---|---|
| `ERROR! 'vault_db_password' is undefined` | Vault chưa tạo hoặc password sai | Chạy `ansible-vault create group_vars/vault.yml` |
| `Decryption failed` | Vault password sai | Nhập lại đúng password |
| `ERROR! file not found: vault.yml` | Sai vị trí file vault | Đảm bảo vault ở `group_vars/vault.yml` (không phải `group_vars/all/vault.yml`) |
| `ERROR! A vault password is required` | Thiếu `--ask-vault-pass` hoặc `--vault-password-file` | Thêm cờ phù hợp |
