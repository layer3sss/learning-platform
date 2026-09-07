import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { INITIAL_SKILLS, INITIAL_ROADMAP } from './seedData.js';
import { buildAIContext } from './memoryStore.js';
import type {
  User,
  LearningState,
  UserSkill,
  Assessment,
  JournalEntry,
  Evidence
} from '../types.js';
import type {
  DataStore,
  UserRecord,
  UserProjectProgressRecord,
  UserTaskProgressRecord,
  SkillsPayload
} from './store-types.js';

const JWT_SECRET = process.env.AUTH_SECRET || 'devops-learning-os-secret-key-phase1';

function signToken(user: { id: string; email: string; role: string }): string {
  return jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

function toSafeUser(user: UserRecord): User {
  const { passwordHash: _ph, ...safeUser } = user;
  return safeUser;
}

interface PrismaUserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  learningPhilosophy: string;
  preferredMethod: string;
  createdAt: Date;
  updatedAt: Date;
  password: string;
}

function toUserRecord(u: PrismaUserRow): UserRecord {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role as User['role'],
    learningPhilosophy: u.learningPhilosophy,
    preferredMethod: u.preferredMethod,
    createdAt: u.createdAt.toISOString(),
    updatedAt: u.updatedAt.toISOString(),
    passwordHash: u.password
  };
}

function iso(value: Date | null | undefined): string | undefined {
  return value ? value.toISOString() : undefined;
}

const DEFAULT_LEARNING_PHILOSOPHY = 'Learn by building real systems, breaking things, troubleshooting, and mastering concepts through hands-on practice.';
const DEFAULT_PREFERRED_METHOD = 'Receive mission -> attempt task -> experiment/troubleshoot -> request AI hints if blocked -> submit work for assessment -> record outcome -> advance.';

/**
 * PostgreSQL-backed implementation of DataStore via Prisma.
 * Tables are auto-created (idempotent) on first use so `prisma migrate`
 * is not required for a homelab deployment.
 */
export class PrismaStore implements DataStore {
  readonly kind = 'postgres' as const;

  private prisma: PrismaClient;
  private ensured: Promise<void> | null = null;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Idempotent bootstrap: create tables if missing, seed demo users once.
   * Safe to call concurrently; the promise is cached.
   */
  private ensureReady(): Promise<void> {
    if (!this.ensured) {
      this.ensured = this.bootstrap();
    }
    return this.ensured;
  }

  private async bootstrap(): Promise<void> {
    await this.prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'USER',
      "learningPhilosophy" TEXT NOT NULL DEFAULT '${DEFAULT_LEARNING_PHILOSOPHY.replace(/'/g, "''")}',
      "preferredMethod" TEXT NOT NULL DEFAULT '${DEFAULT_PREFERRED_METHOD.replace(/'/g, "''")}',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
      "updatedAt" TIMESTAMP(3) NOT NULL
    )`);
    await this.prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS learning_states (
      id TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL UNIQUE,
      "currentRoadmapLevel" INTEGER NOT NULL DEFAULT 0,
      "currentLevelTitle" TEXT NOT NULL DEFAULT '',
      "currentProjectId" TEXT,
      "currentProjectTitle" TEXT,
      "currentTaskId" TEXT,
      "currentTaskTitle" TEXT,
      "currentTaskStatus" TEXT NOT NULL DEFAULT 'TODO',
      "currentObjective" TEXT NOT NULL DEFAULT '',
      "lastAssessmentSummary" TEXT,
      "nextRecommendedTask" TEXT,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT now()
    )`);
    await this.prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS user_skills (
      id TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "skillId" TEXT NOT NULL,
      "skillName" TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'General',
      level INTEGER NOT NULL DEFAULT 0,
      notes TEXT,
      "lastDemonstratedAt" TIMESTAMP(3),
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT now()
    )`);
    await this.prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS user_skills_user_skill ON user_skills ("userId", "skillId")`);
    await this.prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS user_task_progress (
      id TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "taskId" TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'TODO',
      notes TEXT,
      "completionDate" TIMESTAMP(3),
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT now()
    )`);
    await this.prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS user_task_progress_user_task ON user_task_progress ("userId", "taskId")`);
    await this.prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS user_project_progress (
      id TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "projectId" TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'NOT_STARTED',
      "startDate" TIMESTAMP(3),
      "completionDate" TIMESTAMP(3),
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT now()
    )`);
    await this.prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS user_project_progress_user_project ON user_project_progress ("userId", "projectId")`);
    await this.prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS assessments (
      id TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "projectId" TEXT,
      "projectTitle" TEXT,
      "taskId" TEXT,
      "taskTitle" TEXT,
      date TIMESTAMP(3) NOT NULL DEFAULT now(),
      status TEXT NOT NULL DEFAULT 'PASSED',
      summary TEXT NOT NULL,
      strengths TEXT[] NOT NULL DEFAULT '{}',
      weaknesses TEXT[] NOT NULL DEFAULT '{}',
      mistakes TEXT[] NOT NULL DEFAULT '{}',
      "conceptsToPractice" TEXT[] NOT NULL DEFAULT '{}',
      "recommendedNextTask" TEXT,
      "aiTeacherName" TEXT NOT NULL DEFAULT 'External AI',
      "rawAssessmentText" TEXT,
      notes TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT now()
    )`);
    await this.prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS journal_entries (
      id TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "projectId" TEXT,
      "projectTitle" TEXT,
      "taskId" TEXT,
      "taskTitle" TEXT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      tags TEXT[] NOT NULL DEFAULT '{}',
      date TIMESTAMP(3) NOT NULL DEFAULT now(),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT now()
    )`);
    await this.prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS evidences (
      id TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "projectId" TEXT,
      "projectTitle" TEXT,
      "taskId" TEXT,
      "taskTitle" TEXT,
      title TEXT NOT NULL,
      description TEXT,
      url TEXT,
      "githubRepo" TEXT,
      "commitUrl" TEXT,
      date TIMESTAMP(3) NOT NULL DEFAULT now(),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT now()
    )`);

    await this.seedDemoUsers();
  }

  private async seedDemoUsers() {
    const demoPassword = 'devops123';
    const passwordHash = bcrypt.hashSync(demoPassword, 10);
    const demoUsers = [
      {
        id: 'user-admin',
        name: 'Admin Architect',
        email: 'admin@devops-os.local',
        role: 'ADMIN',
        learningPhilosophy: 'Architect robust distributed systems through continuous practice and rigorous verification.',
        preferredMethod: 'Review architecture -> guide system breakdown -> inspect evidence and assessments.'
      },
      {
        id: 'user-learner',
        name: 'DevOps Engineer Learner',
        email: 'learner@devops-os.local',
        role: 'USER',
        learningPhilosophy: DEFAULT_LEARNING_PHILOSOPHY,
        preferredMethod: DEFAULT_PREFERRED_METHOD
      }
    ];

    for (const demo of demoUsers) {
      const existing = await this.prisma.user.findUnique({ where: { email: demo.email } });
      if (existing) continue;
      await this.prisma.user.create({
        data: { ...demo, password: passwordHash }
      });
      await this.initLearnerState(demo.id);
    }
  }

  private nextId(prefix: string): string {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }

  private async initLearnerState(userId: string) {
    const defaultLevel = INITIAL_ROADMAP[0];
    const defaultProject = defaultLevel.projects[0];
    const defaultTask = defaultProject.tasks[0];

    await this.prisma.learningState.create({
      data: {
        id: `state-${userId}`,
        userId,
        currentRoadmapLevel: 0,
        currentLevelTitle: defaultLevel.title,
        currentProjectId: defaultProject.id,
        currentProjectTitle: defaultProject.title,
        currentTaskId: defaultTask.id,
        currentTaskTitle: defaultTask.title,
        currentTaskStatus: 'IN_PROGRESS',
        currentObjective: defaultTask.objective,
        nextRecommendedTask: 'Generate ed25519 keypair and configure host aliasing in ~/.ssh/config'
      }
    });

    const initialUserSkills = [
      { skillId: 'skill-linux', skillName: 'Linux', category: 'OS & Systems', level: 2, notes: 'Comfortable with filesystem, bash navigation, and basic permissions' },
      { skillId: 'skill-bash', skillName: 'Bash Scripting', category: 'Automation', level: 1, notes: 'Can write simple scripts and use basic loops' },
      { skillId: 'skill-git', skillName: 'Git & Version Control', category: 'Collaboration', level: 2, notes: 'Understands staging, commits, branches, and remote push/pull' },
      { skillId: 'skill-networking', skillName: 'Networking Fundamentals', category: 'Networking', level: 1, notes: 'Basic grasp of IP addressing, DNS, and ports' },
      { skillId: 'skill-ssh', skillName: 'SSH & Remote Administration', category: 'Security & Access', level: 1, notes: 'Can connect with SSH' },
      { skillId: 'skill-docker', skillName: 'Docker & Containerization', category: 'Containers', level: 0, notes: 'Not yet started' },
      { skillId: 'skill-k8s', skillName: 'Kubernetes Core', category: 'Orchestration', level: 0, notes: 'Not yet started' }
    ];
    for (const [i, s] of initialUserSkills.entries()) {
      await this.prisma.userSkill.create({
        data: { id: `usk-${userId}-${i}`, userId, ...s }
      });
    }

    await this.prisma.userTaskProgress.create({
      data: {
        id: `utp-${userId}-${defaultTask.id}`,
        userId,
        taskId: defaultTask.id,
        status: 'IN_PROGRESS',
        notes: 'Setting up terminal profile and aliases'
      }
    });
    await this.prisma.userProjectProgress.create({
      data: {
        id: `upp-${userId}-${defaultProject.id}`,
        userId,
        projectId: defaultProject.id,
        status: 'IN_PROGRESS',
        startDate: new Date()
      }
    });

    await this.prisma.journalEntry.create({
      data: {
        id: `journal-${userId}-1`,
        userId,
        projectId: defaultProject.id,
        projectTitle: defaultProject.title,
        taskId: defaultTask.id,
        taskTitle: defaultTask.title,
        title: 'Starting DevOps Journey: Lab Setup',
        content: 'Configured my local zsh environment with git aliases and tested path exports. Encountered issue with permission denied on custom script until running chmod +x.',
        tags: ['linux', 'setup', 'bash'],
        date: new Date(Date.now() - 86400000)
      }
    });

    await this.prisma.evidence.create({
      data: {
        id: `ev-${userId}-1`,
        userId,
        projectId: defaultProject.id,
        projectTitle: defaultProject.title,
        taskId: defaultTask.id,
        taskTitle: defaultTask.title,
        title: 'Dotfiles & Shell Profile Config',
        description: 'Initial commit of .bashrc, .zshrc aliases, and gitconfig with GPG signing setup.',
        url: 'https://github.com/example/devops-lab-dotfiles',
        githubRepo: 'https://github.com/example/devops-lab-dotfiles',
        commitUrl: 'https://github.com/example/devops-lab-dotfiles/commit/8f2a1b9',
        date: new Date(Date.now() - 43200000)
      }
    });
  }

  // --- Auth ---
  public async register(name: string, email: string, password: string, role: string = 'USER'): Promise<{ user: User; token: string }> {
    await this.ensureReady();
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await this.prisma.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: 'insensitive' } }
    });
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const created = await this.prisma.user.create({
      data: {
        id: this.nextId('user'),
        name: name.trim(),
        email: normalizedEmail,
        password: passwordHash,
        role: role === 'ADMIN' ? 'ADMIN' : 'USER'
      }
    });

    await this.initLearnerState(created.id);
    const userRecord = toUserRecord(created);
    return { user: toSafeUser(userRecord), token: signToken(userRecord) };
  }

  public async login(email: string, password: string): Promise<{ user: User; token: string }> {
    await this.ensureReady();
    const normalizedEmail = email.trim().toLowerCase();
    const found = await this.prisma.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: 'insensitive' } }
    });
    if (!found) throw new Error('Invalid email or password.');

    const match = await bcrypt.compare(password, found.password);
    if (!match) throw new Error('Invalid email or password.');

    const userRecord = toUserRecord(found);
    return { user: toSafeUser(userRecord), token: signToken(userRecord) };
  }

  public async verifyToken(token: string): Promise<User> {
    let decoded: { userId: string };
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    } catch {
      throw new Error('Invalid or expired authentication token');
    }
    await this.ensureReady();
    const user = await this.prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) throw new Error('Invalid or expired authentication token');
    return toSafeUser(toUserRecord(user));
  }

  public async getUserById(id: string): Promise<User | undefined> {
    await this.ensureReady();
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return undefined;
    return toSafeUser(toUserRecord(user));
  }

  public async getAllUsers(): Promise<User[]> {
    await this.ensureReady();
    const users = await this.prisma.user.findMany({ orderBy: { createdAt: 'asc' } });
    return users.map(u => toSafeUser(toUserRecord(u)));
  }

  // --- Learning state ---
  public async getLearningState(userId: string): Promise<LearningState> {
    await this.ensureReady();
    let state = await this.prisma.learningState.findUnique({ where: { userId } });
    if (!state) {
      await this.initLearnerState(userId);
      state = (await this.prisma.learningState.findUnique({ where: { userId } }))!;
    }
    return {
      id: state.id,
      userId: state.userId,
      currentRoadmapLevel: state.currentRoadmapLevel,
      currentLevelTitle: state.currentLevelTitle,
      currentProjectId: state.currentProjectId ?? undefined,
      currentProjectTitle: state.currentProjectTitle ?? undefined,
      currentTaskId: state.currentTaskId ?? undefined,
      currentTaskTitle: state.currentTaskTitle ?? undefined,
      currentTaskStatus: state.currentTaskStatus as LearningState['currentTaskStatus'],
      currentObjective: state.currentObjective,
      lastAssessmentSummary: state.lastAssessmentSummary ?? undefined,
      nextRecommendedTask: state.nextRecommendedTask ?? undefined,
      updatedAt: state.updatedAt.toISOString()
    };
  }

  public async updateLearningState(userId: string, updates: Partial<LearningState>): Promise<LearningState> {
    await this.getLearningState(userId); // ensures row exists
    const updated = await this.prisma.learningState.update({
      where: { userId },
      data: {
        currentRoadmapLevel: updates.currentRoadmapLevel,
        currentLevelTitle: updates.currentLevelTitle,
        currentProjectId: updates.currentProjectId,
        currentProjectTitle: updates.currentProjectTitle,
        currentTaskId: updates.currentTaskId,
        currentTaskTitle: updates.currentTaskTitle,
        currentTaskStatus: updates.currentTaskStatus,
        currentObjective: updates.currentObjective,
        lastAssessmentSummary: updates.lastAssessmentSummary,
        nextRecommendedTask: updates.nextRecommendedTask
      }
    });
    return {
      id: updated.id,
      userId: updated.userId,
      currentRoadmapLevel: updated.currentRoadmapLevel,
      currentLevelTitle: updated.currentLevelTitle,
      currentProjectId: updated.currentProjectId ?? undefined,
      currentProjectTitle: updated.currentProjectTitle ?? undefined,
      currentTaskId: updated.currentTaskId ?? undefined,
      currentTaskTitle: updated.currentTaskTitle ?? undefined,
      currentTaskStatus: updated.currentTaskStatus as LearningState['currentTaskStatus'],
      currentObjective: updated.currentObjective,
      lastAssessmentSummary: updated.lastAssessmentSummary ?? undefined,
      nextRecommendedTask: updated.nextRecommendedTask ?? undefined,
      updatedAt: updated.updatedAt.toISOString()
    };
  }

  // --- Roadmap ---
  public async getRoadmap(userId: string) {
    await this.ensureReady();
    const taskProgress = await this.prisma.userTaskProgress.findMany({ where: { userId } });
    const projectProgress = await this.prisma.userProjectProgress.findMany({ where: { userId } });
    const userTaskProgress = new Map(taskProgress.map(p => [p.taskId, p]));
    const userProjProgress = new Map(projectProgress.map(p => [p.projectId, p]));

    return INITIAL_ROADMAP.map(level => {
      const projects = level.projects.map(proj => {
        const projProg = userProjProgress.get(proj.id);
        const tasks = proj.tasks.map(task => {
          const taskProg = userTaskProgress.get(task.id);
          return {
            ...task,
            userStatus: taskProg ? taskProg.status : ('TODO' as const),
            userNotes: taskProg?.notes ?? undefined
          };
        });

        const completedCount = tasks.filter(t => t.userStatus === 'COMPLETED').length;
        const totalCount = tasks.length;
        const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        return {
          ...proj,
          levelNumber: level.levelNumber,
          userStatus: projProg ? projProg.status : ('NOT_STARTED' as const),
          userProgressPercent: progressPercent,
          tasks
        };
      });

      return { ...level, projects };
    });
  }

  // --- Task status ---
  public async setTaskStatus(userId: string, taskId: string, status: string, notes?: string): Promise<UserTaskProgressRecord> {
    await this.ensureReady();
    const existing = await this.prisma.userTaskProgress.findUnique({
      where: { userId_taskId: { userId, taskId } }
    });

    const data = {
      status,
      notes: notes !== undefined ? notes : (existing?.notes ?? ''),
      completionDate: status === 'COMPLETED' ? new Date() : null
    };

    const saved = existing
      ? await this.prisma.userTaskProgress.update({
          where: { userId_taskId: { userId, taskId } },
          data
        })
      : await this.prisma.userTaskProgress.create({
          data: { id: this.nextId('utp'), userId, taskId, ...data }
        });

    const state = await this.getLearningState(userId);
    if (state.currentTaskId === taskId) {
      await this.updateLearningState(userId, { currentTaskStatus: status as LearningState['currentTaskStatus'] });
    }

    return {
      userId: saved.userId,
      taskId: saved.taskId,
      status: saved.status,
      notes: saved.notes ?? undefined,
      completionDate: iso(saved.completionDate)
    };
  }

  // --- Skills ---
  public async getSkills(userId: string): Promise<SkillsPayload> {
    await this.ensureReady();
    const rows = await this.prisma.userSkill.findMany({ where: { userId }, orderBy: { updatedAt: 'asc' } });
    const userSkills: UserSkill[] = rows.map(r => ({
      id: r.id,
      userId: r.userId,
      skillId: r.skillId,
      skillName: r.skillName,
      category: r.category,
      level: r.level,
      notes: r.notes ?? undefined,
      lastDemonstratedAt: iso(r.lastDemonstratedAt)
    }));
    return { allSkills: INITIAL_SKILLS, userSkills };
  }

  public async updateUserSkill(userId: string, skillId: string, level: number, notes?: string): Promise<UserSkill> {
    await this.ensureReady();
    const meta = INITIAL_SKILLS.find(s => s.id === skillId);
    const clampedLevel = Math.min(Math.max(Math.round(level) || 0, 0), 5);
    const existing = await this.prisma.userSkill.findUnique({
      where: { userId_skillId: { userId, skillId } }
    });

    const data = {
      skillName: meta?.name || skillId,
      category: meta?.category || 'General',
      level: clampedLevel,
      notes,
      lastDemonstratedAt: new Date()
    };

    const saved = existing
      ? await this.prisma.userSkill.update({
          where: { userId_skillId: { userId, skillId } },
          data
        })
      : await this.prisma.userSkill.create({
          data: { id: this.nextId('usk'), userId, skillId, ...data }
        });

    return {
      id: saved.id,
      userId: saved.userId,
      skillId: saved.skillId,
      skillName: saved.skillName,
      category: saved.category,
      level: saved.level,
      notes: saved.notes ?? undefined,
      lastDemonstratedAt: iso(saved.lastDemonstratedAt)
    };
  }

  // --- Assessments ---
  public async getAssessments(userId: string): Promise<Assessment[]> {
    await this.ensureReady();
    const rows = await this.prisma.assessment.findMany({ where: { userId }, orderBy: { date: 'desc' } });
    return rows.map(r => ({
      id: r.id,
      userId: r.userId,
      projectId: r.projectId ?? undefined,
      projectTitle: r.projectTitle ?? undefined,
      taskId: r.taskId ?? undefined,
      taskTitle: r.taskTitle ?? undefined,
      date: r.date.toISOString(),
      status: r.status as Assessment['status'],
      summary: r.summary,
      strengths: r.strengths,
      weaknesses: r.weaknesses,
      mistakes: r.mistakes,
      conceptsToPractice: r.conceptsToPractice,
      recommendedNextTask: r.recommendedNextTask ?? undefined,
      aiTeacherName: r.aiTeacherName,
      rawAssessmentText: r.rawAssessmentText ?? undefined,
      notes: r.notes ?? undefined,
      demonstratedSkills: []
    }));
  }

  public async recordAssessment(userId: string, data: Omit<Assessment, 'id' | 'userId' | 'date'>): Promise<Assessment> {
    await this.ensureReady();
    const created = await this.prisma.assessment.create({
      data: {
        id: this.nextId('assess'),
        userId,
        projectId: data.projectId,
        projectTitle: data.projectTitle,
        taskId: data.taskId,
        taskTitle: data.taskTitle,
        status: data.status,
        summary: data.summary,
        strengths: data.strengths || [],
        weaknesses: data.weaknesses || [],
        mistakes: data.mistakes || [],
        conceptsToPractice: data.conceptsToPractice || [],
        recommendedNextTask: data.recommendedNextTask,
        aiTeacherName: data.aiTeacherName || 'External AI',
        rawAssessmentText: data.rawAssessmentText,
        notes: data.notes
      }
    });

    if (data.demonstratedSkills && Array.isArray(data.demonstratedSkills)) {
      for (const ds of data.demonstratedSkills) {
        await this.updateUserSkill(userId, ds.skillId, ds.demonstratedLevel, `Demonstrated during ${data.taskTitle || 'assessment'}`);
      }
    }

    await this.updateLearningState(userId, {
      lastAssessmentSummary: `${data.status}: ${data.summary}`,
      nextRecommendedTask: data.recommendedNextTask || undefined,
      currentTaskStatus: data.status === 'PASSED' ? 'COMPLETED' : (data.status === 'PARTIAL' ? 'REQUIRES_PRACTICE' : 'FAILED')
    });

    return {
      id: created.id,
      userId: created.userId,
      projectId: created.projectId ?? undefined,
      projectTitle: created.projectTitle ?? undefined,
      taskId: created.taskId ?? undefined,
      taskTitle: created.taskTitle ?? undefined,
      date: created.date.toISOString(),
      status: created.status as Assessment['status'],
      summary: created.summary,
      strengths: created.strengths,
      weaknesses: created.weaknesses,
      mistakes: created.mistakes,
      conceptsToPractice: created.conceptsToPractice,
      recommendedNextTask: created.recommendedNextTask ?? undefined,
      aiTeacherName: created.aiTeacherName,
      rawAssessmentText: created.rawAssessmentText ?? undefined,
      notes: created.notes ?? undefined,
      demonstratedSkills: data.demonstratedSkills || []
    };
  }

  // --- Journal ---
  public async getJournalEntries(userId: string): Promise<JournalEntry[]> {
    await this.ensureReady();
    const rows = await this.prisma.journalEntry.findMany({ where: { userId }, orderBy: { date: 'desc' } });
    return rows.map(r => ({
      id: r.id,
      userId: r.userId,
      projectId: r.projectId ?? undefined,
      projectTitle: r.projectTitle ?? undefined,
      taskId: r.taskId ?? undefined,
      taskTitle: r.taskTitle ?? undefined,
      title: r.title,
      content: r.content,
      tags: r.tags,
      date: r.date.toISOString()
    }));
  }

  public async addJournalEntry(userId: string, entry: Omit<JournalEntry, 'id' | 'userId' | 'date'>): Promise<JournalEntry> {
    await this.ensureReady();
    const created = await this.prisma.journalEntry.create({
      data: {
        id: this.nextId('journal'),
        userId,
        projectId: entry.projectId,
        projectTitle: entry.projectTitle,
        taskId: entry.taskId,
        taskTitle: entry.taskTitle,
        title: entry.title,
        content: entry.content,
        tags: entry.tags || [],
        date: new Date()
      }
    });
    return {
      id: created.id,
      userId: created.userId,
      projectId: created.projectId ?? undefined,
      projectTitle: created.projectTitle ?? undefined,
      taskId: created.taskId ?? undefined,
      taskTitle: created.taskTitle ?? undefined,
      title: created.title,
      content: created.content,
      tags: created.tags,
      date: created.date.toISOString()
    };
  }

  // --- Evidence ---
  public async getEvidences(userId: string): Promise<Evidence[]> {
    await this.ensureReady();
    const rows = await this.prisma.evidence.findMany({ where: { userId }, orderBy: { date: 'desc' } });
    return rows.map(r => ({
      id: r.id,
      userId: r.userId,
      projectId: r.projectId ?? undefined,
      projectTitle: r.projectTitle ?? undefined,
      taskId: r.taskId ?? undefined,
      taskTitle: r.taskTitle ?? undefined,
      title: r.title,
      description: r.description ?? undefined,
      url: r.url ?? undefined,
      githubRepo: r.githubRepo ?? undefined,
      commitUrl: r.commitUrl ?? undefined,
      date: r.date.toISOString()
    }));
  }

  public async addEvidence(userId: string, evidence: Omit<Evidence, 'id' | 'userId' | 'date'>): Promise<Evidence> {
    await this.ensureReady();
    const created = await this.prisma.evidence.create({
      data: {
        id: this.nextId('ev'),
        userId,
        projectId: evidence.projectId,
        projectTitle: evidence.projectTitle,
        taskId: evidence.taskId,
        taskTitle: evidence.taskTitle,
        title: evidence.title,
        description: evidence.description,
        url: evidence.url,
        githubRepo: evidence.githubRepo,
        commitUrl: evidence.commitUrl,
        date: new Date()
      }
    });
    return {
      id: created.id,
      userId: created.userId,
      projectId: created.projectId ?? undefined,
      projectTitle: created.projectTitle ?? undefined,
      taskId: created.taskId ?? undefined,
      taskTitle: created.taskTitle ?? undefined,
      title: created.title,
      description: created.description ?? undefined,
      url: created.url ?? undefined,
      githubRepo: created.githubRepo ?? undefined,
      commitUrl: created.commitUrl ?? undefined,
      date: created.date.toISOString()
    };
  }

  // --- AI context ---
  public async generateAIContext(userId: string) {
    await this.ensureReady();
    return buildAIContext({
      user: await this.getUserById(userId),
      state: await this.getLearningState(userId),
      skills: (await this.getSkills(userId)).userSkills,
      assessments: await this.getAssessments(userId),
      journals: (await this.getJournalEntries(userId)).slice(0, 3),
      evidences: (await this.getEvidences(userId)).slice(0, 3)
    });
  }

  // --- Lifecycle ---
  public async healthCheck(): Promise<void> {
    await this.ensureReady();
    await this.prisma.$queryRaw`SELECT 1`;
  }

  public async close(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
