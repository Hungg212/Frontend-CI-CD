#!/bin/bash
# Bootstrap script chạy trên EC2 khi launch.
# Tác vụ: cài nginx, mount S3 artifact bằng s3fs, serve qua nginx.

set -euo pipefail

PROJECT_NAME="${project_name}"
ARTIFACT_BUCKET="${artifact_bucket}"
DEPLOY_DIR="/var/www/${PROJECT_NAME}"

echo "===> Cài nginx + s3fs"
apt-get update -y
apt-get install -y nginx s3fs fuse

echo "===> Tạo thư mục deploy"
mkdir -p "${DEPLOY_DIR}"
chown -R www-data:www-data "${DEPLOY_DIR}"

echo "===> Cấu hình s3fs để mount artifact"
mkdir -p /etc/s3fs
# IAM role của EC2 cấp quyền S3 rồi — không cần passwd file
# echo "ACCESS:SECRET" > /etc/s3fs/passwd && chmod 600 /etc/s3fs/passwd

echo "s3fs#${ARTIFACT_BUCKET} ${DEPLOY_DIR} fuse _netdev,allow_other,iam_role=auto,url=https://s3.${AWS_REGION:-ap-southeast-1}.amazonaws.com 0 0" >> /etc/fstab
mount -a || true

# Nếu mount fail thì fallback: aws s3 sync
if ! mountpoint -q "${DEPLOY_DIR}"; then
  echo "===> s3fs mount fail, fallback dùng aws cli"
  apt-get install -y awscli
  aws s3 sync "s3://${ARTIFACT_BUCKET}/" "${DEPLOY_DIR}/" --delete
fi

echo "===> Cấu hình nginx"
cat > /etc/nginx/sites-available/${PROJECT_NAME} <<'NGINX'
server {
    listen 80 default_server;
    server_name _;
    root /var/www/PROJECT_NAME_PLACEHOLDER;
    index index.html;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
NGINX
sed -i "s|PROJECT_NAME_PLACEHOLDER|${PROJECT_NAME}|g" /etc/nginx/sites-available/${PROJECT_NAME}

ln -sf /etc/nginx/sites-available/${PROJECT_NAME} /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t && systemctl reload nginx

echo "===> Hoàn tất bootstrap cho ${PROJECT_NAME}"
