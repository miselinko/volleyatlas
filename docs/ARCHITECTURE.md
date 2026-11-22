# Architecture
Inspired by POMAK's monorepo: one React PWA frontend, one Django backend, one PostgreSQL database (planned Neon). Both browser and Android Capacitor build use the same frontend.

Deploy Vercel web as root directory `frontend`, framework Vite. A separate Vercel Django API can use root `backend` after DB provisioning. Never run migrations in deployment builds. Set `SECRET_KEY`, `ALLOWED_HOSTS` and pooled `DATABASE_URL` as protected environment variables.

Public web currently reads the versioned snapshot `frontend/public/data/verified.json`. The backend is NOT yet connected to this public UI. Data importer needs source licensing, provider-specific parser versions, validation and idempotent provider match IDs.

Mobile: screens reflow to one column on phones, four touch-friendly bottom nav actions, CSS safe areas, no horizontal scrolling in match cards.
