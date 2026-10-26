# Deploy Coffee Home Blend lên AWS (hướng tiết kiệm nhất)

Bộ file này triển khai app lên AWS theo cách **rẻ nhất có thể** (~$11.3/tháng, trừ vào credit $100):

| Thành phần | Dịch vụ | Chi phí |
|---|---|---|
| Frontend (React/Vite) | **S3 + CloudFront** | $0 (always-free: 5GB S3, 1TB CloudFront/tháng) |
| Backend API (Node/Express) | **EC2 t3.micro** + Docker | ~$9.6/tháng (trừ vào credit $100) |
| Database (PostgreSQL 16) | **Container trên cùng EC2** | $0 (không dùng RDS — RDS đắt hơn nhiều) |
| Ổ đĩa | **EBS gp3 20GB** | ~$1.6/tháng (trừ vào credit) |
| HTTPS | **CloudFront** (cert mặc định `*.cloudfront.net`) | $0 |
| IP tĩnh | **Elastic IP** gắn vào instance đang chạy | $0 |

**Tổng thực tế: ~$11.3/tháng** → $100 credit đủ dùng **khoảng 8-9 tháng** phần cứng, nhưng **Free Plan chỉ kéo dài 6 tháng** nên thực tế bạn dùng thoải mái ~$68 trong 6 tháng, còn dư ~$32.

Không dùng NAT Gateway (~$32/tháng) và không dùng ALB (~$16/tháng) — đây là 2 thứ làm "cháy" credit nhanh nhất.

> ⚠️ **Tài khoản của bạn dùng mô hình credit mới** (tạo từ 15/7/2025), không phải "free tier 12 tháng" kiểu cũ. Đọc [0.1](#01-kiểm-tra-loại-tài-khoản-quan-trọng) trước khi bắt đầu — có một mốc thời gian bạn **bắt buộc** phải nhớ.

CloudFront dùng `PriceClass_All` để có edge Singapore/Hong Kong (nhanh cho user Việt Nam); free tier 1 TB/tháng áp dụng như nhau ở mọi price class nên không tốn thêm.

```
Người dùng
    │ HTTPS
    ▼
CloudFront (*.cloudfront.net)
    ├── /  và /assets/*  ──► S3 (private, chỉ CloudFront đọc được qua OAC)
    └── /api/*           ──► EC2 t3.micro :80 ──► API container :4000
                                                      │
                                                      ▼
                                                 Postgres container (nội bộ Docker)
```

SPA routing dùng **CloudFront Function** gắn riêng cho default behavior (không dùng `CustomErrorResponses`, vì nó áp dụng toàn cục và sẽ biến lỗi 404 JSON của API thành `index.html`).

Vì CloudFront proxy luôn `/api/*`, frontend gọi API **cùng origin** → không cần CORS, không bị mixed content, không cần domain riêng.

---

## 0. Chuẩn bị (làm 1 lần)

### 0.1. Kiểm tra loại tài khoản (quan trọng)

AWS có **2 mô hình free tier khác nhau**, chi phí và thời hạn rất khác:

| | Tạo **trước** 15/7/2025 | Tạo **từ** 15/7/2025 |
|---|---|---|
| Cơ chế | Free tier theo **usage limit** (750h EC2/tháng…) | **Credit $100** trừ dần |
| Thời hạn | 12 tháng | **6 tháng** hoặc hết credit, cái nào trước |
| Quá giới hạn | Bị tính tiền pay-as-you-go | **Không thể vượt** — Free Plan chặn |
| Hết hạn | Mất free tier, vẫn dùng được | **Tài khoản tự đóng**, dữ liệu xoá sau 90 ngày |

**Cách kiểm tra:** Console → **Billing** (hoặc trang chủ). Nếu thấy ô "Chi phí và mức sử dụng" với "Số tiền tín dụng còn lại" → bạn ở **mô hình credit mới**.

**Nếu đang ở Free Plan (6 tháng)** — lưu ý:

1. **Không tự động bị tính tiền.** Free Plan không cho vượt credit, nên bạn an toàn tuyệt đối. Hết 6 tháng tài khoản đóng lại (không có bill bất ngờ).
2. **Muốn chạy tiếp sau 6 tháng** → phải **upgrade lên Paid plan** (Console → Settings → Billing → Upgrade). Credit còn dư vẫn áp dụng tiếp cho tới khi hết hạn 12 tháng.
3. **Dịch vụ dùng trong kiến trúc này đều được phép.** EC2, EBS, S3, CloudFront, CloudFormation, IAM, Systems Manager (SSM), VPC, Budgets, Certificate Manager — tất cả nằm trong danh sách hỗ trợ của Free Plan, nên deploy chạy bình thường.
4. **Hạn chế: tính năng cross-region.** CloudFront là dịch vụ toàn cầu, và ACM certificate cho CloudFront **bắt buộc phải tạo ở `us-east-1`** trong khi tài nguyên khác ở `ap-southeast-1`. Xem mục [5](#5-gắn-domain-riêng--https-sau-này).

**Mốc thời gian của bạn** (theo ảnh Console: "183 ngày còn lại"):

| Mốc | Ngày | Việc cần làm |
|---|---|---|
| Free Plan hết hạn | **26/4/2027** | Upgrade lên Paid nếu muốn app chạy tiếp |
| Credit hết hạn | ~10/2027 | Dùng nốt trước khi mất |

Sau 26/4/2027 mà không upgrade, tài khoản bị đóng và dữ liệu xoá sau 90 ngày.

**Kiếm thêm $100 credit:** Trang chủ Console có widget **"Khám phá AWS"** liệt kê các hoạt động. Ví dụ "Khởi tạo một phiên bản bằng EC2" → **+$20** (bạn đạt được ngay khi chạy `01-stack-backend.ps1`). Làm hết các hoạt động để có tổng $200.

### 0.2. Gắn thẻ (không bắt buộc nếu đã có credit)

Bạn đã có $100 credit nên **không cần gắn thẻ ngay** trên Free Plan — vì Free Plan không thể phát sinh bill vượt credit. Nhưng nên gắn khi:
- Có ý định upgrade lên Paid plan sau này
- Muốn verify tài khoản đầy đủ

Nếu gắn: **Console → Billing → Payment methods**. AWS trừ tạm ~$1 để xác minh (hoàn lại).

> **Vẫn nên tạo Budget alert** để theo dõi tốc độ tiêu credit: Console → **Billing → Budgets → Create budget**. Đặt ngưỡng **$15/tháng** (chi phí thật ~$11.3) để biết khi nào có gì đó tiêu nhiều hơn dự kiến.

### 0.3. Tạo tài khoản IAM có access key

Không dùng tài khoản root cho CLI.

1. Console → **IAM → Users → Create user** → tên `coffee-deployer`
2. **Không** tick "Provide user access to the Management Console"
3. **Attach policies directly** → tick:
   - `AmazonEC2FullAccess`
   - `AmazonS3FullAccess`
   - `CloudFrontFullAccess`
   - `AWSCloudFormationFullAccess`
   - `IAMFullAccess`
   - `AmazonSSMFullAccess`
4. Tạo xong → tab **Security credentials** → **Create access key** → chọn **Command Line Interface (CLI)** → tick ô xác nhận → copy **Access key** + **Secret key**

> Với project học tập thì gán full-access là chấp nhận được. Production thật thì nên thu hẹp quyền.

### 0.4. Cài AWS CLI và cấu hình

```powershell
winget install --id Amazon.AWSCLI --exact
```

Đóng và mở lại terminal, rồi:

```powershell
aws configure
```

Nhập:
```
AWS Access Key ID     : <access key ở bước 0.3>
AWS Secret Access Key : <secret key ở bước 0.3>
Default region name   : ap-southeast-1
Default output format : json
```

Kiểm tra:
```powershell
aws sts get-caller-identity
```

### 0.5. Chạy script kiểm tra

```powershell
cd d:\Devopp\coffee-home-blend\infra\aws\scripts
.\00-prereq.ps1
```

Nếu PowerShell chặn script:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

---

## 1. Deploy backend (EC2 + Postgres) — ~6 phút

```powershell
.\01-stack-backend.ps1
```

Script sẽ:
1. Tạo **key pair** `coffee-home-blend-key.pem` (lưu cùng thư mục `scripts/`) — **giữ file này cẩn thận**, mất là phải tạo instance mới.
2. Phát hiện IP công khai của bạn và chỉ mở SSH từ đúng IP đó.
3. Tạo CloudFormation stack: EC2 t3.micro + Elastic IP + Security Group + IAM role (SSM).
4. User-data tự cài Docker, Docker Compose, tạo **2 GB swap** (t3.micro chỉ có 1 GB RAM, không có swap thì `npm install` dễ bị OOM kill).

Kết thúc, bạn nhận được:
```
Backend deployed.
  Public IP : 13.x.x.x
  SSH       : ssh -i "...\coffee-home-blend-key.pem" ec2-user@13.x.x.x
```

### 1.1. Cấu hình server và chạy app

> **Điều kiện:** code phải đã push lên GitHub (script clone từ repo, không copy từ máy bạn).

```powershell
.\02-setup-server.ps1
```

Script sẽ:
1. Đợi SSH sẵn sàng và cloud-init cài xong Docker.
2. Sinh **mật khẩu Postgres** và **JWT_SECRET** ngẫu nhiên, đẩy lên server qua `scp` → `/opt/coffee/.env` (quyền `600`). Chạy lại script **không** đổi mật khẩu DB.
3. Clone repo về `/opt/coffee/app`, copy `.env`, chạy `docker compose -f docker-compose.ec2.yml up -d --build`.
4. Kiểm tra `http://<IP>/api/health` cho tới khi trả `{"ok":true}`.

Lần đầu mất 2-4 phút vì phải build image và seed dữ liệu.

Kiểm tra thủ công:
```powershell
curl http://<IP>/api/health
curl "http://<IP>/api/products?limit=2"
```

---

## 2. Deploy frontend (S3 + CloudFront) — ~10 phút (CloudFront tạo lần đầu chậm)

```powershell
.\03-deploy-frontend.ps1
```

Script sẽ:
1. Tạo stack CloudFront + S3 (bucket private, CloudFront đọc qua OAC).
2. Build frontend. **Lưu ý quan trọng:** `.env.production` (đã commit) đặt `VITE_API_BASE_URL` rỗng → app gọi `/api` cùng origin. Script có bước **kiểm tra bundle** — nếu phát hiện `localhost:4000` bị nhúng vào `dist/assets/*.js` thì dừng ngay và báo lỗi.
3. Upload: `assets/*` cache 1 năm (immutable), `index.html` cache 0.
4. Invalidate CloudFront `/*`.

Kết quả:
```
Frontend deployed!
  Site : https://d111111abcdef8.cloudfront.net
```

> CloudFront mất **3-10 phút** để trạng thái chuyển từ `InProgress` → `Deployed`. Trong lúc đó truy cập có thể bị lỗi 403/504. Đợi rồi thử lại.

---

## 3. Kiểm tra toàn bộ

```powershell
.\04-verify.ps1
```

Script kiểm 8 bước (read-only):

| Bước | Nội dung |
|---|---|
| 1 | `GET http://<IP>/api/health` trực tiếp trên EC2 |
| 2 | `GET https://<cloudfront>/api/health` (qua proxy) |
| 3 | `/api/products` trả về sản phẩm (DB đã seed chưa) |
| 4 | Login `admin@coffeehome.vn / admin123` lấy được token |
| 5 | `index.html` serve qua HTTPS |
| 6 | API trả 404 JSON (không bị CloudFront thay bằng `index.html`) |
| 7 | Deep link `/admin/products` trả `index.html` (SPA fallback) |
| 8 | HTTP tự redirect sang HTTPS |

Tất cả xanh là xong. Đăng nhập admin:
- **admin@coffeehome.vn / admin123**
- **demo@coffeehome.vn / demo1234**

---

## 4. (Tùy chọn) Tự động deploy khi push code

Nếu chỉ cần deploy tay, **bỏ qua mục này**.

### 4.1. Tạo role cho GitHub Actions (OIDC, không cần lưu access key)

```powershell
aws cloudformation deploy `
  --template-file .\..\cloudformation\github-oidc.yml `
  --stack-name coffee-home-blend-github `
  --region ap-southeast-1 `
  --capabilities CAPABILITY_NAMED_IAM `
  --parameter-overrides GitHubOrg=Hungg212 GitHubRepo=Frontend-CI-CD Branch=main

aws cloudformation describe-stacks --stack-name coffee-home-blend-github `
  --query "Stacks[0].Outputs[0].OutputValue" --output text
```

Nếu tài khoản đã có GitHub OIDC provider (báo lỗi "already exists"), thêm `CreateOidcProvider=false`.

### 4.2. Cấu hình GitHub repo

Vào **Settings → Secrets and variables → Actions**:

**Secrets:**
| Tên | Giá trị |
|---|---|
| `AWS_DEPLOY_ROLE_ARN` | ARN in ra ở bước 4.1 |

**Variables:**
| Tên | Giá trị |
|---|---|
| `BACKEND_STACK_NAME` | `coffee-home-blend-backend` |
| `FRONTEND_STACK_NAME` | `coffee-home-blend-frontend` |

Workflow `.github/workflows/deploy-aws.yml` sẽ chạy mỗi lần push `main`: deploy API qua SSM Run Command (không cần SSH key) rồi build + upload frontend + invalidate.

> **Lưu ý:** workflow cũ `.github/workflows/cd.yml` đang deploy lên Render. Nếu không dùng Render nữa, xoá file đó để tránh chạy thừa (job sẽ fail vì thiếu `RENDER_DEPLOY_HOOK`).

---

## 5. Gắn domain riêng + HTTPS sau này

> ⚠️ **Cần kiểm tra trước khi làm mục này.** Free Plan không hỗ trợ **tính năng cross-region**, mà ACM certificate cho CloudFront bắt buộc ở `us-east-1` trong khi tài nguyên của bạn ở `ap-southeast-1`. Nếu lệnh `request-certificate` báo lỗi region/cross-region, bạn cần **upgrade lên Paid plan** (Console → Settings → Billing → Upgrade). Credit còn dư vẫn áp dụng tiếp sau khi upgrade.

Khi có domain (ví dụ `coffeehome.vn`):

1. **ACM certificate** (bắt buộc ở region **us-east-1** cho CloudFront):
   ```powershell
   aws acm request-certificate --domain-name coffeehome.vn `
     --subject-alternative-names "*.coffeehome.vn" `
     --validation-method DNS --region us-east-1
   ```
   Vào Route 53 (hoặc nơi quản lý DNS) thêm bản ghi CNAME xác thực mà ACM hiển thị. Đợi trạng thái `ISSUED`.

2. Thêm 2 tham số vào `frontend.yml`:
   ```yaml
   DomainName:
     Type: String
     Default: ''
   CertificateArn:
     Type: String
     Default: ''
   ```
   và trong `DistributionConfig.ViewerCertificate`:
   ```yaml
   ViewerCertificate: !If
     - HasCustomDomain
     - AcmCertificateArn: !Ref CertificateArn
       SslSupportMethod: sni-only
       MinimumProtocolVersion: TLSv1.2_2021
     - CloudFrontDefaultCertificate: true
   ```

3. Trỏ DNS: bản ghi `A` (alias) cho `coffeehome.vn` → domain CloudFront.

Tôi có thể làm sẵn phần này khi bạn có domain — chỉ cần báo tên domain.

---

## 6. Vận hành hàng ngày

### Xem log API
```powershell
ssh -i .\coffee-home-blend-key.pem ec2-user@<IP>
cd /opt/coffee/app
sudo docker compose -f docker-compose.ec2.yml logs -f --tail 100 api
```

### Cập nhật code thủ công
```powershell
.\02-setup-server.ps1          # backend
.\03-deploy-frontend.ps1       # frontend
```
Cả hai đều idempotent — chạy lại bao nhiêu lần cũng được.

### Backup database
```powershell
ssh -i .\coffee-home-blend-key.pem ec2-user@<IP> `
  "sudo docker exec coffee-db pg_dump -U coffee coffee | gzip" > backup-$(Get-Date -Format yyyyMMdd).sql.gz
```

### Restore
```powershell
Get-Content backup-20261026.sql.gz -Raw | ssh -i .\coffee-home-blend-key.pem ec2-user@<IP> `
  "gunzip | sudo docker exec -i coffee-db psql -U coffee -d coffee"
```

### Kiểm tra chi phí & credit

Console → **Billing → Cost Explorer**, group by **Service**. Với credit $100, bạn sẽ thấy:

| Dịch vụ | ~$/tháng | Ghi chú |
|---|---|---|
| EC2 t3.micro | $9.64 | 730h × $0.0132/h |
| EBS gp3 20GB | $1.60 | $0.08/GB-tháng |
| S3 | ~$0.05 | vài MB assets trong 5GB free |
| CloudFront | $0 | trong 1TB free |
| Elastic IP (gắn instance) | $0 | chỉ tính phí khi **không** gắn |
| **Tổng** | **~$11.3** | |

**Kịch bản credit $100:**

| | |
|---|---|
| Chi tiêu 6 tháng (Free Plan) | ~$68 |
| Còn lại khi Free Plan hết hạn | **~$32** |
| Credit hết hạn hoàn toàn | 12 tháng sau khi mở tài khoản |

**Phải làm trước khi Free Plan hết 6 tháng:** upgrade lên Paid plan, nếu không tài khoản bị đóng và dữ liệu xoá sau 90 ngày. Sau khi upgrade, $32 còn lại tiếp tục trả cho ~2.5 tháng nữa.

**Cảnh báo:** những dòng **không được** xuất hiện trong Cost Explorer:
- **NAT Gateway** (~$32/tháng) — không có trong kiến trúc này
- **Application Load Balancer** (~$16/tháng) — không dùng
- **RDS** (~$15+/tháng) — Postgres chạy trong Docker trên EC2

Nếu thấy các dòng trên, kiểm tra lại stack (rất có thể ai đó tạo tay trong Console).

### Gia hạn kiểm soát chi phí

Tạo Budget alert để không bị hết credit bất ngờ. Cách dễ nhất là qua Console:

**Console → Billing → Budgets → Create budget → Cost budget** → đặt **$15/tháng**, thêm email cảnh báo ở ngưỡng **80%**.

Nếu muốn làm bằng CLI, tạo file `budget.json`:

```json
{
  "BudgetName": "coffee-monthly",
  "BudgetLimit": { "Amount": "15", "Unit": "USD" },
  "TimeUnit": "MONTHLY",
  "BudgetType": "COST"
}
```

Rồi:

```powershell
aws budgets create-budget --account-id (aws sts get-caller-identity --query Account --output text) `
  --budget file://budget.json
```

> Dùng đúng **$15** vì chi phí thật chỉ ~$11.3/tháng. Nếu budget nhảy lên $30+ thì có tài nguyên lạ đang chạy.

---

## 7. Xoá toàn bộ (khi không dùng nữa)

```powershell
.\99-teardown.ps1
```

Gõ `DELETE` để xác nhận. Script xoá CloudFormation stack, bucket (kể cả version cũ), key pair. **Dữ liệu Postgres mất theo.** Chạy `create-stack` lại là có môi trường mới sạch.

---

## Troubleshooting

<details>
<summary><b>Trang web gọi vào localhost:4000 (API không hoạt động trên production)</b></summary>

Bundle production bị nhúng URL dev. Nguyên nhân phổ biến: file `.env` local (không commit) có `VITE_API_BASE_URL=http://localhost:4000/api` và Vite đọc nó.

Trong PowerShell, `$env:VITE_API_BASE_URL = ''` **xoá** biến (không phải set rỗng), nên Vite fallback về `.env`. Đó là lý do có `.env.production` (ưu tiên cao hơn `.env`).

Kiểm tra:
```powershell
Select-String -Path dist\assets\*.js -Pattern 'localhost:4000' -List
```
Không có kết quả = sạch. Nếu có, xoá `dist` rồi build lại. File `.env.production` **phải được commit**:
```powershell
git check-ignore -v .env.production    # exit 1 = không bị ignore (đúng)
```
</details>

<details>
<summary><b>Deep link /admin/products trả 404 hoặc Access Denied</b></summary>

CloudFront Function SPA router chưa publish. Kiểm tra:
```powershell
aws cloudfront list-functions --query 'FunctionList.Items[?Name==`coffee-home-blend-spa-router`]'
```
Function phải ở trạng thái `DEPLOYED` (không phải `UNASSOCIATED`). Nếu không, deploy lại stack frontend:
```powershell
.\03-deploy-frontend.ps1
```

Nếu function ổn mà vẫn 404: kiểm tra `dist/index.html` đã upload chưa (`aws s3 ls s3://<bucket>/index.html`).
</details>

<details>
<summary><b>403 Access Denied khi mở trang</b></summary>

CloudFront chưa deploy xong (`InProgress`), hoặc OAC chưa đúng. Kiểm tra:
```powershell
aws cloudfront get-distribution --id <distId> --query 'Distribution.Status'
```
Ra `Deployed` mới truy cập được. Nếu bucket policy sai, deploy lại stack frontend:
```powershell
.\03-deploy-frontend.ps1
```
</details>

<details>
<summary><b>502 / 504 khi gọi /api/*</b></summary>

CloudFront không kết nối được tới EC2. Kiểm tra:
1. API có sống không: `curl http://<IP>/api/health`
2. Container có chạy không:
   ```powershell
   ssh -i .\coffee-home-blend-key.pem ec2-user@<IP> "sudo docker ps"
   ```
3. Security group có mở port 80? Script `01` mở `0.0.0.0/0:80` mặc định.
4. `ApiOriginDomain` của stack frontend có đúng DNS/IP EC2? Nếu IP đổi, cập nhật lại:
   ```powershell
   aws cloudformation update-stack --stack-name coffee-home-blend-frontend ...
   ```
   (Elastic IP gắn vào instance nên IP không đổi trừ khi bạn release EIP.)

**Nếu dùng nip.io:** nếu CloudFront lỗi 502 liên tục với origin `x.x.x.x.nip.io`, kiểm tra DNS còn phân giải đúng không:
```powershell
nslookup <IP>.nip.io
```
</details>

<details>
<summary><b>API container chết ngay sau khi start (OOM)</b></summary>

t3.micro chỉ có 1 GB RAM. Kiểm tra swap:
```powershell
ssh -i .\coffee-home-blend-key.pem ec2-user@<IP> "free -h; sudo docker logs --tail 50 coffee-api"
```
Nếu swap = 0, user-data chưa chạy xong — đợi 2 phút rồi chạy lại `02-setup-server.ps1`. Nếu cần nhiều RAM hơn, đổi `$INSTANCE_TYPE = 't3.small'` trong `config.ps1` (mất phí ~$15/tháng).
</details>

<details>
<summary><b>JWT_SECRET / mật khẩu DB bị lộ thì sao?</b></summary>

Đổi trên server rồi restart:
```powershell
ssh -i .\coffee-home-blend-key.pem ec2-user@<IP>
sudo nano /opt/coffee/.env          # sửa JWT_SECRET
cd /opt/coffee/app && cp /opt/coffee/.env .env
sudo docker compose -f docker-compose.ec2.yml up -d --force-recreate api
```
Đổi `JWT_SECRET` sẽ làm **tất cả user phải đăng nhập lại** (token cũ mất hiệu lực). Đổi `POSTGRES_PASSWORD` cần thêm bước `ALTER USER` trong Postgres.
</details>

<details>
<summary><b>CloudFront báo lỗi "Invalid origin domain" khi deploy frontend</b></summary>

CloudFront **không chấp nhận IP thô** làm origin. Script `03` tự xử lý bằng cách lấy EC2 public DNS, fallback sang `<IP>.nip.io`. Nếu vẫn lỗi, kiểm tra:
```powershell
aws ec2 describe-instances --instance-ids <id> --query 'Reservations[0].Instances[0].PublicDnsName'
```
Rỗng → dùng `nip.io`. Cách khác: bật DNS hostnames trong VPC settings.
</details>

<details>
<summary><b>Muốn dùng region khác / gần Việt Nam hơn</b></summary>

`ap-southeast-1` (Singapore) là region gần nhất có đủ dịch vụ và không phụ phí. `ap-southeast-2` (Sydney) cũng được nhưng latency cao hơn. Đổi trong `config.ps1`:
```powershell
$AWS_REGION = 'ap-southeast-1'
```
Lưu ý: **ACM cho CloudFront luôn phải ở us-east-1**, bất kể region chính.
</details>

---

## Cấu trúc file

```
infra/aws/
├── README.md                    # file này
├── cloudformation/
│   ├── backend.yml              # EC2 + Elastic IP + SG + IAM role
│   ├── frontend.yml             # S3 + CloudFront + OAC + /api proxy + SPA function
│   └── github-oidc.yml          # (tùy chọn) role cho GitHub Actions
├── remote/
│   └── deploy-api.sh            # script chạy trên server (CI + thủ công)
└── scripts/
    ├── config.ps1               # biến dùng chung — SỬA FILE NÀY ĐẦU TIÊN
    ├── 00-prereq.ps1            # kiểm tra toolchain + credentials
    ├── 01-stack-backend.ps1     # key pair + EC2 stack
    ├── 02-setup-server.ps1      # .env + clone + docker compose up
    ├── 03-deploy-frontend.ps1   # S3 + CloudFront + build + upload
    ├── 04-verify.ps1            # kiểm tra end-to-end
    └── 99-teardown.ps1          # xoá sạch, ngừng phí

docker-compose.ec2.yml           # API + Postgres trên EC2
.env.ec2.example                 # mẫu biến môi trường server
.env.production                  # VITE_API_BASE_URL rỗng cho build production
.github/workflows/deploy-aws.yml # CI/CD (tùy chọn)
```
