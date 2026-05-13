# Security Architecture — Oxubiraz

## Authentication

- **Laravel Sanctum** — SPA token authentication
- Tokens expire after `SANCTUM_TOKEN_EXPIRATION` minutes (default 1440 = 24h)
- Long-lived tokens (30 days) for "Remember Me"
- Device-named tokens for session management
- All tokens invalidated on logout

## Authorization

- **Spatie Permission** — RBAC at the database level
- Every API route protected by `auth:sanctum` middleware
- Fine-grained `permission:*` middleware on each route group
- Super Admin bypasses permission checks via wildcard `*`
- Frontend `usePermission()` hook mirrors backend permissions

## Input Validation

- All API inputs validated via Laravel `FormRequest` classes
- Zod schemas validate all frontend form inputs
- File uploads validated by MIME type, not just extension
- XSS protection via sanitization on text inputs

## SQL Injection Prevention

- All database queries use Eloquent ORM (prepared statements)
- Raw queries use `DB::select()` with bindings — never string concatenation
- Spatie Query Builder limits which columns can be filtered/sorted

## CSRF Protection

- Sanctum cookie-based CSRF for SPA flows
- API-only token auth bypasses CSRF (by design — tokens are the auth)

## Rate Limiting

```php
// Defined in routes/api.php and config/cache.php
Route::middleware('throttle:auth')    // 10 req/min — login, register
Route::middleware('throttle:game')   // 120 req/min — game actions
Route::middleware('throttle:60,1')   // 60 req/min — all other API
```

## File Upload Security

- Maximum file size: 10MB (configurable)
- Accepted MIME types validated server-side via Spatie MediaLibrary
- Files stored outside `public/` and served via signed URLs
- Image conversion strips EXIF metadata

## Security Headers

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Content-Security-Policy: default-src 'self' ...
Strict-Transport-Security: max-age=63072000 (production)
```

## Audit Logging

- **Spatie ActivityLog** logs all model changes automatically
- Tracks: who did what, to which record, when, and from what IP
- Audit log API endpoint for admins to review

## Password Security

- Minimum 8 characters with mixed case + numbers (PHP `Password::min(8)->mixedCase()->numbers()`)
- Bcrypt with 12 rounds (`BCRYPT_ROUNDS=12`)
- Password reset via secure signed email link (expiry: 60 min)

## Sensitive Data

- Passwords hashed and never returned in API responses
- API tokens not stored in plaintext (Sanctum hashes them)
- NEVER log passwords, tokens, or PII
- `$hidden` array on User model excludes sensitive fields

## Dependency Security

```bash
# Frontend audit
cd apps/web && npm audit

# Backend audit
cd apps/api && composer audit

# Run regularly in CI (see .github/workflows/ci.yml)
```
