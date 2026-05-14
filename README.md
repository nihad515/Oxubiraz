# Oxubiraz — Reading Speed Platform

> Enterprise reading-speed education platform for children.
> Teaches speed reading in Azerbaijani, Russian, and English.

[![CI](https://github.com/your-org/oxubiraz/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/oxubiraz/actions/workflows/ci.yml)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, TailwindCSS, shadcn/ui |
| Backend | Laravel 11, PHP 8.3 |
| Database | MySQL 8, Redis 7 |
| Queue | Laravel Horizon |
| Realtime | Pusher |
| AI | OpenAI (coaching & adaptive difficulty) |
| Testing | Pest 3 (API), Vitest (unit), Playwright (E2E) |
| CI/CD | GitHub Actions → Docker → SSH deploy |

## Quick Start

**Prerequisites:** Docker Desktop, Git

```bash
git clone https://github.com/your-org/oxubiraz.git
cd oxubiraz

# Copy env files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# Start all services
docker compose up -d

# Bootstrap backend
docker compose exec api php artisan key:generate
docker compose exec api php artisan migrate --seed
docker compose exec api php artisan storage:link
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:8000 |
| Mailpit | http://localhost:8025 |
| Horizon | http://localhost:8000/horizon |

Default login: `superadmin` / `Admin@123456`

See [docs/LOCAL_DEVELOPMENT.md](docs/LOCAL_DEVELOPMENT.md) for full setup instructions.

## User Roles

| Role | Access |
|------|--------|
| **super_admin** | Everything |
| **admin** | Users, content, analytics, system settings |
| **teacher** | Assigned students, class analytics |
| **student** | Game, leaderboard, achievements, own stats |
| **parent** | Children's progress |

## Features

- **Speed reading game** — 5 modes: random words, text reading, sentence reading, memory, AI
- **Gamification** — XP, levels, streaks, achievements, leaderboard
- **AI coaching** — OpenAI-powered tips after each session
- **Multilingual** — All UI strings managed via DB, switchable at runtime (az/ru/en)
- **Competitions** — Timed competitions for classes and schools
- **Push notifications** — Web Push (VAPID) for achievements and milestones
- **Analytics** — Detailed progress tracking, WPM trends, teacher dashboards
- **Admin panel** — Full CRUD for users, content, achievements, schools, roles
- **Audit log** — All admin actions tracked via Spatie ActivityLog
- **PWA** — Installable, works offline for the game

## Development Commands

```bash
make dev          # Start Docker stack
make test         # Run all tests (API + frontend)
make test-api     # Pest feature tests
make test-web     # Vitest unit tests
make test-e2e     # Playwright E2E tests
make lint         # PHP Pint + ESLint
make migrate      # Run migrations in dev
make fresh        # Reset database + reseed
make shell-api    # Shell into API container
make health       # Check API health endpoint
```

## Project Structure

```
oxubiraz/
├── apps/
│   ├── web/                   # Next.js 15 frontend
│   │   ├── src/
│   │   │   ├── app/           # App Router (pages by role)
│   │   │   │   ├── (auth)/    # Login, register, forgot-password
│   │   │   │   └── (dashboard)/
│   │   │   │       ├── student/
│   │   │   │       ├── teacher/
│   │   │   │       ├── admin/
│   │   │   │       ├── parent/
│   │   │   │       └── profile/
│   │   │   ├── components/    # Shared UI components
│   │   │   │   ├── ui/        # shadcn/ui primitives
│   │   │   │   ├── game/      # Game board, HUD, result card
│   │   │   │   ├── layout/    # Sidebar, bottom nav, header
│   │   │   │   └── notifications/
│   │   │   ├── hooks/         # useString, usePermission, useGame...
│   │   │   ├── lib/           # API client, endpoints, utils, format
│   │   │   ├── store/         # Zustand: auth, game, string, ui
│   │   │   ├── types/         # TypeScript types
│   │   │   └── config/        # App config, routes, permissions
│   │   └── tests/e2e/         # Playwright specs + fixtures
│   │
│   └── api/                   # Laravel 11 backend
│       ├── app/
│       │   ├── Http/Controllers/Api/V1/
│       │   ├── Models/
│       │   ├── Services/      # GameService, OpenAiCoachingService...
│       │   ├── Enums/
│       │   └── Http/Resources/
│       ├── database/
│       │   ├── migrations/
│       │   ├── seeders/
│       │   └── factories/
│       └── routes/api.php
│
├── docker/                    # Nginx, PHP-FPM, Supervisor configs
├── scripts/                   # server-setup.sh, first-deploy.sh, rollback.sh
├── docs/                      # Developer documentation
├── .github/workflows/         # CI + CD pipelines
├── docker-compose.yml         # Dev environment
├── docker-compose.prod.yml    # Production
├── Makefile                   # Developer shortcuts
└── CLAUDE.md                  # Claude Code project guide
```

## API Overview

Base URL: `https://api.oxubiraz.az/api/v1`

All endpoints require `Authorization: Bearer <token>` unless noted.

| Group | Endpoints |
|-------|-----------|
| Auth | `POST /auth/login`, `POST /auth/register`, `POST /auth/logout`, `GET /auth/me` |
| Game | `POST /game/start`, `POST /game/finish`, `GET /game/history`, `GET /game/results` |
| Achievements | `GET /achievements`, `GET /achievements/me`, `GET /achievements/admin` |
| Leaderboard | `GET /leaderboard/global`, `/leaderboard/school`, `/leaderboard/class` |
| Analytics | `GET /analytics/me`, `GET /analytics/overview`, `GET /analytics/export` |
| Users | `GET /users`, `GET /users/{id}`, `PATCH /users/{id}`, `DELETE /users/{id}` |
| Notifications | `GET /notifications`, `POST /notifications/broadcast` |
| Competitions | `GET /competitions`, `POST /competitions/{id}/join` |
| Strings | `GET /strings/locale/{locale}` |

Full API reference: [docs/API.md](docs/API.md)

## Deployment

Deployments are automated: push to `main` → CI passes → Docker images built → SSH deploy.

For first-time server setup:
```bash
# On the server
sudo bash scripts/server-setup.sh
cp .env.prod.example .env.prod   # fill in all values
bash scripts/first-deploy.sh
```

See [docs/PRODUCTION_DEPLOYMENT.md](docs/PRODUCTION_DEPLOYMENT.md) for details.

Emergency rollback:
```bash
make rollback SHA=abc1234
```

## Documentation

| Doc | Description |
|-----|-------------|
| [CLAUDE.md](CLAUDE.md) | Claude Code project guide (rules, patterns, gotchas) |
| [docs/LOCAL_DEVELOPMENT.md](docs/LOCAL_DEVELOPMENT.md) | Full local setup instructions |
| [docs/PRODUCTION_DEPLOYMENT.md](docs/PRODUCTION_DEPLOYMENT.md) | Server setup and deploy guide |
| [docs/SECURITY.md](docs/SECURITY.md) | Security architecture |
| [docs/API.md](docs/API.md) | REST API reference |

## Contributing

1. Branch from `main`
2. Write tests for new features
3. Run `make lint` and `make test` locally before pushing
4. CI must pass — CD will deploy automatically on merge to `main`
