# Wikiora

Collaborative query posting and resolution platform for organizations, teams, and communities.

## Stack

- **Web:** React, TypeScript, Redux Toolkit, shadcn/ui, Tailwind CSS, Clerk
- **API:** Go, Gin, GORM, PostgreSQL
- **Auth:** Clerk (session sync into local `users` table)

## Quick start

1. Copy environment files:

```bash
cp .env.example apps/api/.env
cp .env.example apps/web/.env
```

2. Start infrastructure:

```bash
make up
```

3. Run the API:

```bash
make api
```

4. Run the web app:

```bash
make web
```

## Clerk setup

1. Create a Clerk application.
2. Set `VITE_CLERK_PUBLISHABLE_KEY` in `apps/web/.env`.
3. Set `CLERK_SECRET_KEY` in `apps/api/.env`.
4. Add a webhook endpoint `POST /api/v1/webhooks/clerk` for `user.created` and `user.updated`.
5. Set `CLERK_WEBHOOK_SIGNING_SECRET` in `apps/api/.env`.

Authenticated API requests should send `Authorization: Bearer <clerk_session_token>`.
