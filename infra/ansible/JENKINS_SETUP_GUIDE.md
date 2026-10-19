# Jenkins Setup Guide — Coffee Home Blend

## Yêu cầu

| Thành phần | Phiên bản |
|---|---|
| Jenkins | 2.400+ (LTS) |
| Plugins | Pipeline, Git, SSH Agent, Credentials Binding, NodeJS |
| Node.js | 20.x |
| Ansible | 2.14+ (cài trong Jenkins container hoặc host) |
| OS | Ubuntu 22.04 / macOS / Windows + WSL2 |

---

## Bước 1 — Cài plugins

Vào Jenkins → **Manage Jenkins → Plugins → Available plugins**, cài:

- `Pipeline` (workflow-aggregator)
- `Git`
- `SSH Agent`
- `Credentials Binding`
- `NodeJS`
- `Ansible` *(optional — dùng CLI cũng OK)*
- `Plain Credentials` *(cho vault password file)*

→ Restart Jenkins.

---

## Bước 2 — Tạo Credentials

Vào **Manage Jenkins → Credentials → (global) → Add Credentials**.

### 2.1 — `github-ssh` (SSH Username with private key)

| Field | Value |
|---|---|
| Kind | SSH Username with private key |
| ID | `github-ssh` |
| Description | GitHub deploy key |
| Username | `git` |
| Private Key | *Enter directly* → paste nội dung `~/.ssh/github_deploy_key` |
| Passphrase | (bỏ trống nếu key không có passphrase) |

> Nếu repo là public, có thể dùng HTTPS + Personal Access Token thay thế.

### 2.2 — `vps-ssh-key` (SSH Username with private key)

| Field | Value |
|---|---|
| Kind | SSH Username with private key |
| ID | `vps-ssh-key` |
| Description | VPS deploy key |
| Username | `deploy` |
| Private Key | *Enter directly* → paste nội dung `~/.ssh/deploy_key` |
| Passphrase | (bỏ trống) |

### 2.3 — `vault-password` (Secret text)

| Field | Value |
|---|---|
| Kind | Secret text |
| ID | `vault-password` |
| Description | Ansible Vault password |
| Secret | `<password bạn đã tạo cho vault>` |

> ⚠️ Đây là password bạn dùng khi chạy `ansible-vault create group_vars/all/vault.yml`. KHÔNG commit password này.

### 2.4 — *(Optional)* `github-pat` (Personal Access Token)

Nếu repo GitHub là private và SSH key không hoạt động:

| Field | Value |
|---|---|
| Kind | Secret text |
| ID | `github-pat` |
| Secret | `<GitHub PAT với scope: repo, workflow>` |

---

## Bước 3 — Cấu hình Node.js Tool

Vào **Manage Jenkins → Tools → NodeJS Installations → Add NodeJS**:

| Field | Value |
|---|---|
| Name | `NodeJS-20` |
| Version | `NodeJS 20.20.2` |
| Global installation | ✅ |
| Install automatically | ✅ |

---

## Bước 4 — Tạo Pipeline jobs

### Job 1: `backend-ci-cd`

1. **New Item** → Name: `backend-ci-cd` → chọn **Pipeline** → OK
2. **General**:
   - ✅ Discard old builds → Max # of builds: 20
3. **Build Triggers** *(tuỳ chọn)*:
   - ✅ GitHub hook trigger for GITScm polling
4. **Pipeline**:
   - Definition: `Pipeline script from SCM`
   - SCM: `Git`
   - Repository URL: `https://github.com/Hungg212/Frontend-CI-CD.git` (hoặc SSH)
   - Credentials: `github-ssh` (hoặc `github-pat`)
   - Branch: `*/main`
   - Script Path: `Jenkinsfile.backend`
5. **Save**

### Job 2: `frontend-ci-cd`

Tương tự Job 1, nhưng:

- Name: `frontend-ci-cd`
- Script Path: `Jenkinsfile`

---

## Bước 5 — Cấu hình biến môi trường (tuỳ chọn)

Vào job → **Configure → Pipeline → Pipeline Syntax** hoặc trong `Jenkinsfile`:

```groovy
environment {
    DEPLOY_ENV  = 'dev'           // dev | staging | prod
    DEPLOY_HOST = 'YOUR_VPS_IP'   // chỉ dùng cho smoke test
    SSH_USER    = 'deploy'
}
```

Hoặc inject qua **Build Environment → Inject environment variables**.

---

## Bước 6 — Test build

1. Vào job `backend-ci-cd` → **Build Now**
2. Xem **Console Output** — các stage chạy lần lượt:
   - Checkout
   - Install Backend Dependencies
   - Type Check
   - Lint
   - Test
   - Build (TypeScript)
   - Package Artifact
   - Deploy with Ansible ← cần `vps-ssh-key` + `vault-password`
   - Smoke Test

---

## Bước 7 — Setup GitHub Webhook (auto-trigger)

### 7.1 Lấy webhook URL

Trong Jenkins: **Manage Jenkins → System → GitHub → GitHub Servers → Advanced** → copy **GitHub Webhook URL**.

Hoặc URL mặc định: `http://<jenkins-host>/github-webhook/`

### 7.2 Cấu hình GitHub

Vào repo GitHub → **Settings → Webhooks → Add webhook**:

| Field | Value |
|---|---|
| Payload URL | `http://<jenkins-host>/github-webhook/` |
| Content type | `application/json` |
| Events | `Just the push event` |
| SSL verification | Enable (nếu Jenkins chạy HTTPS) |

### 7.3 Enable trigger trong Jenkins job

Vào job → **Configure → Build Triggers → GitHub hook trigger for GITScm polling** ✅

---

## Bước 8 — Bootstrap lần đầu (manual)

Trước khi chạy Jenkins job, cần bootstrap VPS thủ công:

```bash
# Từ máy Jenkins (hoặc máy local có SSH key)
cd /path/to/Frontend-CI-CD
git pull
cd infra/ansible

# Tạo vault (lần đầu)
ansible-vault create group_vars/all/vault.yml
# Nhập: vault_db_password, vault_jwt_secret

# Test kết nối
ansible all -i inventories/dev.ini -m ping

# Bootstrap
ansible-playbook -i inventories/dev.ini playbooks/site.yml --ask-vault-pass
```

---

## Troubleshooting

| Lỗi | Nguyên nhân | Cách sửa |
|---|---|---|
| `Permission denied (publickey)` | SSH key chưa copy lên VPS | Chạy `ssh-copy-id -i ~/.ssh/deploy_key deploy@<vps-ip>` |
| `Vault password mismatch` | Sai vault password | Check credential `vault-password` |
| `sudo: a password is required` | User `deploy` chưa có NOPASSWD | Sửa `/etc/sudoers.d/deploy` trên VPS |
| `Couldn't find any revision to build` | Branch specifier sai | Dùng `*/main` trong job config |
| `No such DSL method 'X'` | Thiếu plugin | Cài plugin qua Manage Jenkins |
| `ECONNREFUSED 5432` | Postgres chưa chạy trên VPS | SSH vào VPS, `sudo systemctl start postgresql` |
| `Port 3000 already in use` | App chạy nhiều instance | `pm2 list` hoặc `systemctl status backend` |
| `git clone failed` trong Jenkins | Sai credentials | Đổi sang `github-pat` nếu SSH không hoạt động |
| `ansible-vault: file not found` | Vault chưa tạo | Chạy `ansible-vault create group_vars/all/vault.yml` |
| `ERROR! 'vault_db_password' is undefined` | Vault chưa mã hoá đúng cách | Verify bằng `ansible-vault view group_vars/all/vault.yml` |

---

## Checklist cuối cùng

- [ ] Jenkins đã cài đủ plugins
- [ ] Credentials `github-ssh`, `vps-ssh-key`, `vault-password` đã tạo
- [ ] NodeJS-20 tool đã config
- [ ] 2 pipeline jobs đã tạo (`backend-ci-cd`, `frontend-ci-cd`)
- [ ] VPS đã có user `deploy` + sudo NOPASSWD
- [ ] SSH key đã copy lên VPS
- [ ] Vault đã tạo + mã hoá thành công
- [ ] `ansible all -i inventories/dev.ini -m ping` → SUCCESS
- [ ] `ansible-playbook site.yml` chạy thành công
- [ ] Jenkins build #1 → màu xanh (✅)
- [ ] `curl http://<vps-ip>/api/health` → 200 OK
