import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { INITIAL_SKILLS, INITIAL_ROADMAP } from './seedData.js';
import type {
  User,
  LearningState,
  UserSkill,
  Assessment,
  JournalEntry,
  Evidence,
  DatabaseStats,
  OrphanCleanupResult,
  ResetResult,
  UserStorageStat
} from '../types.js';
import type {
  DataStore,
  UserRecord,
  UserProjectProgressRecord,
  UserTaskProgressRecord,
  SkillsPayload
} from './store-types.js';

const JWT_SECRET = process.env.AUTH_SECRET || 'devops-learning-os-secret-key-phase1';

function signToken(user: UserRecord): string {
  return jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

function toSafeUser(user: UserRecord): User {
  const { passwordHash: _ph, ...safeUser } = user;
  return safeUser;
}

/**
 * In-memory implementation of DataStore.
 * Used when DATABASE_URL is not configured (zero-friction local dev / preview).
 * All data is lost on process restart.
 */
export class MemoryStore implements DataStore {
  readonly kind = 'memory' as const;

  private users: Map<string, UserRecord> = new Map();
  private learningStates: Map<string, LearningState> = new Map();
  private userSkills: Map<string, UserSkill[]> = new Map();
  private userProjects: Map<string, UserProjectProgressRecord[]> = new Map();
  private userTasks: Map<string, UserTaskProgressRecord[]> = new Map();
  private assessments: Map<string, Assessment[]> = new Map();
  private journalEntries: Map<string, JournalEntry[]> = new Map();
  private evidences: Map<string, Evidence[]> = new Map();
  private idCounter = 0;

  constructor() {
    this.seedDefaults();
  }

  private nextId(prefix: string): string {
    this.idCounter += 1;
    return `${prefix}-${Date.now().toString(36)}-${this.idCounter}-${Math.random().toString(36).slice(2, 8)}`;
  }

  private seedDefaults() {
    const seedUser = (partial: Omit<UserRecord, 'passwordHash'>): UserRecord => ({
      ...partial,
      passwordHash: bcrypt.hashSync('devops123', 10)
    });

    const adminUser = seedUser({
      id: 'user-admin',
      name: 'Admin Architect',
      email: 'admin@devops-os.local',
      role: 'ADMIN',
      learningPhilosophy: 'Architect robust distributed systems through continuous practice and rigorous verification.',
      preferredMethod: 'Review architecture -> guide system breakdown -> inspect evidence and assessments.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    this.users.set(adminUser.id, adminUser);

    const learnerUser = seedUser({
      id: 'user-learner',
      name: 'DevOps Engineer Learner',
      email: 'learner@devops-os.local',
      role: 'USER',
      learningPhilosophy: 'Learn by building real systems, breaking things, troubleshooting, and mastering concepts through hands-on practice.',
      preferredMethod: 'Receive mission -> attempt task -> experiment/troubleshoot -> request AI hints if blocked -> submit work for assessment -> record outcome -> advance.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    this.users.set(learnerUser.id, learnerUser);

    this.initLearnerState(learnerUser.id);
  }

  private initLearnerState(userId: string) {
    const defaultLevel = INITIAL_ROADMAP[0];
    const defaultProject = defaultLevel.projects[0];
    const defaultTask = defaultProject.tasks[0];

    const state: LearningState = {
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
      nextRecommendedTask: 'Generate ed25519 keypair and configure host aliasing in ~/.ssh/config',
      updatedAt: new Date().toISOString()
    };
    this.learningStates.set(userId, state);

    const initialUserSkills: UserSkill[] = [
      { id: `usk-${userId}-linux`, userId, skillId: 'skill-linux', skillName: 'Linux', category: 'OS & Systems', level: 2, notes: 'Comfortable with filesystem, bash navigation, and basic permissions' },
      { id: `usk-${userId}-bash`, userId, skillId: 'skill-bash', skillName: 'Bash Scripting', category: 'Automation', level: 1, notes: 'Can write simple scripts and use basic loops' },
      { id: `usk-${userId}-git`, userId, skillId: 'skill-git', skillName: 'Git & Version Control', category: 'Collaboration', level: 2, notes: 'Understands staging, commits, branches, and remote push/pull' },
      { id: `usk-${userId}-networking`, userId, skillId: 'skill-networking', skillName: 'Networking Fundamentals', category: 'Networking', level: 1, notes: 'Basic grasp of IP addressing, DNS, and ports' },
      { id: `usk-${userId}-ssh`, userId, skillId: 'skill-ssh', skillName: 'SSH & Remote Administration', category: 'Security & Access', level: 1, notes: 'Can connect with SSH' },
      { id: `usk-${userId}-docker`, userId, skillId: 'skill-docker', skillName: 'Docker & Containerization', category: 'Containers', level: 0, notes: 'Not yet started' },
      { id: `usk-${userId}-k8s`, userId, skillId: 'skill-k8s', skillName: 'Kubernetes Core', category: 'Orchestration', level: 0, notes: 'Not yet started' }
    ];
    this.userSkills.set(userId, initialUserSkills);

    this.userTasks.set(userId, [
      { userId, taskId: defaultTask.id, status: 'IN_PROGRESS', notes: 'Setting up terminal profile and aliases' }
    ]);
    this.userProjects.set(userId, [
      { userId, projectId: defaultProject.id, status: 'IN_PROGRESS', startDate: new Date().toISOString() }
    ]);

    this.journalEntries.set(userId, [
      {
        id: `journal-${userId}-1`,
        userId,
        projectId: defaultProject.id,
        projectTitle: defaultProject.title,
        taskId: defaultTask.id,
        taskTitle: defaultTask.title,
        title: 'Starting DevOps Journey: Lab Setup',
        content: 'Configured my local zsh environment with git aliases and tested path exports. Encountered issue with permission denied on custom script until running chmod +x.',
        tags: ['linux', 'setup', 'bash'],
        date: new Date(Date.now() - 86400000).toISOString()
      }
    ]);

    this.evidences.set(userId, [
      {
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
        date: new Date(Date.now() - 43200000).toISOString()
      }
    ]);
  }

  // --- Auth ---
  public async register(name: string, email: string, password: string, role: string = 'USER'): Promise<{ user: User; token: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    for (const u of this.users.values()) {
      if (u.email.toLowerCase() === normalizedEmail) {
        throw new Error('An account with this email address already exists.');
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser: UserRecord = {
      id: this.nextId('user'),
      name: name.trim(),
      email: normalizedEmail,
      role: role === 'ADMIN' ? 'ADMIN' : 'USER',
      learningPhilosophy: 'Learn by building real systems, breaking things, troubleshooting, and mastering concepts through hands-on practice.',
      preferredMethod: 'Receive mission -> attempt task -> experiment/troubleshoot -> request AI hints if blocked -> submit work for assessment -> record outcome -> advance.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      passwordHash
    };

    this.users.set(newUser.id, newUser);
    this.initLearnerState(newUser.id);
    return { user: toSafeUser(newUser), token: signToken(newUser) };
  }

  public async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    let found: UserRecord | undefined;
    for (const u of this.users.values()) {
      if (u.email.toLowerCase() === normalizedEmail) {
        found = u;
        break;
      }
    }
    if (!found) throw new Error('Invalid email or password.');

    const match = await bcrypt.compare(password, found.passwordHash);
    if (!match) throw new Error('Invalid email or password.');

    return { user: toSafeUser(found), token: signToken(found) };
  }

  public async verifyToken(token: string): Promise<User> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const user = this.users.get(decoded.userId);
      if (!user) throw new Error('User not found');
      return toSafeUser(user);
    } catch {
      throw new Error('Invalid or expired authentication token');
    }
  }

  public async getUserById(id: string): Promise<User | undefined> {
    const user = this.users.get(id);
    return user ? toSafeUser(user) : undefined;
  }

  public async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values()).map(toSafeUser);
  }

  // --- Learning state ---
  public async getLearningState(userId: string): Promise<LearningState> {
    let state = this.learningStates.get(userId);
    if (!state) {
      this.initLearnerState(userId);
      state = this.learningStates.get(userId)!;
    }
    return state;
  }

  public async updateLearningState(userId: string, updates: Partial<LearningState>): Promise<LearningState> {
    const current = await this.getLearningState(userId);
    const updated: LearningState = {
      ...current,
      ...updates,
      id: current.id,
      userId: current.userId,
      updatedAt: new Date().toISOString()
    };
    this.learningStates.set(userId, updated);
    return updated;
  }

  // --- Roadmap ---
  public async getRoadmap(userId: string) {
    const userTaskProgress = new Map((this.userTasks.get(userId) || []).map(p => [p.taskId, p]));
    const userProjProgress = new Map((this.userProjects.get(userId) || []).map(p => [p.projectId, p]));

    return INITIAL_ROADMAP.map(level => {
      const projects = level.projects.map(proj => {
        const projProg = userProjProgress.get(proj.id);
        const tasks = proj.tasks.map(task => {
          const taskProg = userTaskProgress.get(task.id);
          return {
            ...task,
            userStatus: taskProg ? taskProg.status : ('TODO' as const),
            userNotes: taskProg?.notes
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
    let list = this.userTasks.get(userId) || [];
    const existingIndex = list.findIndex(item => item.taskId === taskId);
    const record: UserTaskProgressRecord = {
      userId,
      taskId,
      status,
      notes: notes !== undefined ? notes : (existingIndex >= 0 ? list[existingIndex].notes : ''),
      completionDate: status === 'COMPLETED' ? new Date().toISOString() : undefined
    };

    if (existingIndex >= 0) {
      list[existingIndex] = record;
    } else {
      list.push(record);
    }
    this.userTasks.set(userId, list);

    const state = await this.getLearningState(userId);
    if (state.currentTaskId === taskId) {
      await this.updateLearningState(userId, { currentTaskStatus: status as LearningState['currentTaskStatus'] });
    }
    return record;
  }

  // --- Skills ---
  public async getSkills(userId: string): Promise<SkillsPayload> {
    return {
      allSkills: INITIAL_SKILLS,
      userSkills: this.userSkills.get(userId) || []
    };
  }

  public async updateUserSkill(userId: string, skillId: string, level: number, notes?: string): Promise<UserSkill> {
    let list = this.userSkills.get(userId) || [];
    const meta = INITIAL_SKILLS.find(s => s.id === skillId);
    const existingIndex = list.findIndex(s => s.skillId === skillId);

    const record: UserSkill = {
      id: existingIndex >= 0 ? list[existingIndex].id : `usk-${userId}-${skillId}`,
      userId,
      skillId,
      skillName: meta?.name || skillId,
      category: meta?.category || 'General',
      level: Math.min(Math.max(Math.round(level), 0), 5),
      notes,
      lastDemonstratedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      list[existingIndex] = record;
    } else {
      list.push(record);
    }
    this.userSkills.set(userId, list);
    return record;
  }

  // --- Assessments ---
  public async getAssessments(userId: string): Promise<Assessment[]> {
    return this.assessments.get(userId) || [];
  }

  public async recordAssessment(userId: string, data: Omit<Assessment, 'id' | 'userId' | 'date'>): Promise<Assessment> {
    const newAssessment: Assessment = {
      id: this.nextId('assess'),
      userId,
      date: new Date().toISOString(),
      ...data
    };

    const list = this.assessments.get(userId) || [];
    list.unshift(newAssessment);
    this.assessments.set(userId, list);

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

    return newAssessment;
  }

  // --- Journal ---
  public async getJournalEntries(userId: string): Promise<JournalEntry[]> {
    return this.journalEntries.get(userId) || [];
  }

  public async addJournalEntry(userId: string, entry: Omit<JournalEntry, 'id' | 'userId' | 'date'>): Promise<JournalEntry> {
    const newEntry: JournalEntry = {
      id: this.nextId('journal'),
      userId,
      date: new Date().toISOString(),
      ...entry
    };
    const list = this.journalEntries.get(userId) || [];
    list.unshift(newEntry);
    this.journalEntries.set(userId, list);
    return newEntry;
  }

  // --- Evidence ---
  public async getEvidences(userId: string): Promise<Evidence[]> {
    return this.evidences.get(userId) || [];
  }

  public async addEvidence(userId: string, evidence: Omit<Evidence, 'id' | 'userId' | 'date'>): Promise<Evidence> {
    const newEv: Evidence = {
      id: this.nextId('ev'),
      userId,
      date: new Date().toISOString(),
      ...evidence
    };
    const list = this.evidences.get(userId) || [];
    list.unshift(newEv);
    this.evidences.set(userId, list);
    return newEv;
  }

  // --- AI context ---
  public async generateAIContext(userId: string) {
    return buildAIContext({
      user: await this.getUserById(userId),
      state: await this.getLearningState(userId),
      skills: this.userSkills.get(userId) || [],
      assessments: await this.getAssessments(userId),
      journals: (await this.getJournalEntries(userId)).slice(0, 3),
      evidences: (await this.getEvidences(userId)).slice(0, 3)
    });
  }

  // --- Progress reset & maintenance ---
  private countUserData(userId: string): ResetResult['deleted'] {
    return {
      learningState: this.learningStates.has(userId) ? 1 : 0,
      skills: (this.userSkills.get(userId) || []).length,
      taskProgress: (this.userTasks.get(userId) || []).length,
      projectProgress: (this.userProjects.get(userId) || []).length,
      assessments: (this.assessments.get(userId) || []).length,
      journalEntries: (this.journalEntries.get(userId) || []).length,
      evidences: (this.evidences.get(userId) || []).length
    };
  }

  public async resetUserData(userId: string): Promise<ResetResult> {
    const deleted = this.countUserData(userId);

    this.learningStates.delete(userId);
    this.userSkills.delete(userId);
    this.userTasks.delete(userId);
    this.userProjects.delete(userId);
    this.assessments.delete(userId);
    this.journalEntries.delete(userId);
    this.evidences.delete(userId);

    // Re-initialize so the user lands in the same fresh state as a new registration.
    this.initLearnerState(userId);

    return { deleted };
  }

  public async deleteUser(userId: string): Promise<ResetResult> {
    const deleted = this.countUserData(userId);

    // Wipe everything directly (no re-seed — resetUserData would otherwise
    // recreate rows that would end up orphaned once the user row is gone).
    this.learningStates.delete(userId);
    this.userSkills.delete(userId);
    this.userTasks.delete(userId);
    this.userProjects.delete(userId);
    this.assessments.delete(userId);
    this.journalEntries.delete(userId);
    this.evidences.delete(userId);
    this.users.delete(userId);

    return { deleted: { ...deleted, user: 1 } };
  }

  public async getDatabaseStats(): Promise<DatabaseStats> {
    const now = new Date().toISOString();
    const users = Array.from(this.users.values());

    const tables: DatabaseStats['tables'] = [
      { name: 'users', rowCount: users.length, sizeBytes: users.length * 512 },
      { name: 'learning_states', rowCount: this.learningStates.size, sizeBytes: this.learningStates.size * 1024 },
      { name: 'user_skills', rowCount: countMapRows(this.userSkills), sizeBytes: countMapRows(this.userSkills) * 256 },
      { name: 'user_task_progress', rowCount: countMapRows(this.userTasks), sizeBytes: countMapRows(this.userTasks) * 256 },
      { name: 'user_project_progress', rowCount: countMapRows(this.userProjects), sizeBytes: countMapRows(this.userProjects) * 256 },
      { name: 'assessments', rowCount: countMapRows(this.assessments), sizeBytes: countMapRows(this.assessments) * 2048 },
      { name: 'journal_entries', rowCount: countMapRows(this.journalEntries), sizeBytes: countMapRows(this.journalEntries) * 1024 },
      { name: 'evidences', rowCount: countMapRows(this.evidences), sizeBytes: countMapRows(this.evidences) * 1024 }
    ];

    const userStats: UserStorageStat[] = users.map(u => {
      const breakdown = {
        skills: (this.userSkills.get(u.id) || []).length,
        taskProgress: (this.userTasks.get(u.id) || []).length,
        projectProgress: (this.userProjects.get(u.id) || []).length,
        assessments: (this.assessments.get(u.id) || []).length,
        journalEntries: (this.journalEntries.get(u.id) || []).length,
        evidences: (this.evidences.get(u.id) || []).length
      };
      const totalRows = Object.values(breakdown).reduce((a, b) => a + b, 0) + (this.learningStates.has(u.id) ? 1 : 0);
      const timestamps = [
        ...(this.userSkills.get(u.id) || []).map(s => s.lastDemonstratedAt),
        ...(this.assessments.get(u.id) || []).map(a => a.date),
        ...(this.journalEntries.get(u.id) || []).map(j => j.date),
        ...(this.evidences.get(u.id) || []).map(e => e.date),
        this.learningStates.get(u.id)?.updatedAt
      ].filter((t): t is string => typeof t === 'string');
      const lastActivity = timestamps.length > 0
        ? timestamps.reduce((latest, t) => (t > latest ? t : latest))
        : undefined;
      return {
        userId: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
        lastActivity,
        totalRows,
        breakdown
      };
    });

    const totalRows = tables.reduce((sum, t) => sum + t.rowCount, 0);
    return {
      provider: 'memory',
      totalSizeBytes: tables.reduce((sum, t) => sum + t.sizeBytes, 0),
      totalRows,
      totalUsers: users.length,
      tables,
      users: userStats,
      checkedAt: now
    };
  }

  public async cleanupOrphanedData(): Promise<OrphanCleanupResult> {
    const tables: [string, Map<string, unknown[]>][] = [
      ['user_skills', this.userSkills],
      ['user_task_progress', this.userTasks],
      ['user_project_progress', this.userProjects],
      ['assessments', this.assessments],
      ['journal_entries', this.journalEntries],
      ['evidences', this.evidences]
    ];

    const deletedRows: Record<string, number> = {};
    const orphanedUsers = new Set<string>();
    let totalDeleted = 0;

    for (const [name, map] of tables) {
      let removed = 0;
      for (const userId of Array.from(map.keys())) {
        if (!this.users.has(userId)) {
          removed += (map.get(userId) || []).length;
          map.delete(userId);
          orphanedUsers.add(userId);
        }
      }
      if (removed > 0) deletedRows[name] = removed;
      totalDeleted += removed;
    }

    // Learning states are keyed by userId directly.
    for (const userId of Array.from(this.learningStates.keys())) {
      if (!this.users.has(userId)) {
        this.learningStates.delete(userId);
        orphanedUsers.add(userId);
        deletedRows['learning_states'] = (deletedRows['learning_states'] || 0) + 1;
        totalDeleted += 1;
      }
    }

    return {
      provider: 'memory',
      orphanedUsersFound: orphanedUsers.size,
      deletedRows,
      totalDeleted
    };
  }

  // --- Lifecycle ---
  public async healthCheck(): Promise<void> {
    // In-memory store is always "healthy".
  }

  public async close(): Promise<void> {
    // Nothing to release.
  }
}

/** Per-user row counts helper for Map<string, T[]> structures. */
function countMapRows<T>(map: Map<string, T[]>): number {
  let total = 0;
  for (const list of map.values()) total += list.length;
  return total;
}

/**
 * Shared AI-context markdown builder used by both stores.
 */
export function buildAIContext(input: {
  user?: User;
  state: LearningState;
  skills: UserSkill[];
  assessments: Assessment[];
  journals: JournalEntry[];
  evidences: Evidence[];
}) {
  const { user, state, skills, assessments, journals, evidences } = input;

  const demonstratedSkills = skills
    .filter(s => s.level > 0)
    .map(s => ({ name: s.skillName, level: s.level }));

  const recentAssessments = assessments.slice(0, 2).map(a => `[${a.status}] ${a.summary} (Next: ${a.recommendedNextTask || 'N/A'})`);

  const instructionsForAI = `You are the learner's technical mentor, senior DevOps staff engineer, and assessment evaluator.
The learner learns by building real systems, breaking things, and troubleshooting.
Rules:
1. Do NOT immediately hand over full scripts or answers.
2. First let the learner attempt the command or configuration themselves.
3. Provide progressive hints, diagnostic commands, and architectural reasoning.
4. Explain why configurations work after the learner attempts them.
5. Ask targeted troubleshooting questions (e.g., inspecting logs, permissions, status codes).
6. When the learner shares work/output for evaluation, return a structured assessment containing:
   - Status: PASSED, PARTIAL, or FAILED
   - Summary of performance
   - Strengths demonstrated
   - Mistakes/misunderstandings identified
   - Concepts needing practice
   - Recommended next task to tackle`;

  const markdown = `# DevOps Learning OS — Context Export
Generated for: **${user?.name || 'Learner'}** (${user?.email || 'N/A'})
Generated on: ${new Date().toUTCString()}

---

## 1. Learner Profile & Philosophy
- **Name:** ${user?.name}
- **Learning Philosophy:** ${user?.learningPhilosophy}
- **Method:** ${user?.preferredMethod}

## 2. Current Learning State (Source of Truth)
- **Roadmap Level:** Level ${state.currentRoadmapLevel} — ${state.currentLevelTitle}
- **Current Project:** ${state.currentProjectTitle || 'DevOps Lab'}
- **Current Task:** ${state.currentTaskTitle || 'Configure Terminal'}
- **Task Status:** ${state.currentTaskStatus}
- **Current Objective:** ${state.currentObjective}
- **Next Recommended Focus:** ${state.nextRecommendedTask || 'Continue current task'}

## 3. Verified Skills & Levels (0–5)
${skills.length > 0 ? skills.map(s => `- **${s.skillName}**: Level ${s.level}/5 (${s.notes || 'Demonstrated'})`).join('\n') : '- No skills recorded yet.'}

## 4. Recent Assessment History
${assessments.length > 0 ? assessments.slice(0, 3).map(a => `### Assessment: ${a.taskTitle || 'Task'} [${a.status}]
- **Summary:** ${a.summary}
- **Strengths:** ${a.strengths.join(', ') || 'None noted'}
- **Needs Practice:** ${a.conceptsToPractice.join(', ') || 'None noted'}
- **Evaluator:** ${a.aiTeacherName}`).join('\n\n') : '- No formal assessments recorded yet.'}

## 5. Recent Journal & Discoveries
${journals.length > 0 ? journals.map(j => `- **${j.title}** (${new Date(j.date).toLocaleDateString()}): ${j.content}`).join('\n') : '- No recent journal notes.'}

## 6. Recent Evidence / Repositories
${evidences.length > 0 ? evidences.map(e => `- **${e.title}**: ${e.url || e.githubRepo || 'Local evidence'}`).join('\n') : '- No evidence links logged yet.'}

---

## 7. Direct Instructions for the External AI Teacher
${instructionsForAI}
`;

  return {
    learnerName: user?.name || 'Learner',
    currentLevel: `Level ${state.currentRoadmapLevel}: ${state.currentLevelTitle}`,
    currentProject: state.currentProjectTitle || 'DevOps Lab',
    currentTask: state.currentTaskTitle || 'Active Mission',
    taskStatus: state.currentTaskStatus,
    objective: state.currentObjective,
    demonstratedSkills,
    recentAssessments,
    instructionsForAI,
    formattedMarkdown: markdown
  };
}
