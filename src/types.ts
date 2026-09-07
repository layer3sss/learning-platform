/**
 * DevOps Learning OS - Core Domain Types
 * Source of truth for multi-user learning state, roadmap, assessments, and AI context.
 */

export type Role = 'USER' | 'ADMIN';

export type ProjectStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'COMPLETED' | 'FAILED' | 'REQUIRES_PRACTICE';

export type AssessmentStatus = 'FAILED' | 'PARTIAL' | 'PASSED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  learningPhilosophy: string;
  preferredMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
  maxLevel: number;
}

export interface UserSkill {
  id: string;
  userId: string;
  skillId: string;
  skillName: string;
  category: string;
  level: number; // 0 to 5
  notes?: string;
  lastDemonstratedAt?: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  objective: string;
  order: number;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  expectedSkills: { skillId: string; skillName: string; expectedLevel: number }[];
  userStatus?: TaskStatus;
  userNotes?: string;
  completionDate?: string;
}

export interface Project {
  id: string;
  roadmapLevelId: string;
  levelNumber: number;
  title: string;
  description: string;
  objective: string;
  order: number;
  tasks: Task[];
  requiredSkills: { skillId: string; skillName: string }[];
  userStatus?: ProjectStatus;
  userProgressPercent?: number;
}

export interface RoadmapLevel {
  id: string;
  levelNumber: number;
  title: string;
  description: string;
  topics: string[];
  order: number;
  projects: Project[];
}

export interface Assessment {
  id: string;
  userId: string;
  projectId?: string;
  projectTitle?: string;
  taskId?: string;
  taskTitle?: string;
  date: string;
  status: AssessmentStatus;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  mistakes: string[];
  conceptsToPractice: string[];
  recommendedNextTask?: string;
  aiTeacherName: string;
  rawAssessmentText?: string;
  notes?: string;
  demonstratedSkills: { skillId: string; skillName: string; demonstratedLevel: number }[];
}

export interface JournalEntry {
  id: string;
  userId: string;
  projectId?: string;
  projectTitle?: string;
  taskId?: string;
  taskTitle?: string;
  title: string;
  content: string;
  tags: string[];
  date: string;
}

export interface Evidence {
  id: string;
  userId: string;
  projectId?: string;
  projectTitle?: string;
  taskId?: string;
  taskTitle?: string;
  title: string;
  description?: string;
  url?: string;
  githubRepo?: string;
  commitUrl?: string;
  date: string;
}

export interface LearningState {
  id: string;
  userId: string;
  currentRoadmapLevel: number;
  currentLevelTitle: string;
  currentProjectId?: string;
  currentProjectTitle?: string;
  currentTaskId?: string;
  currentTaskTitle?: string;
  currentTaskStatus: TaskStatus;
  currentObjective: string;
  lastAssessmentSummary?: string;
  nextRecommendedTask?: string;
  updatedAt: string;
}

export interface AuthSession {
  user: User;
  token: string;
}

export interface AIContextOutput {
  learnerName: string;
  currentLevel: string;
  currentProject: string;
  currentTask: string;
  taskStatus: string;
  objective: string;
  demonstratedSkills: { name: string; level: number }[];
  recentAssessments: string[];
  instructionsForAI: string;
  formattedMarkdown: string;
}
