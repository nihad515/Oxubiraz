# REST API Reference — Oxubiraz

**Base URL:** `https://api.oxubiraz.az/api/v1`

All requests must include `Accept: application/json`.
Authenticated routes require `Authorization: Bearer <token>`.

## Response Envelope

All responses follow a consistent envelope:

```json
{ "status": "success", "data": { ... } }
{ "status": "success", "data": [ ... ], "meta": { "current_page": 1, "last_page": 3, "per_page": 15, "total": 42 } }
{ "status": "error", "message": "Validation failed", "errors": { "email": ["..."] } }
```

HTTP status codes: `200 OK`, `201 Created`, `204 No Content`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `422 Unprocessable Entity`, `429 Too Many Requests`

---

## Authentication

### POST `/auth/login`
Rate limited: 10 req/min. No auth required.

**Request:**
```json
{ "login": "username_or_email", "password": "Password@123", "device_name": "web", "remember": false }
```
**Response:**
```json
{
  "data": {
    "access_token": "1|abc...",
    "token_type": "Bearer",
    "expires_at": "2025-01-02T00:00:00Z",
    "user": { "id": 1, "first_name": "Ali", "role": "student", "roles": [...], "permissions": [...], "xp": 0, "level": 1, "streak_days": 0 }
  }
}
```

### POST `/auth/register`
**Request:**
```json
{ "first_name": "Ali", "last_name": "Əliyev", "username": "ali123", "email": "ali@example.com", "password": "Password@123", "password_confirmation": "Password@123", "role": "student", "locale": "az" }
```

### POST `/auth/logout`
Revokes the current token.

### GET `/auth/me`
Returns the authenticated user with roles, permissions, and gamification stats.

### POST `/auth/forgot-password`
**Request:** `{ "email": "user@example.com" }`

### POST `/auth/reset-password`
**Request:** `{ "token": "...", "email": "...", "password": "...", "password_confirmation": "..." }`

---

## Game

### POST `/game/start`
**Permission:** `play_game`

**Request:**
```json
{
  "mode": "random_words",
  "duration": 60,
  "language": "az",
  "word_count": 50,
  "word_list_id": null,
  "text_id": null,
  "difficulty": "elementary"
}
```
`mode`: `random_words | text_reading | sentence_reading | memory | ai`
`duration`: `30 | 60 | 90`
`language`: `az | ru | en`

**Response:**
```json
{ "data": { "session_id": "uuid", "words": ["alma", "arpa", ...], "config": { ... } } }
```

### POST `/game/finish`
**Permission:** `play_game`

**Request:**
```json
{
  "mode": "random_words",
  "duration": 60,
  "language": "az",
  "total_words": 50,
  "clicked_words": 42,
  "accuracy": 84.0,
  "completion_percentage": 84.0,
  "time_elapsed_ms": 58300,
  "is_completed": false
}
```
**Response:**
```json
{ "data": { "id": 1, "wpm": 43, "xp_earned": 25, "accuracy": 84.0, "is_completed": false } }
```

### GET `/game/history`
**Query params:** `per_page` (default 15), `mode`, `language`
Returns paginated `GameSession` list.

### GET `/game/results`
Returns the authenticated user's aggregate stats:
```json
{ "data": { "total_sessions": 12, "total_words": 600, "best_wpm": 95, "average_wpm": 72, "sessions_today": 2, "completion_rate": 83.3 } }
```

### GET `/game/config`
No auth required. Returns available modes, durations, languages, difficulties.

### GET `/game/random-words`
**Query params:** `language` (required), `count` (default 50), `difficulty`

### POST `/game/ai-coaching`
**Permission:** `play_game`

**Request:**
```json
{ "wpm": 72, "accuracy": 85, "mode": "random_words", "duration": 60, "language": "az", "top_weak_words": ["xəritə", "müzakirə"] }
```
**Response:** `{ "data": { "tip": "Your accuracy is strong. Focus on ..." } }`

---

## Achievements

### GET `/achievements`
Returns active achievements with `is_earned` and `earned_at` for the authenticated user.
Respects `Accept-Language` header (`az | ru | en`).

### GET `/achievements/me`
Returns only the achievements the authenticated user has earned, ordered by `earned_at` desc.

### GET `/achievements/admin`
**Permission:** `manage_achievements`. Returns all achievements (including inactive) with all multilingual fields.

### POST `/achievements`
**Permission:** `manage_achievements`

**Request:**
```json
{
  "name_az": "Sürətli oxucu", "name_ru": "Быстрый читатель", "name_en": "Fast Reader",
  "description_az": "...", "description_ru": "...", "description_en": "...",
  "icon": "🚀", "xp_reward": 100,
  "condition_type": "wpm_reached", "condition_value": 100, "is_active": true
}
```
`condition_type`: `wpm_reached | sessions_completed | streak_days | words_read | perfect_session | language_mastery | first_session | level_reached`

### PATCH `/achievements/{id}`
**Permission:** `manage_achievements`. All fields optional (partial update).

### DELETE `/achievements/{id}`
**Permission:** `manage_achievements`. Returns `{ "status": "success", "message": "Achievement deleted." }`.

---

## Leaderboard

### GET `/leaderboard/global`
**Query params:** `type` (`xp | wpm`, default `xp`), `period` (`week | month | year | all`, default `all`), `language` (`az | ru | en`)

**Response:**
```json
{ "data": [{ "rank": 1, "user_id": 5, "name": "Ali Əliyev", "xp": 2500, "level": 8, "avatar": null }] }
```

### GET `/leaderboard/school`
Same params. Scoped to the authenticated user's school. Returns empty array if user has no school.

### GET `/leaderboard/class`
Scoped to the authenticated user's class.

---

## Analytics

### GET `/analytics/me`
Returns the authenticated student's personal stats.

### GET `/analytics/overview`
**Permission:** `view_statistics`. Platform-wide aggregates.

### GET `/analytics/student/{id}`
**Permission:** `view_statistics`. Detailed stats for a specific student.

### GET `/analytics/student/{id}/report`
**Permission:** `view_statistics`. Returns a PDF report (blob, `Content-Type: application/pdf`).
**Query params:** `lang` (`az | ru | en`)

### GET `/analytics/export`
**Permission:** `export_reports`. Returns XLSX or CSV.
**Query params:** `format` (`xlsx | csv`), `period`, `school_id`, `class_id`

---

## Users

### GET `/users`
**Permission:** `view_users`. Filterable: `filter[search]`, `filter[role]`, `filter[school_id]`, `filter[is_active]`.

### GET `/users/{id}`
**Permission:** `view_users`.

### POST `/users`
**Permission:** `create_users`.

### PATCH `/users/{id}`
**Permission:** `edit_users`.

### DELETE `/users/{id}`
**Permission:** `delete_users`.

### GET `/users/me`
Returns the authenticated user's own profile.

### PATCH `/users/me`
Updates the authenticated user's own profile (`first_name`, `last_name`, `email`, `phone`).

### POST `/users/me/password`
Updates password. **Request:** `{ "current_password": "...", "password": "...", "password_confirmation": "..." }`

### POST `/users/me/avatar`
Multipart form upload. **Field:** `avatar` (image, max 10MB).

---

## Notifications

### GET `/notifications`
Returns paginated in-app notifications for the authenticated user.

### POST `/notifications/{id}/read`
Marks one notification as read.

### POST `/notifications/read-all`
Marks all notifications as read.

### DELETE `/notifications/{id}`

### GET `/notifications/unread-count`
Returns `{ "data": { "count": 3 } }`.

### POST `/notifications/broadcast`
**Permission:** `manage_notifications`

**Request:** `{ "title": "...", "message": "...", "target": "all | students | teachers | parents" }`
**Response:** `{ "data": { "sent": 142 } }`

---

## Competitions

### GET `/competitions`
**Query params:** `status` (`active | upcoming | ended`), `language`

### GET `/competitions/{id}`

### POST `/competitions`
**Permission:** `manage_competitions`

### PATCH `/competitions/{id}`
**Permission:** `manage_competitions`

### DELETE `/competitions/{id}`
**Permission:** `manage_competitions`

### POST `/competitions/{id}/join`
**Permission:** `participate_competitions`

### GET `/competitions/{id}/leaderboard`
Returns ranked list of participants with WPM scores.

---

## System Strings

### GET `/strings/locale/{locale}`
No auth required. Returns all active strings for the given locale (`az`, `ru`, `en`).
Used by the frontend on boot to load the string store.

**Response:** `{ "data": { "common.save": "Saxla", "nav.dashboard": "İdarəetmə paneli", ... } }`

### GET `/strings`
**Permission:** `view_strings`. Returns paginated strings with all locale values.

### POST `/strings`
**Permission:** `manage_strings`. Create or update a string key.

### PATCH `/strings/{id}`
**Permission:** `manage_strings`.

### DELETE `/strings/{id}`
**Permission:** `manage_strings`.

---

## Schools

### GET `/schools`
**Permission:** `view_schools`

### POST `/schools`
**Permission:** `manage_schools`

### PATCH `/schools/{id}`
**Permission:** `manage_schools`

### DELETE `/schools/{id}`
**Permission:** `manage_schools`

---

## Audit Logs

### GET `/audit-logs`
**Permission:** `manage_statistics`. Query params: `date_from`, `date_to`, `user_id`, `event`.

### GET `/audit-logs/export`
**Permission:** `export_reports`. Returns XLSX.

---

## Health

### GET `/health`
No auth required. Returns `200 OK` with service status.

```json
{
  "status": "healthy",
  "services": { "database": "ok", "redis": "ok", "queue": "ok" },
  "version": "1.0.0",
  "timestamp": "2025-01-01T00:00:00Z"
}
```

---

## Error Reference

| Code | Meaning |
|------|---------|
| `401` | Token missing or expired — re-authenticate |
| `403` | Insufficient permissions |
| `404` | Resource not found |
| `422` | Validation failed — check `errors` field |
| `429` | Rate limit exceeded — back off and retry |
| `500` | Server error — check Sentry / Horizon for details |

## Rate Limits

| Endpoint group | Limit |
|----------------|-------|
| Login / register / forgot-password | 10 req/min |
| Game actions | 120 req/min |
| All other API | 60 req/min |
