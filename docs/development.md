# Local Development Guide

## Prerequisites

- Node.js 20+ (Node.js 22 LTS recommended)
- npm 10+
- Optional: Docker & Docker Compose (for running PostgreSQL container locally)

## Running Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

3. **Start Development Server:**
   ```bash
   npm run dev
   ```
   The application binds to the port from `.env` (`PORT`, default 3000).

## Data Store Modes

- **With `DATABASE_URL` in `.env`:** all data persists to PostgreSQL. Tables are created automatically on first boot — no migration step needed.
- **Without `DATABASE_URL`:** the app runs on the in-memory fallback store. Same API, same behavior; data resets when the process stops. Handy for quick experiments.

## Code Structure

- `/src/App.tsx`: Main layout, state coordination, and view router
- `/src/components/Header.tsx`: Current mission summary & quick role switcher
- `/src/components/Sidebar.tsx`: Navigation menu
- `/src/components/AuthModal.tsx`: Login, register, and demo user switches
- `/src/components/views/DashboardView.tsx`: Core cockpit view answering where am I and what to do next
- `/src/components/views/AIContextView.tsx`: One-click copyable context generator for ChatGPT/Claude/Gemini
- `/src/components/views/RoadmapView.tsx`: Full Levels 0–13 interactive syllabus
- `/src/components/views/AssessmentsView.tsx`: AI teacher evaluation recorder and archive
- `/src/components/views/SkillsView.tsx`: Demonstrated skills matrix (0–5)
- `/src/components/views/JournalView.tsx`: Troubleshooting notes and learnings
- `/src/components/views/EvidenceView.tsx`: Verifiable GitHub links and commit proofs
- `/src/components/views/AdminView.tsx`: Administrator console (user list)
- `/src/server/store-types.ts`: Shared `DataStore` contract (both stores implement it)
- `/src/server/prismaStore.ts`: PostgreSQL persistence via Prisma (auto-creates tables, seeds demo users once)
- `/src/server/memoryStore.ts`: In-memory fallback store for local dev/preview
- `/src/server/db.ts`: Store factory — picks Prisma or memory based on `DATABASE_URL`
- `/src/server/seedData.ts`: DevOps Level 0–13 curriculum and initial skills data
- `/server.ts`: Express REST API endpoints with JWT authentication, health checks, graceful shutdown
- `/scripts/smoke-test.mjs`: 70+ check API test suite runnable against any live server

## Testing

With the dev server (or any built server) running:

```bash
npm run test:smoke
```

The suite covers auth, learning state, roadmap (asserts all 14 levels), tasks, skills, assessments (including skill/state side effects), journal, evidence, AI context, admin authorization, and error handling. Pass `--dirty` if the server has served traffic before, and a URL argument to target a non-default host.
