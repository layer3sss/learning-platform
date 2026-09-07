# Database Schema & Data Models

Learning OS uses **two interchangeable data stores**, selected at startup:

| Mode | When | Persistence |
|---|---|---|
| **PostgreSQL (Prisma)** | `DATABASE_URL` is set | Full persistence across restarts; safe for multi-replica deployments |
| **In-memory fallback** | `DATABASE_URL` unset | Zero-friction local dev/preview; data resets on restart |

The relational schema is defined in `/prisma/schema.prisma`. Both stores implement the same `DataStore` contract (`src/server/store-types.ts`), so the REST API behaves identically in either mode.

## Schema Bootstrap

The server **creates all tables automatically on first boot** against the configured PostgreSQL database (idempotent `CREATE TABLE IF NOT EXISTS` + unique indexes, see `src/server/prismaStore.ts`). This means:

- No `prisma migrate` step is required for a homelab deployment.
- `npx prisma db push` also works if you prefer managing the schema explicitly.
- Demo users (`learner@devops-os.local`, `admin@devops-os.local`) are seeded once; re-seeding never duplicates.

## Entity Models

1. **User:**
   - `id`, `name`, `email` (unique), `password` (bcrypt hash), `role` (USER / ADMIN)
   - `learningPhilosophy`, `preferredMethod`

2. **LearningState** (one per user, `userId` unique):
   - `currentRoadmapLevel`, `currentLevelTitle`, `currentProjectId/Title`, `currentTaskId/Title`, `currentTaskStatus`, `currentObjective`, `lastAssessmentSummary`, `nextRecommendedTask`

3. **UserSkill** (unique per `[userId, skillId]`):
   - `level` (0 to 5), `notes`, `lastDemonstratedAt`

4. **UserTaskProgress** (unique per `[userId, taskId]`):
   - `status` (TODO / IN_PROGRESS / BLOCKED / COMPLETED / FAILED / REQUIRES_PRACTICE), `notes`, `completionDate`

5. **UserProjectProgress** (unique per `[userId, projectId]`):
   - `status` (NOT_STARTED / IN_PROGRESS / COMPLETED / BLOCKED), `startDate`, `completionDate`

6. **Assessment:**
   - `projectId/Title`, `taskId/Title`, `status` (PASSED / PARTIAL / FAILED), `summary`, `strengths[]`, `weaknesses[]`, `mistakes[]`, `conceptsToPractice[]`, `recommendedNextTask`, `aiTeacherName`, `rawAssessmentText`

7. **JournalEntry:**
   - `title`, `content`, `tags[]`, project/task references, `date`

8. **Evidence:**
   - `title`, `description`, `url`, `githubRepo`, `commitUrl`, project/task references, `date`

The curriculum itself (roadmap levels, projects, tasks, skill catalog) is code-defined in `src/server/seedData.ts` — it is static content, not database state. Only per-user progress lives in the store.

## Multi-User Isolation

Every table carries a direct `userId` foreign key. User A's assessments, journal reflections, evidence links, and learning states are partitioned strictly at the query level — every store method takes `userId` and filters on it.

## Running Migrations (optional)

```bash
# Push schema directly to database (equivalent to the auto-bootstrap)
npx prisma db push

# Generate updated Prisma client
npx prisma generate
```
