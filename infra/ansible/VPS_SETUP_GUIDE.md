# VPS Setup Guide — Coffee Home Blend

## Mục tiêu

Chuẩn bị VPS Ubuntu 22.04 để chạy Ansible bootstrap + deploy backend.

---

## Bước 1 — Chuẩn bị SSH key trên máy điều khiển (laptop của bạn)

### 1.1 Tạo SSH key riêng cho deploy

```powershell
# Chạy trên máy Windows (PowerShell)
ssh-keygen -t ed25519 -C "jenkins-deploy" -f "$env:USERPROFILE\.ssh\deploy_key" -N ""
```

### 1.2 Xem public key

```powershell
Get-Content "$env:USERPROFILE\.ssh\deploy_key.pub"
```

Output sẽ có dạng:
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAA... jenkins-deploy
```

→ Copy dòng này, sẽ cần paste vào VPS ở bước 2.3

### 1.3 Nếu dùng WSL

```bash
ssh-keygen -t ed25519 -C "jenkins-deploy" -f ~/.ssh/deploy_key -N ""
cat ~/.ssh/deploy_key.pub
```

---

## Bước 2 — Setup VPS

### 2.1 SSH vào VPS lần đầu

```powershell
ssh root@<YOUR-VPS-IP>
# Hoặc dùng key nếu đã có:
ssh -i ~/.ssh/id_rsa root@<YOUR-VPS-IP>
```

> **Lưu ý**: Nếu dùng password root, hãy đổi sang key sau khi setup xong.

### 2.2 Tạo user `deploy`

```bash
# Tạo user
adduser deploy
usermod -aG sudo deploy

# Cho user deploy quyền sudo không cần password
echo "deploy ALL=(ALL) NOPASSWD: ALL" | tee /etc/sudoers.d/deploy
chmod 0440 /etc/sudoers.d/deploy

# Switch sang user deploy
su - deploy
mkdir -p ~/.ssh
chmod 700 ~/.ssh
```

### 2.3 Thêm public key cho user deploy

**Cách 1 — Copy key trực tiếp** (trên máy Windows):

```powershell
ssh-copy-id -i "$env:USERPROFILE\.ssh\deploy_key.pub" deploy@<YOUR-VPS-IP>
```

**Cách 2 — Thêm thủ công** (đã SSH vào VPS):

```bash
# Trên VPS, đang login as deploy
nano ~/.ssh/authorized_keys
# Paste public key (từ bước 1.2) vào file
# Lưu: Ctrl+O, Enter, Ctrl+X
chmod 600 ~/.ssh/authorized_keys
```

### 2.4 Test SSH key

```powershell
# Test từ máy Windows
ssh -i "$env:USERPROFILE\.ssh\deploy_key" deploy@<YOUR-VPS-IP> "echo OK && whoami && uname -a"
```

Kết quả mong đợi:
```
OK
deploy
Linux vps-name 5.15.0-generic #1 SMP ... x86_64 x86_64 x86_64 GNU/Linux
```

### 2.5 Kiểm tra sudo không cần password

```bash
# Trên VPS, đang là user deploy
sudo apt update
# Nếu không hỏi password = OK
```

### 2.6 Firewall (UFW)

```bash
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
sudo ufw status
```

### 2.7 Kiểm tra thông tin VPS

```bash
hostname
# → dev-vps-01

cat /etc/os-release | grep PRETTY_NAME
# → PRETTY_NAME="Ubuntu 22.04 LTS"

df -h /
# → Kiểm tra đủ disk (≥ 20GB)

free -h
# → Kiểm tra đủ RAM (≥ 1GB)
```

---

## Bước 3 — Cập nhật inventory

Sau khi có IP thật, cập nhật `D:\Devopp\coffee-home-blend\infra\ansible\inventories\dev.ini`:

```ini
[webservers]
dev-web-01 ansible_host=<YOUR-VPS-IP> ansible_user=deploy ansible_ssh_private_key_file=~/.ssh/deploy_key

[dbservers]
dev-db-01 ansible_host=<YOUR-VPS-IP> ansible_user=deploy ansible_ssh_private_key_file=~/.ssh/deploy_key

[all:vars]
env_name=dev
app_name=coffee-home-blend-backend
app_port=4000
node_version=20
pg_version=16
```

---

## Bước 4 — Test kết nối với Ansible

```powershell
# Trên Windows (dùng WSL)
wsl -d Ubuntu-22.04 bash -c "
cd /mnt/d/Devopp/coffee-home-blend/infra/ansible
ansible all -i inventories/dev.ini -m ping -e 'ansible_ssh_private_key_file=~/.ssh/deploy_key'
"
```

Kết quả mong đợi:
```
dev-web-01 | SUCCESS => {
    "changed": false,
    "ping": "pong"
}
dev-db-01 | SUCCESS => {
    "changed": false,
    "ping": "pong"
}
```

---

## Bước 5 — Bootstrap lần đầu (cài Node.js + PostgreSQL + Nginx)

**QUAN TRỌNG**: Trước khi chạy, cần tạo vault (bước tiếp theo):

```powershell
cd D:\Devopp\coffee-home-blend\infra\ansible
.\vault-helper.ps1 -Action create
```

Nội dung vault:
```yaml
vault_db_password: "CoffeeDB_StrongP@ss_2026!"
vault_jwt_secret: "paste-output-cua-openssl-rand-base64-48"
```

Sau đó:

```powershell
cd D:\Devopp\coffee-home-blend\infra\ansible
.\vault-helper.ps1 -Action verify
# Đợi tất cả playbook pass

# Bootstrap (CHẠY THẬT — sẽ cài package lên VPS)
wsl -d Ubuntu-22.04 bash -c "
cd /mnt/d/Devopp/coffee-home-blend/infra/ansible
cp -r . /tmp/ansible-prod && chmod -R go-w /tmp/ansible-prod
cd /tmp/ansible-prod
ansible-playbook -i inventories/dev.ini playbooks/site.yml --ask-vault-pass
"
```

---

## Checklist cuối cùng

- [ ] User `deploy` đã tạo với sudo NOPASSWD
- [ ] SSH key `deploy_key` đã copy lên VPS
- [ ] SSH không cần password vào VPS
- [ ] `sudo apt update` không cần password
- [ ] Firewall mở port 22, 80, 443
- [ ] Vault đã tạo với password thật
- [ ] `ansible all -i inventories/dev.ini -m ping` → SUCCESS
- [ ] `site.yml` chạy thành công
