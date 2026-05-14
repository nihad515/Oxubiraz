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

Run the provisioning script on a fresh Ubuntu 22.04 LTS server:

```bash
curl -fsSL https://raw.githubusercontent.com/your-org/oxubiraz/main/scripts/server-setup.sh | sudo bash
```

This installs Docker CE, configures UFW (ports 22/80/443), fail2ban, creates the `deploy` user, sets up swap, and enables unattended security upgrades.

---

## Step 2 — First Deploy

```bash
# On the server as the deploy user
cd /opt/oxubiraz

# Copy and edit the production env file
cp .env.prod.example .env.prod
nano .env.prod   # fill in every value

# Copy compose file and docker configs
scp docker-compose.prod.yml deploy@your-server:/opt/oxubiraz/
scp -r docker/ deploy@your-server:/opt/oxubiraz/

# Bootstrap the stack
bash scripts/first-deploy.sh
```

The first-deploy script: pulls images, waits for MySQL, runs migrations, seeds roles/permissions and system strings, starts all services.

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
