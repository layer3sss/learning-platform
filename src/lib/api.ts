import type {
  User,
  LearningState,
  RoadmapLevel,
  Assessment,
  JournalEntry,
  Evidence,
  AIContextOutput,
  TaskStatus,
  Skill,
  UserSkill
} from '../types.js';

const TOKEN_KEY = 'devops_learning_os_jwt';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}: Request failed`);
  }
  return data as T;
}

export const api = {
  // Health
  getHealth: () => request<{ status: string; system: string; database: { status: string; provider: string } }>('/api/health'),

  // Auth
  register: (name: string, email: string, password: string, role: 'USER' | 'ADMIN' = 'USER') =>
    request<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role })
    }),

  login: (email: string, password: string) =>
    request<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  getMe: () => request<{ user: User }>('/api/auth/me'),

  switchDemoUser: (targetRole: 'USER' | 'ADMIN') =>
    request<{ user: User; token: string }>('/api/auth/switch-demo', {
      method: 'POST',
      body: JSON.stringify({ targetRole })
    }),

  // Learning State
  getLearningState: () => request<LearningState>('/api/learning-state'),
  updateLearningState: (updates: Partial<LearningState>) =>
    request<LearningState>('/api/learning-state', {
      method: 'PUT',
      body: JSON.stringify(updates)
    }),

  // Roadmap & Tasks
  getRoadmap: () => request<RoadmapLevel[]>('/api/roadmap'),
  updateTaskStatus: (taskId: string, status: TaskStatus, notes?: string) =>
    request<{ record: unknown; learningState: LearningState }>(`/api/tasks/${taskId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes })
    }),

  // Skills
  getSkills: () => request<{ allSkills: Skill[]; userSkills: UserSkill[] }>('/api/skills'),
  updateSkill: (skillId: string, level: number, notes?: string) =>
    request<UserSkill>(`/api/skills/${skillId}`, {
      method: 'PUT',
      body: JSON.stringify({ level, notes })
    }),

  // Assessments
  getAssessments: () => request<Assessment[]>('/api/assessments'),
  createAssessment: (data: Partial<Assessment>) =>
    request<Assessment>('/api/assessments', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Journal
  getJournal: () => request<JournalEntry[]>('/api/journal'),
  createJournalEntry: (data: { title: string; content: string; tags: string[]; projectId?: string; projectTitle?: string; taskId?: string; taskTitle?: string }) =>
    request<JournalEntry>('/api/journal', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Evidence
  getEvidence: () => request<Evidence[]>('/api/evidence'),
  createEvidence: (data: { title: string; description?: string; url?: string; githubRepo?: string; commitUrl?: string; projectId?: string; projectTitle?: string; taskId?: string; taskTitle?: string }) =>
    request<Evidence>('/api/evidence', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // AI Context
  getAIContext: () => request<AIContextOutput>('/api/ai-context'),

  // Admin
  getAdminUsers: () => request<User[]>('/api/admin/users')
};
