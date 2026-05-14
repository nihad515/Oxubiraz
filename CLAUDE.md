# Oxubiraz — Claude Code Guide

## Project Overview

Oxubiraz is an enterprise reading-speed education platform for children in Azerbaijan.
Turborepo monorepo with **Next.js 15** (frontend) + **Laravel 11** (API).
Languages: Azerbaijani, Russian, English. Five roles: super_admin, admin, teacher, student, parent.

## Architecture

```
oxubiraz/
├── apps/web/          # Next.js 15, React 19, TypeScript, TailwindCSS, shadcn/ui
├── apps/api/          # Laravel 11, PHP 8.3, MySQL 8, Redis 7
├── docker/            # Dockerfiles + Nginx/Supervisor configs
├── scripts/           # Server provisioning and deploy helpers
└── .github/workflows/ # CI (ci.yml) + CD (cd.yml, triggers on CI success)
```

**Frontend stack:** App Router · Zustand · react-query · react-hook-form + Zod · Recharts · Framer Motion · Playwright

**Backend stack:** Sanctum (token auth) · Spatie Permission (RBAC) · Laravel Horizon (queues) · Spatie ActivityLog

## Non-Negotiable Rules

These rules apply to every code change, no exceptions:

1. **NEVER hardcode strings.** Every user-visible label must come from `useString()` / `t()`:
   ```tsx
   const { t } = useString();
   // ✅ correct
   <Button>{t('common.save', {}, 'Save')}</Button>
   // ❌ wrong
   <Button>Save</Button>
   ```
   New string keys must also be added to `apps/api/database/seeders/SystemStringSeeder.php` with az/ru/en translations.

2. **NEVER skip mobile responsiveness.** Every page and component must work at 375px (mobile), 768px (tablet), and 1280px (desktop). Use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`).

3. **ALWAYS check permissions** before rendering admin/teacher/management UI. Use `usePermission(PERMISSIONS.X)` in components and `permission:X` middleware on API routes.

4. **API endpoints must always use the `API` constant** from `apps/web/src/lib/api/endpoints.ts`. Never hardcode URL strings in components.

## String System

All UI strings are stored in the `system_strings` table, loaded into `useStringStore`, and accessed via `useString()`.

```tsx
import { useString } from '@/hooks/use-string';

const { t } = useString();

// Simple string
t('nav.dashboard')

// With interpolation
t('game.xp_earned', { xp: 50 })   // → "+50 XP qazandınız"

// With fallback (shown while strings are loading)
t('common.save', {}, 'Save')
```

When adding new strings:
1. Use them in code with `t('group.key', {}, 'English fallback')`
2. Add to the seeder array in `SystemStringSeeder.php`:
   ```php
   ['key' => 'group.key', 'group' => 'group', 'az' => '...', 'ru' => '...', 'en' => '...'],
   ```

## Key Files

| Purpose | Path |
|---------|------|
| API endpoints map | `apps/web/src/lib/api/endpoints.ts` |
| Route constants | `apps/web/src/config/routes.ts` |
| Permission constants | `apps/web/src/types/permissions.ts` |
| Auth store | `apps/web/src/store/auth-store.ts` |
| Game store | `apps/web/src/store/game-store.ts` |
| String store | `apps/web/src/store/string-store.ts` |
| useString hook | `apps/web/src/hooks/use-string.ts` |
| API client | `apps/web/src/lib/api/client.ts` |
| API routes | `apps/api/routes/api.php` |
| String seeder | `apps/api/database/seeders/SystemStringSeeder.php` |
| Role/permission seeder | `apps/api/database/seeders/RolePermissionSeeder.php` |
| Dashboard layout | `apps/web/src/app/(dashboard)/layout.tsx` |

## Common Patterns

### Page with data fetching
```tsx
'use client';
import { useQuery } from '@tanstack/react-query';
import { useString } from '@/hooks/use-string';
import apiClient from '@/lib/api/client';
import { API } from '@/lib/api/endpoints';

export default function MyPage() {
  const { t } = useString();
  const { data, isLoading } = useQuery({
    queryKey: ['my-resource'],
    queryFn: () => apiClient.get(API.myResource.list),
    select: (d: any) => d.data,
  });

  if (isLoading) return <LoadingSpinner />;
  return <div>{t('page.title', {}, 'My Page')}</div>;
}
```

### File download (XLSX/CSV/PDF)
```tsx
const response = await apiClient.axios.get(API.resource.export, {
  params: { format: 'xlsx' },
  responseType: 'blob',
});
const url = URL.createObjectURL(new Blob([response.data], { type: mimeType }));
const a = document.createElement('a');
a.href = url; a.download = 'report.xlsx';
document.body.appendChild(a); a.click();
document.body.removeChild(a);
URL.revokeObjectURL(url);
```

### Laravel API controller (pattern)
```php
public function index(Request $request): JsonResponse
{
    $this->authorize('viewAny', Model::class); // or use middleware
    $data = Model::query()
        ->filter($request->only(['search', 'role']))
        ->paginate($request->integer('per_page', 15));
    return response()->json(['status' => 'success', 'data' => $data]);
}
```

## Testing

### Backend (Pest 3)
```bash
# Run all tests
cd apps/api && vendor/bin/pest --colors=always

# Run with coverage (min 70%)
vendor/bin/pest --coverage --min=70

# Run a specific test file
vendor/bin/pest tests/Feature/AchievementTest.php
```

Each test file uses `uses(RefreshDatabase::class)` and seeds `RolePermissionSeeder` in `beforeEach`.

### Frontend (Vitest)
```bash
cd apps/web && npm run test          # all unit tests
npm run test -- --reporter=verbose   # verbose output
```

Test files:
- `src/store/*.test.ts` — Zustand store tests (node environment)
- `src/hooks/*.test.ts` — Hook tests (jsdom via `// @vitest-environment jsdom`)
- `src/lib/utils/*.test.ts` — Utility function tests

### E2E (Playwright)
```bash
cd apps/web && npm run test:e2e
npm run test:e2e -- --project=chromium  # chromium only
```

E2E fixtures in `apps/web/tests/e2e/fixtures/index.ts` provide `studentPage`, `adminPage`, `teacherPage` with pre-authenticated contexts.

## CI/CD Flow

```
push to main
  └── CI (ci.yml) — parallel: frontend build/test, backend pest + pint, security audit
        └── on success → CD (cd.yml)
              ├── Build Docker images → push to GHCR
              ├── SSH to server → pull images → rolling deploy (scale api=2 → health check → scale api=1)
              ├── Run migrations + optimize
              └── Notify Slack
```

Manual deploy commands (on server): see `scripts/` and `make help`.

## Adding a New Feature (Checklist)

- [ ] Backend: Controller + route in `routes/api.php` with correct `permission:*` middleware
- [ ] Backend: Feature test in `tests/Feature/`
- [ ] Frontend: Add endpoint to `apps/web/src/lib/api/endpoints.ts`
- [ ] Frontend: Add route to `apps/web/src/config/routes.ts` if needed
- [ ] Frontend: Page uses `useString()` for all labels — no hardcoded strings
- [ ] Frontend: Page is mobile-responsive (tested at 375px)
- [ ] Frontend: New string keys added to `SystemStringSeeder.php`
- [ ] Frontend: Sidebar entry added if it's a new nav item

## Environment Variables

| Key | Where | Purpose |
|-----|-------|---------|
| `NEXT_PUBLIC_API_URL` | web `.env.local` | API base URL |
| `NEXT_PUBLIC_PUSHER_KEY` | web `.env.local` | Realtime events |
| `OPENAI_API_KEY` | api `.env` | AI coaching mode |
| `VAPID_PUBLIC_KEY` | api `.env` | Web push notifications |
| `HORIZON_USERNAME` | api `.env` | Horizon dashboard auth |

See `.env.prod.example` for the full production list.

## Gotchas

- **`/profile`** — the shared profile page lives at `/(dashboard)/profile/page.tsx`, not under any role prefix. `ROUTES.student.profile` points to `/profile`.
- **`Achievement::active()`** — uses `scopeActive()` defined on the model (`where('is_active', true)`). Don't call `Achievement::where('is_active', true)` inline.
- **`AchievementConditionType`** enum values: `wpm_reached`, `sessions_completed`, `streak_days`, `words_read`, `perfect_session`, `language_mastery`, `first_session`, `level_reached`. The factory must use these exact strings.
- **`t()` with `vars` routes through `interpolate()`** even if vars is `{}`. Pass `undefined` (not `{}`) when you don't need interpolation.
- **Laravel `config:cache`** bakes env values — if you update `.env.prod`, run `php artisan config:clear && php artisan config:cache` in the container.
- **Badge variants** available: `default`, `secondary`, `destructive`, `outline`, `success`, `warning`, `info`, `bronze`, `silver`, `gold`, `platinum`.
