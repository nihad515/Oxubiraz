# Local Development Guide — Oxubiraz

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | ≥ 20.0 | [nodejs.org](https://nodejs.org) |
| PHP | ≥ 8.3 | [php.net](https://php.net) |
| Composer | ≥ 2.8 | [getcomposer.org](https://getcomposer.org) |
| Docker Desktop | Latest | [docker.com](https://docker.com) |
| Git | Latest | [git-scm.com](https://git-scm.com) |

---

## Quick Start (Docker — Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/your-org/oxubiraz.git
cd oxubiraz

# 2. Copy environment files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# 3. Start all services
docker compose up -d

# 4. Install dependencies & run migrations
docker exec oxubiraz_api composer install
docker exec oxubiraz_api php artisan key:generate
docker exec oxubiraz_api php artisan migrate --seed
docker exec oxubiraz_api php artisan storage:link

# 5. Install frontend dependencies (host machine)
cd apps/web && npm install
```

**URLs:**
- Frontend: http://localhost:3000
- API: http://localhost:8000
- Mailpit: http://localhost:8025
- MySQL: localhost:3306

---

## Manual Setup (Without Docker)

### Backend (Laravel API)

```bash
cd apps/api

# Install PHP dependencies
composer install

# Environment setup
cp .env.example .env
php artisan key:generate

# Create MySQL database: oxubiraz
# Update DB_* values in .env

# Run migrations & seed
php artisan migrate
php artisan db:seed

# Create storage symlink
php artisan storage:link

# Start development server
php artisan serve --port=8000
```

### Frontend (Next.js)

```bash
cd apps/web

# Install dependencies
npm install

# Environment
cp .env.example .env.local
# Update NEXT_PUBLIC_API_URL=http://localhost:8000

# Start development server
npm run dev
```

---

## Default Credentials

| Role | Username | Password |
|------|----------|----------|
| Super Admin | `superadmin` | `Admin@123456` |

---

## Useful Commands

```bash
# Run all tests
npm test                          # Frontend unit tests
cd apps/api && vendor/bin/pest    # Backend feature tests
cd apps/web && npx playwright test # E2E tests

# Code quality
npm run lint                      # ESLint
npm run format                    # Prettier
cd apps/api && vendor/bin/pint    # PHP CS Fixer

# Laravel artisan helpers
php artisan make:model ModelName -mf  # Model + migration + factory
php artisan permission:cache-reset    # Reset permission cache
php artisan cache:clear               # Clear application cache
php artisan queue:listen              # Process jobs

# Database
php artisan migrate:fresh --seed      # Reset & reseed database
php artisan db:seed --class=XYZSeeder # Run specific seeder
```

---

## Project Structure

```
oxubiraz/
├── apps/
│   ├── web/               # Next.js 15 frontend
│   │   ├── src/
│   │   │   ├── app/       # App Router pages
│   │   │   ├── components/# UI components
│   │   │   ├── hooks/     # Custom React hooks
│   │   │   ├── lib/       # API client, utils, validations
│   │   │   ├── store/     # Zustand stores
│   │   │   └── types/     # TypeScript types
│   │   └── public/        # Static assets, PWA files
│   │
│   └── api/               # Laravel 11 API
│       ├── app/
│       │   ├── Http/      # Controllers, Requests, Resources
│       │   ├── Models/    # Eloquent models
│       │   ├── Services/  # Business logic
│       │   ├── Enums/     # PHP 8.1+ enums
│       │   └── Exceptions/# Error handling
│       ├── database/
│       │   ├── migrations/
│       │   └── seeders/
│       └── routes/api.php
│
├── docker/                # Docker configs
├── packages/              # Shared packages (tsconfig, eslint)
├── docs/                  # Documentation
├── .github/workflows/     # CI/CD
├── docker-compose.yml     # Dev environment
└── docker-compose.prod.yml# Production
```

---

## Environment Variables Reference

### Frontend (`apps/web/.env.local`)

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Laravel API base URL | `http://localhost:8000` |
| `NEXT_PUBLIC_APP_URL` | App URL | `http://localhost:3000` |
| `NEXT_PUBLIC_PUSHER_KEY` | Pusher App Key | — |
| `NEXT_PUBLIC_DEFAULT_LOCALE` | Default language | `az` |
| `NEXT_PUBLIC_ENABLE_AI` | Enable AI mode | `true` |

### Backend (`apps/api/.env`)

| Variable | Description |
|----------|-------------|
| `DB_*` | MySQL connection |
| `REDIS_*` | Redis connection |
| `PUSHER_*` | Realtime events |
| `MAIL_*` | Email sending |
| `OPENAI_API_KEY` | AI features |
| `SANCTUM_STATEFUL_DOMAINS` | Frontend domains |
