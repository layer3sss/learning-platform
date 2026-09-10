# Docker & Container Guide

## Multi-Stage Build Details

The `Dockerfile` employs a 2-stage build:
1. **Builder stage (`node:22-alpine`):**
   - Installs build tools and full dependencies
   - Generates Prisma client
   - Compiles Vite frontend static files to `dist/`
   - Bundles `server.ts` into a standalone, optimized CommonJS file `dist/server.cjs` via `esbuild`
2. **Runner stage (`node:22-alpine`):**
   - Creates a dedicated non-root user `devopsuser:devopsgroup` (UID 1001)
   - Copies only production runtime files
   - Runs with minimal attack surface, exposing only port 3000

## Building the Image

```bash
docker build -t ghcr.io/mauricevanlavieren-lab/learning-platform:latest .
```

CI publishes this same image to GHCR on every push to `main` (tags: `latest` + `sha-<commit>`), so on the cluster you can also just pull it instead of building locally.

## Running with Docker Compose

```bash
# Start PostgreSQL and Learning OS
docker compose up -d --build

# View logs
docker compose logs -f learning-os

# Stop services
docker compose down
```

### Credentials

`docker-compose.yml` contains **no hardcoded secrets**. It reads optional overrides from the environment / `.env` with local-development defaults:

| Variable | Default (local dev only) | Purpose |
|---|---|---|
| `POSTGRES_USER` | `devops_admin` | Database user |
| `POSTGRES_PASSWORD` | `devops_local_dev_pw` | Database password |
| `POSTGRES_DB` | `devops_learning_os` | Database name |
| `POSTGRES_PORT` | `5432` | Host port for Postgres |
| `APP_PORT` | `3000` | Host port for the app |
| `AUTH_SECRET` | local-dev placeholder | JWT signing secret |

For anything beyond a closed local machine, set real values before starting:

```bash
cp .env.example .env
# edit .env: uncomment the compose section, fill real values, e.g.
#   POSTGRES_PASSWORD=$(openssl rand -hex 16)
#   AUTH_SECRET=$(openssl rand -hex 32)
docker compose up -d --build
```

`.env` is git-ignored and never committed.
