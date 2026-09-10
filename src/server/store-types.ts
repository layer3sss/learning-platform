import type {
  User,
  LearningState,
  UserSkill,
  Assessment,
  JournalEntry,
  Evidence,
  DatabaseStats,
  OrphanCleanupResult,
  ResetResult
} from '../types.js';

export interface UserRecord extends User {
  passwordHash: string;
}

export interface UserProjectProgressRecord {
  userId: string;
  projectId: string;
  status: string;
  startDate?: string;
  completionDate?: string;
}

export interface UserTaskProgressRecord {
  userId: string;
  taskId: string;
  status: string;
  notes?: string;
  completionDate?: string;
}

export interface SkillMeta {
  id: string;
  name: string;
  category: string;
  description: string;
  maxLevel: number;
}

export interface SkillsPayload {
  allSkills: SkillMeta[];
  userSkills: UserSkill[];
}

export interface RoadmapPayload {
  levels: unknown[];
}

/**
 * The persistence contract used by server.ts.
 * Both implementations (in-memory fallback and Prisma/PostgreSQL) must satisfy this.
 */
export interface DataStore {
  readonly kind: 'memory' | 'postgres';

  // --- Auth ---
  register(name: string, email: string, password: string, role: string): Promise<{ user: User; token: string }>;
  login(email: string, password: string): Promise<{ user: User; token: string }>;
  verifyToken(token: string): Promise<User>;
  getUserById(id: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;

  // --- Learning state ---
  getLearningState(userId: string): Promise<LearningState>;
  updateLearningState(userId: string, updates: Partial<LearningState>): Promise<LearningState>;

  // --- Roadmap ---
  getRoadmap(userId: string): Promise<unknown>;

  // --- Task status ---
  setTaskStatus(userId: string, taskId: string, status: string, notes?: string): Promise<UserTaskProgressRecord>;

  // --- Skills ---
  getSkills(userId: string): Promise<SkillsPayload>;
  updateUserSkill(userId: string, skillId: string, level: number, notes?: string): Promise<UserSkill>;

  // --- Assessments ---
  getAssessments(userId: string): Promise<Assessment[]>;
  recordAssessment(userId: string, data: Omit<Assessment, 'id' | 'userId' | 'date'>): Promise<Assessment>;

  // --- Journal ---
  getJournalEntries(userId: string): Promise<JournalEntry[]>;
  addJournalEntry(userId: string, entry: Omit<JournalEntry, 'id' | 'userId' | 'date'>): Promise<JournalEntry>;

  // --- Evidence ---
  getEvidences(userId: string): Promise<Evidence[]>;
  addEvidence(userId: string, evidence: Omit<Evidence, 'id' | 'userId' | 'date'>): Promise<Evidence>;

  // --- AI context ---
  generateAIContext(userId: string): Promise<unknown>;

  // --- Progress reset & maintenance ---
  /**
   * Wipe all learning data for one user so they start from zero.
   * The user account itself is kept. Learning state is re-initialized to the
   * fresh-seed state (Level 0, first task) so the app behaves like a new user.
   */
  resetUserData(userId: string): Promise<ResetResult>;

  /**
   * Delete a user account together with all of its learning data.
   * Returns the reset counts plus the deleted user row count.
   */
  deleteUser(userId: string): Promise<ResetResult>;

  /** Storage footprint of the whole database (admin maintenance panel). */
  getDatabaseStats(): Promise<DatabaseStats>;

  /** Remove progress rows that reference users which no longer exist. */
  cleanupOrphanedData(): Promise<OrphanCleanupResult>;

  // --- Lifecycle ---
  /** Verify the store is reachable/healthy. Throws on failure. */
  healthCheck(): Promise<void>;
  /** Release resources (DB connections etc.). */
  close(): Promise<void>;
}
