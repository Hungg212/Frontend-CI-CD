# Ansible Vault — Hướng dẫn nhanh

## Bước 1 — Tạo vault (lần đầu)

Vault chứa 2 secret bắt buộc:

| Tên biến | Mục đích | Gợi ý giá trị |
|---|---|---|
| `vault_db_password` | Mật khẩu user `backend_user` PostgreSQL | ≥16 ký tự, gồm chữ hoa/thường/số/ký tự đặc biệt |
| `vault_jwt_secret` | Secret ký JWT token | Random ≥32 ký tự (vd: `openssl rand -base64 48`) |

### Cách tạo nhanh nhất (Windows + WSL):

```powershell
cd D:\Devopp\coffee-home-blend\infra\ansible
.\vault-helper.ps1 -Action create
```

→ Ansible sẽ mở editor (mặc định `vi`). Bạn gõ:

```yaml
vault_db_password: "CoffeeDB_StrongP@ss_2026!"
vault_jwt_secret: "your-random-64-char-jwt-secret-here"
```

→ Lưu và thoát. File `group_vars/all/vault.yml` sẽ được mã hoá tự động.

### Tạo JWT secret random:

```powershell
openssl rand -base64 48
```

hoặc trong WSL:

```bash
openssl rand -base64 48
```

## Bước 2 — Verify vault hoạt động

```powershell
cd D:\Devopp\coffee-home-blend\infra\ansible
.\vault-helper.ps1 -Action verify
```

Lệnh này sẽ:
- Chạy `--syntax-check` cho cả 5 playbook
- Liệt kê biến resolve từ `group_vars`

## Bước 3 — Dùng vault khi chạy playbook

```bash
# Cách 1: hỏi password mỗi lần
ansible-playbook -i inventories/dev.ini playbooks/site.yml --ask-vault-pass

# Cách 2: dùng file password (CHỈ dùng cho local/dev, KHÔNG commit)
echo "your-vault-password" > .vault-pass
chmod 600 .vault-pass
ansible-playbook -i inventories/dev.ini playbooks/site.yml --vault-password-file .vault-pass
```

## Bước 4 — Tích hợp vào Jenkins

Trong `Jenkinsfile.backend`, thêm vault password từ credential:

```groovy
stage('Deploy with Ansible') {
    steps {
        sshagent(['vps-ssh-key']) {
            withCredentials([string(credentialsId: 'vault-password', variable: 'VAULT_PASS')]) {
                sh """
                    set -e
                    cd ${ANSIBLE_DIR}
                    ansible-playbook -i inventories/${DEPLOY_ENV}.ini \
                        playbooks/deploy-backend.yml \
                        -e "app_version=${IMAGE_TAG} \
                            app_artifact=${WORKSPACE}/backend-${IMAGE_TAG}.tar.gz \
                            deploy_user=${SSH_USER}" \
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
| `ansible-vault view <file>` | Xem nội dung (read-only) |
| `ansible-vault encrypt <file>` | Mã hoá file plain-text |
| `ansible-vault decrypt <file>` | Giải mã về plain-text |
| `ansible-vault rekey <file>` | Đổi password |
| `ansible-vault --version` | Xem phiên bản |

## ⚠️ Lưu ý bảo mật

- ✅ File `vault.yml` **đã có trong `.gitignore`** — không commit
- ✅ KHÔNG lưu password vault trong file text trong repo
- ✅ Jenkins dùng credential `vault-password` (Secret text) chứ không hardcode
- ✅ Trên VPS, vault password chỉ cần cho **bootstrap lần đầu**; sau đó Ansible dùng SSH key
- ✅ Đổi vault password định kỳ (3-6 tháng) bằng `ansible-vault rekey`
