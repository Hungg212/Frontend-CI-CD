# Coffee Home Blend — Jenkins Pipeline Library
Tập hợp các Jenkinsfile cho từng thành phần dự án.

## Cấu trúc

| File | Mô tả |
|---|---|
| `Jenkinsfile` (gốc) | Pipeline frontend (Vite + Nginx static) |
| `Jenkinsfile.backend` | Pipeline backend Node.js (Express + PG) |
| `Jenkinsfile.fullstack` | Chạy cả frontend + backend trong 1 job |

## Yêu cầu môi trường Jenkins

1. **Plugins bắt buộc**:
   - `Pipeline`
   - `Git`
   - `NodeJS` (cấu hình Node 20)
   - `SSH Agent`
   - `Ansible` *(optional, nếu muốn chạy từ Jenkins)*
   - `Credentials Binding`

2. **Credentials cần tạo** (Manage Jenkins → Credentials):
   - `github-ssh` — SSH key để pull repo infra
   - `vps-ssh-key` — SSH key để deploy lên VPS
   - `dockerhub-creds` — *(optional)* nếu push image

3. **Tools cấu hình** (Manage Jenkins → Tools):
   - `NodeJS-20` (Node 20.x + npm)

## Cấu hình job

Khi tạo Pipeline job, đặt:
- **Definition**: `Pipeline script from SCM`
- **SCM**: `Git`
- **Repository URL**: `git@github.com:Hungg212/Frontend-CI-CD.git`
- **Script Path**: `Jenkinsfile.backend` (hoặc `Jenkinsfile` cho frontend)

## Webhook từ GitHub

Vào repo → Settings → Webhooks → Add webhook:
- URL: `http://<jenkins-host>/github-webhook/`
- Content type: `application/json`
- Events: `Just the push event.`

## Biến môi trường của job

| Key | Default | Mô tả |
|---|---|---|
| `DEPLOY_ENV` | `dev` | Môi trường deploy: `dev` / `staging` / `prod` |
| `DEPLOY_HOST` | — | IP/domain của VPS |
| `SSH_USER` | `deploy` | User SSH trên VPS |
| `ANSIBLE_REPO` | `https://github.com/Hungg212/coffee-home-blend-infra.git` | Repo chứa Ansible playbooks |
