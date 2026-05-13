# Production Deployment Guide — Oxubiraz

## Server Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 2 vCPU | 4 vCPU |
| RAM | 4 GB | 8 GB |
| Storage | 50 GB SSD | 100 GB SSD |
| OS | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |
| Docker | ≥ 26.0 | Latest |

---

## Step 1 — Server Setup

```bash
# Update system
apt update && apt upgrade -y

# Install Docker & Docker Compose
curl -fsSL https://get.docker.com | sh
usermod -aG docker $USER

# Install fail2ban
apt install -y fail2ban ufw

# Configure firewall
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

---

## Step 2 — Deploy Application

```bash
# Clone repository
git clone https://github.com/your-org/oxubiraz.git /var/www/oxubiraz
cd /var/www/oxubiraz

# Create production env files
cp apps/api/.env.example apps/api/.env
# ⚠️ Edit: DB_PASSWORD, REDIS_PASSWORD, APP_KEY, PUSHER_*, OPENAI_API_KEY

# Set APP_KEY
docker run --rm -v $(pwd)/apps/api:/app php:8.3-cli sh -c "cd /app && php artisan key:generate"

# Build and start
docker compose -f docker-compose.prod.yml up -d --build

# Run migrations
docker exec oxubiraz_api_prod php artisan migrate --force
docker exec oxubiraz_api_prod php artisan db:seed --force
docker exec oxubiraz_api_prod php artisan storage:link
docker exec oxubiraz_api_prod php artisan config:cache
docker exec oxubiraz_api_prod php artisan route:cache
docker exec oxubiraz_api_prod php artisan view:cache
docker exec oxubiraz_api_prod php artisan event:cache
```

---

## Step 3 — SSL Certificate

```bash
# Get SSL via Certbot
docker exec oxubiraz_certbot certbot certonly \
  --webroot -w /var/www/certbot \
  -d oxubiraz.az \
  -d api.oxubiraz.az \
  --email admin@oxubiraz.az \
  --agree-tos --non-interactive
```

---

## Step 4 — Nginx Production Config

```nginx
# docker/nginx/prod.conf
server {
    listen 80;
    server_name oxubiraz.az api.oxubiraz.az;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.oxubiraz.az;

    ssl_certificate /etc/letsencrypt/live/oxubiraz.az/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/oxubiraz.az/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDH+AESGCM:ECDH+AES256:!MD5;

    root /var/www/html/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass api:9000;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    add_header Strict-Transport-Security "max-age=63072000" always;
}

server {
    listen 443 ssl http2;
    server_name oxubiraz.az;

    ssl_certificate /etc/letsencrypt/live/oxubiraz.az/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/oxubiraz.az/privkey.pem;

    location / {
        proxy_pass http://web:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Backup System

```bash
#!/bin/bash
# /usr/local/bin/oxubiraz-backup.sh

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/oxubiraz"
mkdir -p "$BACKUP_DIR"

# Database backup
docker exec oxubiraz_mysql_prod mysqldump \
  -u root -p"$MYSQL_ROOT_PASSWORD" oxubiraz \
  | gzip > "$BACKUP_DIR/db_$TIMESTAMP.sql.gz"

# Storage backup
tar -czf "$BACKUP_DIR/storage_$TIMESTAMP.tar.gz" \
  /var/www/oxubiraz/apps/api/storage/app/public

# Keep last 30 days
find "$BACKUP_DIR" -name "*.gz" -mtime +30 -delete

echo "Backup completed: $TIMESTAMP"
```

```bash
# Schedule daily at 2:00 AM
echo "0 2 * * * root /usr/local/bin/oxubiraz-backup.sh >> /var/log/oxubiraz-backup.log 2>&1" >> /etc/crontab
```

---

## Monitoring

```bash
# Check service health
docker compose -f docker-compose.prod.yml ps

# View logs
docker logs oxubiraz_api_prod --tail=100 -f
docker logs oxubiraz_web_prod --tail=100 -f
docker logs oxubiraz_nginx_prod --tail=100 -f

# Restart a service
docker compose -f docker-compose.prod.yml restart api

# Zero-downtime deployment
git pull origin main
docker compose -f docker-compose.prod.yml build api web
docker compose -f docker-compose.prod.yml up -d api web
docker exec oxubiraz_api_prod php artisan migrate --force
docker exec oxubiraz_api_prod php artisan cache:clear
docker exec oxubiraz_api_prod php artisan config:cache
```

---

## Scaling Recommendations

### Horizontal Scaling
- Run multiple API containers behind Nginx load balancer
- Use Redis cluster for shared session/cache
- Use read replicas for MySQL for analytics queries
- Use CDN (Cloudflare) for static assets

### Vertical Scaling
- API: Start with 512MB RAM, scale to 1-2GB as load increases
- MySQL: Enable query cache, increase `innodb_buffer_pool_size`
- Redis: Increase `maxmemory` as session/cache grows

### Performance Optimizations
```bash
# Enable Laravel Octane (for high traffic)
composer require laravel/octane
php artisan octane:install --server=frankenphp

# Enable Redis for queue with multiple workers
php artisan queue:work --queue=high,default --processes=4
```

---

## Security Checklist

- [ ] `APP_DEBUG=false` in production `.env`
- [ ] Strong `APP_KEY` (32+ random chars)
- [ ] Unique `DB_PASSWORD` and `REDIS_PASSWORD`
- [ ] HTTPS enforced via Nginx
- [ ] `SANCTUM_STATEFUL_DOMAINS` set correctly
- [ ] File upload validation active
- [ ] Rate limiting configured
- [ ] fail2ban running on host
- [ ] Regular `composer audit` for vulnerabilities
- [ ] Backups automated and tested
- [ ] Sentry DSN configured for error tracking
