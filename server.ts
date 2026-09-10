import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { createStore } from './src/server/db.js';
import type { DataStore } from './src/server/store-types.js';
import type { User, TaskStatus } from './src/types.js';

interface AuthenticatedRequest extends Request {
  user?: User;
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Store is selected by environment: PostgreSQL (Prisma) when DATABASE_URL is
// configured, in-memory fallback otherwise (local dev / preview).
const db: DataStore = createStore();

// ---------------------------------------------
// Authentication Middleware
// ---------------------------------------------

async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Please provide a valid Bearer token.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const user = await db.verifyToken(token);
    if (!user || !user.id) {
      res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
      return;
    }
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
  }
}

function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'ADMIN') {
    res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
    return;
  }
  next();
}

// ---------------------------------------------
// API Routes
// ---------------------------------------------

// System Health & Architecture Info
app.get('/api/health', async (_req, res) => {
  try {
    await db.healthCheck();
    res.json({
      status: 'ok',
      system: 'DevOps Learning OS',
      version: '1.1.0',
      timestamp: new Date().toISOString(),
      store: {
        mode: db.kind,
        status: 'healthy'
      }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Store unreachable';
    res.status(503).json({
      status: 'error',
      system: 'DevOps Learning OS',
      timestamp: new Date().toISOString(),
      store: {
        mode: db.kind,
        status: 'unreachable',
        error: message
      }
    });
  }
});

// Authentication: Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body ?? {};
    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required.' });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters.' });
      return;
    }

    const assignedRole = role === 'ADMIN' ? 'ADMIN' : 'USER';
    const result = await db.register(name, email, password, assignedRole);
    res.status(201).json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Registration failed.';
    res.status(400).json({ error: message });
  }
});

// Authentication: Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const result = await db.login(email, password);
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Login failed.';
    res.status(401).json({ error: message });
  }
});

// Authentication: Get Current Profile
app.get('/api/auth/me', requireAuth, async (req: AuthenticatedRequest, res) => {
  const user = await db.getUserById(req.user!.id);
  if (!user) {
    res.status(401).json({ error: 'User no longer exists. Please log in again.' });
    return;
  }
  res.json({ user });
});

// Authentication: Quick Demo Switcher (Helps testing between Learner and Admin roles instantly)
app.post('/api/auth/switch-demo', async (req, res) => {
  try {
    const { targetRole } = req.body ?? {};
    const email = targetRole === 'ADMIN' ? 'admin@devops-os.local' : 'learner@devops-os.local';
    const result = await db.login(email, 'devops123');
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to switch demo user.';
    res.status(500).json({ error: message });
  }
});

// Learning State: Get active user position
app.get('/api/learning-state', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const state = await db.getLearningState(req.user!.id);
    res.json(state);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load learning state.';
    res.status(500).json({ error: message });
  }
});

// Learning State: Update active mission position
app.put('/api/learning-state', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    // Whitelist client-modifiable fields; identity fields are never client-settable.
    const body = req.body ?? {};
    const allowed = [
      'currentRoadmapLevel',
      'currentLevelTitle',
      'currentProjectId',
      'currentProjectTitle',
      'currentTaskId',
      'currentTaskTitle',
      'currentTaskStatus',
      'currentObjective',
      'lastAssessmentSummary',
      'nextRecommendedTask'
    ] as const;
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) updates[key] = body[key];
    }
    const updated = await db.updateLearningState(req.user!.id, updates);
    res.json(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update learning state.';
    res.status(400).json({ error: message });
  }
});

// Roadmap & Curriculum
app.get('/api/roadmap', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const roadmap = await db.getRoadmap(req.user!.id);
    res.json(roadmap);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load roadmap.';
    res.status(500).json({ error: message });
  }
});

// Update Task Status
app.put('/api/tasks/:taskId/status', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { taskId } = req.params;
    const { status, notes } = req.body ?? {};
    const validStatuses: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED', 'FAILED', 'REQUIRES_PRACTICE'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: `Invalid task status: ${status}` });
      return;
    }

    const record = await db.setTaskStatus(req.user!.id, taskId, status, notes);
    const updatedState = await db.getLearningState(req.user!.id);
    res.json({ record, learningState: updatedState });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update task status.';
    res.status(500).json({ error: message });
  }
});

// Skills
app.get('/api/skills', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const skillsData = await db.getSkills(req.user!.id);
    res.json(skillsData);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load skills.';
    res.status(500).json({ error: message });
  }
});

app.put('/api/skills/:skillId', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { skillId } = req.params;
    const { level, notes } = req.body ?? {};
    const parsedLevel = Number(level);
    if (!Number.isFinite(parsedLevel) || parsedLevel < 0 || parsedLevel > 5) {
      res.status(400).json({ error: 'Skill level must be a number between 0 and 5.' });
      return;
    }
    const updated = await db.updateUserSkill(req.user!.id, skillId, parsedLevel, notes);
    res.json(updated);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update skill.';
    res.status(400).json({ error: message });
  }
});

// Assessments
app.get('/api/assessments', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const assessments = await db.getAssessments(req.user!.id);
    res.json(assessments);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load assessments.';
    res.status(500).json({ error: message });
  }
});

app.post('/api/assessments', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const {
      projectId,
      projectTitle,
      taskId,
      taskTitle,
      status,
      summary,
      strengths,
      weaknesses,
      mistakes,
      conceptsToPractice,
      recommendedNextTask,
      aiTeacherName,
      rawAssessmentText,
      notes,
      demonstratedSkills
    } = req.body ?? {};

    if (!summary || !status) {
      res.status(400).json({ error: 'Assessment summary and status are required.' });
      return;
    }

    const validAssessmentStatuses = ['FAILED', 'PARTIAL', 'PASSED'];
    if (!validAssessmentStatuses.includes(status)) {
      res.status(400).json({ error: `Invalid assessment status: ${status}` });
      return;
    }

    const assessment = await db.recordAssessment(req.user!.id, {
      projectId,
      projectTitle,
      taskId,
      taskTitle,
      status,
      summary,
      strengths: Array.isArray(strengths) ? strengths : [],
      weaknesses: Array.isArray(weaknesses) ? weaknesses : [],
      mistakes: Array.isArray(mistakes) ? mistakes : [],
      conceptsToPractice: Array.isArray(conceptsToPractice) ? conceptsToPractice : [],
      recommendedNextTask,
      aiTeacherName: aiTeacherName || 'External AI',
      rawAssessmentText,
      notes,
      demonstratedSkills: Array.isArray(demonstratedSkills) ? demonstratedSkills : []
    });

    res.status(201).json(assessment);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to record assessment.';
    res.status(400).json({ error: message });
  }
});

// Journal
app.get('/api/journal', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const entries = await db.getJournalEntries(req.user!.id);
    res.json(entries);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load journal entries.';
    res.status(500).json({ error: message });
  }
});

app.post('/api/journal', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { title, content, tags, projectId, projectTitle, taskId, taskTitle } = req.body ?? {};
    if (!title || !content) {
      res.status(400).json({ error: 'Journal title and content are required.' });
      return;
    }

    const entry = await db.addJournalEntry(req.user!.id, {
      title,
      content,
      tags: Array.isArray(tags) ? tags : [],
      projectId,
      projectTitle,
      taskId,
      taskTitle
    });
    res.status(201).json(entry);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to add journal entry.';
    res.status(400).json({ error: message });
  }
});

// Evidence
app.get('/api/evidence', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const evidences = await db.getEvidences(req.user!.id);
    res.json(evidences);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load evidence.';
    res.status(500).json({ error: message });
  }
});

app.post('/api/evidence', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { title, description, url, githubRepo, commitUrl, projectId, projectTitle, taskId, taskTitle } = req.body ?? {};
    if (!title) {
      res.status(400).json({ error: 'Evidence title is required.' });
      return;
    }

    const ev = await db.addEvidence(req.user!.id, {
      title,
      description,
      url,
      githubRepo,
      commitUrl,
      projectId,
      projectTitle,
      taskId,
      taskTitle
    });
    res.status(201).json(ev);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to add evidence.';
    res.status(400).json({ error: message });
  }
});

// AI Context Generator Output (Zero external API dependencies - Pure client/copy-ready Markdown)
app.get('/api/ai-context', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const contextOutput = await db.generateAIContext(req.user!.id);
    res.json(contextOutput);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to generate AI context.';
    res.status(500).json({ error: message });
  }
});

// Admin: User Management
app.get('/api/admin/users', requireAuth, requireAdmin, async (_req: AuthenticatedRequest, res) => {
  try {
    const users = await db.getAllUsers();
    res.json(users);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load users.';
    res.status(500).json({ error: message });
  }
});

// Admin: Database Maintenance — storage stats
app.get('/api/admin/database', requireAuth, requireAdmin, async (_req: AuthenticatedRequest, res) => {
  try {
    const stats = await db.getDatabaseStats();
    res.json(stats);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to collect database stats.';
    res.status(500).json({ error: message });
  }
});

// Admin: Database Maintenance — remove rows that belong to deleted users
app.post('/api/admin/database/cleanup', requireAuth, requireAdmin, async (_req: AuthenticatedRequest, res) => {
  try {
    const result = await db.cleanupOrphanedData();
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to clean up orphaned data.';
    res.status(500).json({ error: message });
  }
});

// Admin: Database Maintenance — wipe a user's learning data (keeps the account)
app.post('/api/admin/users/:userId/reset', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { userId } = req.params;
    if (!userId || !req.body?.confirm) {
      res.status(400).json({ error: 'A confirm flag is required to reset a user\'s progress.' });
      return;
    }
    const user = await db.getUserById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }
    const result = await db.resetUserData(userId);
    res.json({ message: `Progress for ${user.email} has been reset.`, ...result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to reset user progress.';
    res.status(500).json({ error: message });
  }
});

// Admin: Database Maintenance — delete a user account and all of its data
app.delete('/api/admin/users/:userId', requireAuth, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { userId } = req.params;
    if (!userId || !req.body?.confirm) {
      res.status(400).json({ error: 'A confirm flag is required to delete a user.' });
      return;
    }
    if (userId === req.user!.id) {
      res.status(400).json({ error: 'Administrators cannot delete their own account.' });
      return;
    }
    const user = await db.getUserById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }
    const result = await db.deleteUser(userId);
    res.json({ message: `Account ${user.email} and all of its data have been deleted.`, ...result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete user.';
    res.status(500).json({ error: message });
  }
});

// Progress Reset: Wipe the authenticated user's own learning data
app.delete('/api/progress', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.body?.confirm) {
      res.status(400).json({ error: 'A confirm flag is required to reset your progress.' });
      return;
    }
    const result = await db.resetUserData(req.user!.id);
    res.json({ message: 'All learning progress has been reset. You are starting from Level 0.', ...result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to reset progress.';
    res.status(500).json({ error: message });
  }
});

// Unknown API routes -> JSON 404 (must come after all API routes)
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'API endpoint not found.' });
});

// ---------------------------------------------
// Vite Middleware / Static Assets
// ---------------------------------------------

async function start() {
  // Wait for the data store before accepting traffic (Prisma mode retries).
  await waitForStore();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[DevOps Learning OS] Server active on http://0.0.0.0:${PORT} (store: ${db.kind})`);
  });

  // Graceful shutdown for Kubernetes / Docker (SIGTERM) and Ctrl+C (SIGINT)
  const shutdown = async (signal: string) => {
    console.log(`[DevOps Learning OS] ${signal} received, shutting down...`);
    server.close(async () => {
      try {
        await db.close();
      } catch {
        // ignore close errors
      }
      process.exit(0);
    });
    // Force exit if connections do not drain in time
    setTimeout(() => process.exit(0), 10_000).unref();
  };
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

async function waitForStore(attempts = 15, delayMs = 2000) {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      await db.healthCheck();
      console.log(`[DevOps Learning OS] Data store ready (mode: ${db.kind})`);
      return;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (attempt === attempts) {
        throw new Error(`Data store unreachable after ${attempts} attempts: ${message}`);
      }
      console.warn(`[DevOps Learning OS] Store not ready (attempt ${attempt}/${attempts}): ${message}`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}

start().catch((err) => {
  console.error('Fatal error starting Learning OS server:', err);
  process.exit(1);
});
