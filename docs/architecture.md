# Architecture & Design Principles

## Core Principle

> **The Learning OS is the permanent source of truth for the learner's learning state. The AI teacher is external and interchangeable.**

Traditional educational systems either lock you into proprietary learning silos or embed an AI chatbot via an API key, coupling your learning history to a single commercial vendor.

Learning OS rejects both models:
1. **Zero External AI API Integration:** You never pay for or configure API tokens. You are free to take your AI Context to ChatGPT-4o today, Claude 3.5 Sonnet tomorrow, Gemini 2.5 Pro next week, or a locally hosted DeepSeek/Llama model on your own homelab GPU.
2. **Deterministic Context Generation:** The Learning OS synthesizes your exact roadmap coordinates, active mission objectives, demonstrated skill ratings (0–5), recent errors, and feedback into a clean, copyable Markdown prompt.
3. **Structured Ingestion:** When the external model evaluates your hands-on code or troubleshooting session, you import that evaluation back into the Learning OS.

---

## Architectural Topology

```
┌────────────────────────────────────────────────────────────────────────┐
│                        External AI Ecosystem                           │
│     (ChatGPT / Claude / Gemini / Local Ollama / Any LLM Interface)     │
└───────────────▲───────────────────────────────────────┬────────────────┘
                │ Copy AI Context                       │ Paste Evaluation
                │ (Formatted Markdown Prompt)           │ (Outcome & Skills)
┌───────────────┴───────────────────────────────────────▼────────────────┐
│                       DevOps Learning OS                               │
│                                                                        │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │ Client UI (React 19 + Tailwind CSS + Lucide Icons)           │     │
│   │ - Mission Cockpit (Where am I? What's next?)                 │     │
│   │ - Roadmap Progress (Level 0 - 13)                            │     │
│   │ - Skills Matrix (Levels 0 - 5)                               │     │
│   │ - AI Context Generator & Copy Buffer                         │     │
│   │ - Assessments & Evidence Log                                 │     │
│   └──────────────────────────────┬───────────────────────────────┘     │
│                                  │ REST API (Bearer JWT)               │
│   ┌──────────────────────────────▼───────────────────────────────┐     │
│   │ Express Application Server (Node.js 22)                      │     │
│   │ - Authentication & Multi-user isolation                      │     │
│   │ - Learning State Engine (Current Mission Resolution)         │     │
│   │ - Skills & Assessment Verification                           │     │
│   │ - Context Synthesizer (Zero LLM API dependency)              │     │
│   └──────────────────────────────┬───────────────────────────────┘     │
│                                  │ DataStore contract                  │
│   ┌──────────────────────────────▼───────────────────────────────┐     │
│   │ Data Layer (src/server/store-types.ts)                       │     │
│   │ - PrismaStore: PostgreSQL, persistent (DATABASE_URL set)     │     │
│   │ - MemoryStore: in-process fallback (DATABASE_URL unset)      │     │
│   └──────────────────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Data Layer: Two Interchangeable Stores

Both stores implement the same `DataStore` interface (`src/server/store-types.ts`); the REST API is identical in either mode. Selection happens in `src/server/db.ts`:

- **`DATABASE_URL` set → PrismaStore (PostgreSQL).** Tables are auto-created idempotently on boot; demo users seed once without duplication. This is the mode for Docker Compose and Kubernetes, and the only mode that is safe with multiple replicas.
- **`DATABASE_URL` unset → MemoryStore.** Same behavior, zero configuration, data resets on restart. Intended for local dev and preview environments.

The curriculum (roadmap, projects, tasks, skills catalog) is static content in `src/server/seedData.ts`; only per-user progress is stored.

## Operational Behavior

- **Startup:** The server waits for the data store before accepting traffic (retry loop, ~30 s), so the pod can start before PostgreSQL is ready.
- **Health:** `GET /api/health` performs a real store round-trip. It returns `503` with the store status when the database is unreachable — Kubernetes readiness probes route on truth, not on a hardcoded "healthy".
- **Shutdown:** SIGTERM/SIGINT drains HTTP connections, closes the store, and exits — clean rollouts on `kubectl` and `docker compose`.
- **Port:** Read from `PORT` (default 3000); `.env` is loaded via dotenv in all modes.

## Multi-User Isolation

Every table in the database schema maintains a direct `userId` foreign key. User A's assessments, journal reflections, evidence links, and learning states are partitioned strictly at the query level — every store method is keyed by `userId`.
