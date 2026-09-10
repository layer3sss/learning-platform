# DevOps Learning OS

> **The Learning OS is the permanent source of truth for the learner's learning state. The AI teacher is external and interchangeable.**

DevOps Learning OS is a multi-user learning management system and progress cockpit specifically designed for hands-on, project-based engineering.

There is **NO AI API integration** in this application. The learner manually copies structured context from the Learning OS into ChatGPT, Claude, Gemini, or any browser-based AI mentor. The external AI teaches, assigns troubleshooting missions, and produces assessments. The learner brings the resulting evaluation back into the Learning OS, where skills, state, and next tasks are permanently tracked.

---

## Core Learning Philosophy: Learn by Building

The system is built around active problem solving:

```
MISSION → BUILD → BREAK → TROUBLESHOOT → AI HINTS (IF BLOCKED) → ASSESS → RECORD → ADVANCE
```

Instead of passive theory lectures, each level provides real missions where you configure servers, deploy reverse proxies, write multi-stage Dockerfiles, orchestrate Kubernetes pods, and debug broken distributed systems.

---

## Architecture Overview

- **Frontend:** React 19 + TypeScript + Tailwind CSS v4 + Lucide Icons
- **Backend:** Node.js Express with typed REST API endpoints (`/api/auth/*`, `/api/learning-state`, `/api/roadmap`, `/api/skills`, `/api/assessments`, `/api/journal`, `/api/evidence`, `/api/ai-context`, `/api/progress`, `/api/admin/*`)
- **Data storage — two interchangeable modes, selected by environment:**
  - `DATABASE_URL` set → **PostgreSQL via Prisma ORM** (persistent, multi-user safe, multi-replica safe). Tables are auto-created on first boot; no migration step required.
  - `DATABASE_URL` unset → **In-memory fallback** (zero-friction local dev and preview; data resets on restart)
- **Authentication:** Multi-user isolation with salted bcrypt password hashing and JSON Web Tokens (JWT)
- **Containerization:** Multi-stage `Dockerfile` (Prisma client generated at build time, non-root runtime user, built-in HEALTHCHECK)
- **Target platform:** Kubernetes / k3s (`/k8s/learning-os.yaml`) — designed for a home-lab cluster with no external access
- **CI/CD:** GitHub Actions workflow (`/.github/workflows/ci.yml`): typecheck, build, Docker image push to GHCR, then automatic `kubectl rollout restart deployment/learning-os-deployment -n devops-learning-os` on the self-hosted runner (cluster server)
- **Testing:** `npm run test:smoke` runs a 70+ check API test suite against a live server (any mode)

## Curriculum

Levels 0–13, from lab setup to a full production-lifecycle capstone:

| Level | Focus |
|---|---|
| 0 | DevOps Lab (terminal, Git, SSH) |
| 1 | Linux Server (users, systemd, firewall) |
| 2 | Web Application (Nginx, DNS, TLS) |
| 3 | Containers (Dockerfiles, Compose) |
| 4 | CI/CD (GitHub Actions, GHCR) |
| 5 | Kubernetes (Deployments, Services, PVCs) |
| 6 | Kubernetes Troubleshooting |
| 7 | Terraform & IaC |
| 8 | Ansible & Config Management |
| 9 | Monitoring & Observability (Prometheus, Grafana) |
| 10 | Security & DevSecOps (RBAC, NetworkPolicies) |
| 11 | GitOps & Argo CD |
| 12 | Platform Engineering (ingress, TLS, quotas, backups) |
| 13 | Capstone: Run It Like Production |

---

## Quick Start (Local Development)

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/yourorg/devops-learning-os.git
cd devops-learning-os

# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate
```

### 2. Environment Configuration

Copy the example environment file (`.env` is git-ignored — real credentials never get committed):

```bash
cp .env.example .env
```

Default variables:
- `PORT=3000`
- `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/learning_os?schema=public"`
- `AUTH_SECRET="your-secure-jwt-secret"`

> **Note:** With `DATABASE_URL` set, the app persists to PostgreSQL. Delete the variable (or leave `.env` empty) to run in in-memory mode. Tables are created automatically on first boot — `prisma migrate` is optional.

### 3. Run Dev Server

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## Pre-Configured Testing Accounts

For rapid validation in local and preview environments, two seed accounts are pre-configured:

1. **DevOps Learner Account:**
   - **Email:** `learner@devops-os.local`
   - **Password:** `devops123`
   - **Role:** `USER`
   - Pre-loaded with Level 0 active mission, verified skills, and sample evidence.

2. **Curriculum Administrator Account:**
   - **Email:** `admin@devops-os.local`
   - **Password:** `devops123`
   - **Role:** `ADMIN`
   - Access to user management and curriculum configuration.

You can also register any new user account via the **Sign In / Create Account** modal.

---

## Resetting Progress & Database Maintenance

**Learners** can wipe their own progress and start from Level 0 via **Settings → Danger Zone → Reset Progress** (API: `DELETE /api/progress` with `{ confirm: true }`). This erases task/project statuses, skill levels, assessments, journal entries, and evidence; the account itself is kept and a fresh Level 0 state is seeded.

**Admins** get a **Database Maintenance** panel in the Admin view showing total storage size, per-table row counts, and per-user storage usage, plus three actions (API: `/api/admin/database`, `/api/admin/users/:id/reset`, `DELETE /api/admin/users/:id`):

- **Reset user progress** — erase a specific user's learning data (keeps the account)
- **Delete user** — remove an account together with all of its data
- **Orphaned data cleanup** — remove progress rows that reference users which no longer exist (e.g. after manual database pruning)

---

## Testing

Start the server, then run the smoke suite against it:

```bash
npm run test:smoke                        # against http://localhost:3000
npm run test:smoke http://localhost:3100  # custom URL
```

Pass `--dirty` when the server has served traffic before (skips assertions that require a fresh store).

---

## Docker Compose Quick Start

To launch Learning OS alongside a dedicated PostgreSQL 16 database:

```bash
docker compose up -d --build
```

Access the app at `http://localhost:3000`.

---

## Kubernetes Deployment (k3s / MicroK8s / EKS)

Deploy to your local home cluster:

```bash
# Option A: pull the image CI published to GHCR (no local build needed)
#   ghcr.io/mauricevanlavieren-lab/learning-platform:latest

# Option B: build locally instead
docker build -t ghcr.io/mauricevanlavieren-lab/learning-platform:latest .

# One-time: create the real secret on the server (k8s/secret.yaml is git-ignored)
cp k8s/secret.example.yaml k8s/secret.yaml   # then edit with real values
kubectl apply -f k8s/secret.yaml

kubectl apply -f k8s/learning-os.yaml
```

See [docs/kubernetes.md](docs/kubernetes.md) for details and an imperative alternative.

Inspect the deployment:

```bash
kubectl get pods -n devops-learning-os
kubectl get ingress -n devops-learning-os
```

---

## Documentation Index

- [Architecture Overview](docs/architecture.md)
- [Database Schema & Prisma Guide](docs/database.md)
- [Local Development Guide](docs/development.md)
- [Docker & Container Guide](docs/docker.md)
- [Kubernetes & k3s Deployment Guide](docs/kubernetes.md)
- [Production Deployment](docs/deployment.md)
