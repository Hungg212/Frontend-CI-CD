# Coffee Home Blend — AWS Infrastructure (Terraform)

Kiến trúc: **EC2 + ALB + ASG**, gần với cấu trúc Ansible/nginx hiện có trong repo.

```
        ┌─────────────────────┐
        │  Application Load   │  ← HTTPS (ACM cert add sau)
        │      Balancer       │
        └──────────┬──────────┘
                   │  :80
        ┌──────────┴──────────┐
        │  Auto Scaling Group │  min 2 / desired 2 / max 4
        │  (EC2 + nginx)      │
        └──────────┬──────────┘
                   │ user-data: pull artifact từ S3 → /var/www/coffee-home-blend → nginx
        ┌──────────┴──────────┐
        │   S3: chb-artifacts │  ← Jenkins s3 sync dist/ lên đây
        └─────────────────────┘
```

## Yêu cầu

- AWS account, IAM user có quyền admin (hoặc các quyền: EC2, ELB, ASG, S3, IAM, VPC).
- Terraform >= 1.5.0.
- AWS CLI đã cấu hình (`aws configure`).

## Cấu trúc

```
terraform/
├── main.tf              # Provider + backend
├── vpc.tf               # VPC, public subnet, IGW, route table
├── security_groups.tf   # SG cho ALB và EC2
├── alb.tf               # ALB + target group + listener
├── asg.tf               # Launch template + ASG
├── iam.tf               # Role + instance profile
├── s3.tf                # Bucket artifact + bucket state
├── variables.tf
├── outputs.tf
├── user_data.sh         # Bootstrap script
└── README.md
```

## Bước 1 — Chuẩn bị S3 backend

```bash
# Tạo bucket lưu state Terraform (chỉ làm 1 lần)
aws s3api create-bucket \
    --bucket chb-tf-state-vi-2026 \
    --region ap-southeast-1 \
    --create-bucket-configuration LocationConstraint=ap-southeast-1

aws s3api put-bucket-versioning \
    --bucket chb-tf-state-vi-2026 \
    --versioning-configuration Status=Enabled
```

## Bước 2 — Cấu hình

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Sửa các giá trong terraform.tfvars (key_pair_name, v.v.)
```

## Bước 3 — Apply

```bash
terraform init
terraform plan -out tfplan
terraform apply tfplan
```

Sau ~3-5 phút, ALB DNS sẽ có ở output `alb_dns_name`. Truy cập `http://<alb_dns_name>` sẽ thấy trang "It works" mặc định (nginx).

## Bước 4 — Kết nối Jenkins

- Thêm stage cuối `Jenkinsfile`:
  ```groovy
  stage('Upload to S3') {
      steps {
          withAWS(credentials: 'aws-creds', region: 'ap-southeast-1') {
              sh 'aws s3 sync dist/ s3://chb-artifacts-vi-2026/ --delete'
          }
      }
  }
  ```
  ASG sẽ tự pull artifact mới mỗi khi instance launch/replace.

## Chi phí (free tier, ~30 ngày thử)

- 2x EC2 t3.micro: ~$0/month (free tier 750h/tháng)
- ALB: ~$0/month (nếu < 15 GB traffic)
- S3: < $1 cho 1 GB artifact
- **Tổng: $0–$1**
