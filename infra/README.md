# Deployment Guide

This guide shows how to stand up the LinkedIn Comment Engine on GCP in **one shot**, using Cloud Shell.

---

## Prerequisites

- You have admin access to the GCP project `comment-engine-459607`.
- You have already reserved a **global** static IP called `comments-codefined-ip-global`.

---

## 1️⃣ Provision Resources

Open **Cloud Shell** in the GCP Console and run:

```bash
# 1. Reserve a global IP (if not done already)
gcloud compute addresses create comments-codefined-ip-global \
  --project comment-engine-459607 --global

# 2. Create the VM (no external IP)
cat > startup.sh << 'EOF'
#! /bin/bash
set -e
# Install NGINX, Node 18, PM2
apt-get update -y
apt-get install -y nginx git curl build-essential
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs
npm install -g pm2

# Prepare web root
rm -rf /var/www/comments.codefined.co/html
mkdir -p /var/www/comments.codefined.co/html
chown -R www-data:www-data /var/www/comments.codefined.co
chmod -R 755 /var/www/comments.codefined.co/html

# Clone & start backend
if [ -d /opt/comment-engine ]; then
  cd /opt/comment-engine && git pull
else
  git clone https://github.com/lbanfi/comment-engine-v2.git /opt/comment-engine
  cd /opt/comment-engine
fi
npm install
pm2 delete comment-engine 2>/dev/null || true
pm2 start server.js --name comment-engine
pm2 save

# Build & deploy front-end
cd /opt/comment-engine
npm run build
cp -r build/* /var/www/comments.codefined.co/html/

# Configure NGINX
cat > /etc/nginx/conf.d/comments.codefined.co.conf << 'NG'
server {
  listen 80 default_server;
  listen [::]:80 default_server;
  server_name comments.codefined.co www.comments.codefined.co;

  location /api/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
  }

  root /var/www/comments.codefined.co/html;
  index index.html;
  location / {
    try_files \$uri \$uri/ /index.html;
  }
}
NG

# Reload NGINX
nginx -t && systemctl reload nginx
EOF

# 3. Create the VM (no external IP, startup script handles everything)
gcloud compute instances create comment-engine-vm \
  --project comment-engine-459607 \
  --zone europe-west1-b \
  --machine-type e2-standard-2 \
  --image-family ubuntu-2204-lts \
  --image-project ubuntu-os-cloud \
  --no-address \
  --tags http-server \
  --metadata-from-file startup-script=startup.sh

# 4. Instance Group & Health Check & LB
gcloud compute instance-groups unmanaged create comment-engine-ig \
  --project comment-engine-459607 --zone europe-west1-b
gcloud compute instance-groups unmanaged add-instances comment-engine-ig \
  --project comment-engine-459607 --zone europe-west1-b \
  --instances comment-engine-vm

gcloud compute health-checks create http hc-root \
  --project comment-engine-459607 --port 80 --request-path /

gcloud compute backend-services create bs-comment-engine \
  --project comment-engine-459607 --protocol HTTP \
  --health-checks hc-root --global
gcloud compute backend-services add-backend bs-comment-engine \
  --project comment-engine-459607 --global \
  --instance-group comment-engine-ig --instance-group-zone europe-west1-b

gcloud compute url-maps create umap-engine \
  --project comment-engine-459607 --default-service bs-comment-engine
gcloud compute target-http-proxies create proxy-engine \
  --project comment-engine-459607 --url-map umap-engine

gcloud compute forwarding-rules create fr-engine \
  --project comment-engine-459607 --global \
  --address comments-codefined-ip-global \
  --target-http-proxy proxy-engine --ports 80
