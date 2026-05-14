.PHONY: dev stop build push test test-api test-web test-e2e lint \
        shell-api shell-web shell-db logs logs-api logs-web logs-horizon \
        migrate seed fresh tinker horizon-publish queue-clear vapid \
        health install

COMPOSE_DEV  := docker compose -f docker-compose.dev.yml
COMPOSE_PROD := docker compose -f docker-compose.prod.yml
API          := $(COMPOSE_DEV) exec api
WEB          := $(COMPOSE_DEV) exec web

# ─── Development ──────────────────────────────────────────────────────────────

dev:
	$(COMPOSE_DEV) up -d

stop:
	$(COMPOSE_DEV) down

install:
	cd apps/api && composer install
	cd apps/web && npm install

# ─── Production build ─────────────────────────────────────────────────────────

build:
	docker build -t $(REGISTRY)/api:$(API_TAG) -f docker/php/Dockerfile.prod apps/api
	docker build -t $(REGISTRY)/horizon:$(API_TAG) -f docker/php/Dockerfile.horizon apps/api
	docker build \
	  --build-arg NEXT_PUBLIC_API_URL=$(NEXT_PUBLIC_API_URL) \
	  --build-arg NEXT_PUBLIC_APP_URL=$(NEXT_PUBLIC_APP_URL) \
	  -t $(REGISTRY)/web:$(WEB_TAG) -f docker/web/Dockerfile.prod apps/web

push:
	docker push $(REGISTRY)/api:$(API_TAG)
	docker push $(REGISTRY)/horizon:$(API_TAG)
	docker push $(REGISTRY)/web:$(WEB_TAG)

# ─── Testing ──────────────────────────────────────────────────────────────────

test: test-api test-web

test-api:
	$(API) php vendor/bin/pest --colors=always

test-web:
	$(WEB) npm run test

test-e2e:
	cd apps/web && npm run test:e2e

lint:
	$(API) php vendor/bin/pint
	cd apps/web && npm run lint

# ─── Database ─────────────────────────────────────────────────────────────────

migrate:
	$(API) php artisan migrate

seed:
	$(API) php artisan db:seed

fresh:
	$(API) php artisan migrate:fresh --seed

tinker:
	$(API) php artisan tinker

# ─── Shells ───────────────────────────────────────────────────────────────────

shell-api:
	$(API) sh

shell-web:
	$(WEB) sh

shell-db:
	$(COMPOSE_DEV) exec db mysql -u root -p$(MYSQL_ROOT_PASSWORD) oxubiraz

# ─── Logs ─────────────────────────────────────────────────────────────────────

logs:
	$(COMPOSE_DEV) logs -f

logs-api:
	$(COMPOSE_DEV) logs -f api

logs-web:
	$(COMPOSE_DEV) logs -f web

logs-horizon:
	$(COMPOSE_DEV) logs -f horizon

# ─── Maintenance ──────────────────────────────────────────────────────────────

horizon-publish:
	$(API) php artisan horizon:publish

queue-clear:
	$(API) php artisan horizon:clear

# Generate VAPID keys for Web Push notifications.
# Run once on first deploy; copy output to .env as VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY.
vapid:
	$(API) php artisan webpush:vapid

health:
	curl -s http://localhost:8000/api/health | python3 -m json.tool 2>/dev/null || \
	  curl -s http://localhost:8000/api/health
