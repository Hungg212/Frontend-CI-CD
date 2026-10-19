# Ansible Infrastructure for Coffee Home Blend

Hệ thống triển khai tự động cho backend sử dụng **Ansible**.

## 🎯 Mục tiêu

- Tự động hóa việc cài đặt + cấu hình server (Node.js, PostgreSQL, Nginx)
- Triển khai backend theo mô hình **rolling release** (zero-downtime)
- Rollback nhanh khi có sự cố
- Quản lý đa môi trường: `dev` / `staging` / `prod`

## 📁 Cấu trúc

```
infra/ansible/
├── ansible.cfg                      # Config chung
├── requirements.yml                 # Galaxy collections
├── README.md                        # File này
│
├── inventories/                     # Định nghĩa máy chủ
│   ├── dev.ini                      #   - Dev environment
│   ├── staging.ini                  #   - Staging
│   └── prod.ini                     #   - Production
│
├── group_vars/                      # Biến theo nhóm
│   ├── all.yml                      #   - Toàn cục
│   ├── webservers.yml               #   - Nhóm web
│   └── dbservers.yml                #   - Nhóm DB
│
├── playbooks/                       # Các playbook chính
│   ├── site.yml                     #   - Bootstrap tất cả
│   ├── deploy-backend.yml           #   - Deploy app
│   ├── rollback.yml                 #   - Quay về bản cũ
│   └── health-check.yml             #   - Kiểm tra tổng thể
│
└── roles/                           # Roles tái sử dụng
    ├── common/                      #   - Setup cơ bản
    ├── nodejs/                      #   - Cài Node + PM2
    ├── postgres/                    #   - Cài + config PostgreSQL
    ├── nginx/                       #   - Reverse proxy
    └── deploy-app/                  #   - Rolling deploy
```

## 🚀 Quick Start

### 1. Cài đặt Ansible

```bash
# Ubuntu/Debian
sudo apt install ansible -y

# macOS
brew install ansible

# Cài collections cần thiết
ansible-galaxy collection install -r requirements.yml
```

### 2. Cấu hình SSH key

```bash
# Trên máy chạy Ansible
ssh-keygen -t ed25519 -C "ansible-deploy"

# Copy key sang từng server
ssh-copy-id deploy@192.168.56.101   # dev-web-01
ssh-copy-id deploy@192.168.56.102   # dev-db-01
```

### 3. Test kết nối

```bash
cd infra/ansible
ansible all -i inventories/dev.ini -m ping
```

### 4. Tạo vault secrets

```bash
# Tạo file mã hoá password
ansible-vault create group_vars/all/vault.yml
```

Trong file vault, thêm:
```yaml
vault_pg_password: "your-strong-db-password"
vault_jwt_secret: "your-random-64-char-jwt-secret"
vault_cors_origin: "https://your-frontend.com"
```

### 5. Bootstrap lần đầu

```bash
# Cài đặt tất cả (Node, PostgreSQL, Nginx) lên toàn bộ servers
ansible-playbook -i inventories/dev.ini playbooks/site.yml --ask-vault-pass
```

### 6. Deploy ứng dụng

```bash
# Từ máy Jenkins (đã build sẵn artifact):
ansible-playbook -i inventories/prod.ini playbooks/deploy-backend.yml \
  -e "app_artifact=/var/lib/jenkins/jobs/coffee-home-blend-backend/builds/42/archive/backend-abc1234.tar.gz" \
  -e "app_version=v1.2.0" \
  --ask-vault-pass
```

## 🔧 Các lệnh thường dùng

```bash
# Kiểm tra syntax playbook
ansible-playbook --syntax-check -i inventories/dev.ini playbooks/deploy-backend.yml

# Dry-run (không thực sự chạy)
ansible-playbook -i inventories/dev.ini playbooks/deploy-backend.yml --check --diff

# Deploy với tag cụ thể
ansible-playbook -i inventories/prod.ini playbooks/deploy-backend.yml --tags deploy

# Xem thông tin hosts
ansible all -i inventories/prod.ini --list-hosts

# Kiểm tra health tổng thể
ansible-playbook -i inventories/prod.ini playbooks/health-check.yml

# Rollback về release trước
ansible-playbook -i inventories/prod.ini playbooks/rollback.yml

# Rollback về release cụ thể
ansible-playbook -i inventories/prod.ini playbooks/rollback.yml -e "rollback_to=20251019143000"
```

## 🏗️ Kiến trúc triển khai

```
┌─────────────────────────────────────────────────┐
│              JENKINS CI/CD                        │
│  (Build → Test → Package → Trigger Ansible)       │
└────────────┬────────────────────────────────────┘
             │ SSH
             ▼
┌─────────────────────────────────────────────────┐
│        ANSIBLE CONTROLLER                         │
│  (Chạy playbooks/roles)                           │
└────────┬────────────────────┬───────────────────┘
         │                    │
         ▼                    ▼
   ┌──────────┐         ┌──────────┐
   │ WEB      │         │ DB       │
   │ SERVERS  │         │ SERVERS  │
   │          │         │          │
   │ ┌──────┐ │         │ ┌──────┐ │
   │ │NGINX │◄├─────────┤►│POSTGR│ │
   │ └──┬───┘ │   SQL   │ │ES    │ │
   │ ┌──▼───┐ │         │ └──────┘ │
   │ │ NODE │ │         │          │
   │ │+ PM2 │ │         │          │
   │ └──────┘ │         │          │
   └──────────┘         └──────────┘
```

## 🔐 Bảo mật

1. **Luôn dùng Ansible Vault** cho passwords/secrets
2. **Không commit** file `*.ini` chứa IP production thật (dùng secrets manager)
3. **SSH key** cho user `deploy` nên rotate mỗi 6 tháng
4. **Fail2ban** đã được cài tự động qua role `common`
5. **UFW firewall** chỉ mở ports cần thiết

## 📊 Monitoring

Sau khi deploy thành công:
- **App logs**: `{{ app_home }}/logs/`
- **Nginx logs**: `/var/log/nginx/`
- **PM2 logs**: `pm2 logs {{ app_name }}`
- **Postgres logs**: `/var/log/postgresql/`
- **Deploy log**: `{{ app_home }}/logs/deploy.log`

## 🔄 Quy trình deploy

1. **Developer** push code lên GitHub
2. **Jenkins** trigger build → test → package → tạo artifact `backend-<commit>.tar.gz`
3. **Jenkins** gọi `ansible-playbook deploy-backend.yml` qua SSH
4. **Ansible** upload artifact lên từng web server (rolling)
5. **Ansible** giải nén vào `releases/<timestamp>/`
6. **Ansible** cập nhật symlink `current` trỏ tới release mới
7. **PM2** reload app (zero-downtime)
8. **Ansible** smoke-test `/api/health`
9. **Ansible** xoá các release cũ (giữ lại 5 bản)

## 🆘 Troubleshooting

### Lỗi SSH timeout
```bash
# Tăng timeout trong ansible.cfg
timeout = 60
```

### Lỗi PostgreSQL connection
```bash
# Kiểm tra service
ansible dbservers -i inventories/dev.ini -m systemd -a "name=postgresql"

# Xem log
ansible dbservers -i inventories/dev.ini -m shell -a "tail -50 /var/log/postgresql/postgresql-16-main.log"
```

### App không start
```bash
# SSH vào server
ssh deploy@192.168.56.101

# Xem PM2 logs
pm2 logs coffee-home-blend-backend
pm2 status
pm2 restart coffee-home-blend-backend
```
