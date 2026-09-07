import React from 'react';
import {
  Target,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Server,
  Database,
  ExternalLink,
  BookOpen,
  Cpu
} from 'lucide-react';
import type { LearningState, TaskStatus, UserSkill, Assessment } from '../../types.js';

interface DashboardViewProps {
  learningState: LearningState | null;
  userSkills: UserSkill[];
  assessments: Assessment[];
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
  onNavigateToAIContext: () => void;
  onNavigateToRoadmap: () => void;
  onNavigateToAssessments: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  learningState,
  userSkills,
  assessments,
  onUpdateTaskStatus,
  onNavigateToAIContext,
  onNavigateToRoadmap,
  onNavigateToAssessments
}) => {
  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping mr-1" />
            IN PROGRESS
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>COMPLETED</span>
          </span>
        );
      case 'BLOCKED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>BLOCKED</span>
          </span>
        );
      case 'REQUIRES_PRACTICE':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>NEEDS PRACTICE</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-slate-800 text-slate-400 border border-slate-700">
            <Clock className="w-3.5 h-3.5" />
            <span>TODO</span>
          </span>
        );
    }
  };

  const roadmapLevels = [
    { num: 0, title: 'DevOps Lab' },
    { num: 1, title: 'Linux Server' },
    { num: 2, title: 'Web App' },
    { num: 3, title: 'Containers' },
    { num: 4, title: 'CI/CD' },
    { num: 5, title: 'Kubernetes' },
    { num: 6, title: 'K8s Troubleshoot' },
    { num: 7, title: 'IaC' },
    { num: 8, title: 'Ansible' },
    { num: 9, title: 'Observability' },
    { num: 10, title: 'Security' },
    { num: 11, title: 'Cloud' },
    { num: 12, title: 'GitOps' },
    { num: 13, title: 'Platform Capstone' }
  ];

  const currentLevel = learningState?.currentRoadmapLevel ?? 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* 1. CURRENT MISSION HERO COCKPIT */}
      <section className="bg-gradient-to-b from-[#131C31] to-[#0B1120] border border-slate-700/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 mb-2">
              <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold">
                ACTIVE MISSION
              </span>
              <span>•</span>
              <span>Level {learningState?.currentRoadmapLevel}: {learningState?.currentLevelTitle}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {learningState?.currentTaskTitle || 'Configure Workstation & Git'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-mono mt-1">
              Project: <span className="text-slate-300 font-medium">{learningState?.currentProjectTitle || 'DevOps Lab'}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {learningState && getStatusBadge(learningState.currentTaskStatus)}
            <button
              id="dashboard-copy-ai-btn"
              onClick={onNavigateToAIContext}
              className="flex items-center space-x-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono px-3.5 py-2 rounded-lg font-medium transition-all shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Copy AI Context</span>
            </button>
          </div>
        </div>

        {/* Objective & Mission Next Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
          <div className="md:col-span-2 bg-[#0B1120]/70 border border-slate-800/80 rounded-xl p-4">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1 flex items-center space-x-1.5">
              <Target className="w-3.5 h-3.5 text-cyan-400" />
              <span>Learning Objective</span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-sans">
              {learningState?.currentObjective || 'Execute the hands-on task, experiment with configurations, and verify with tests.'}
            </p>

            {/* Quick Status Control Buttons */}
            {learningState?.currentTaskId && (
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-mono text-slate-400 mr-1">Update Task Status:</span>
                <button
                  onClick={() => onUpdateTaskStatus(learningState.currentTaskId!, 'IN_PROGRESS')}
                  className={`text-xs font-mono px-2.5 py-1 rounded border transition-colors ${
                    learningState.currentTaskStatus === 'IN_PROGRESS'
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  In Progress
                </button>
                <button
                  onClick={() => onUpdateTaskStatus(learningState.currentTaskId!, 'COMPLETED')}
                  className={`text-xs font-mono px-2.5 py-1 rounded border transition-colors ${
                    learningState.currentTaskStatus === 'COMPLETED'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  Completed
                </button>
                <button
                  onClick={() => onUpdateTaskStatus(learningState.currentTaskId!, 'BLOCKED')}
                  className={`text-xs font-mono px-2.5 py-1 rounded border transition-colors ${
                    learningState.currentTaskStatus === 'BLOCKED'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  Blocked
                </button>
              </div>
            )}
          </div>

          <div className="bg-[#0B1120]/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1 flex items-center space-x-1.5">
                <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
                <span>Next Recommended Task</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                {learningState?.nextRecommendedTask || 'Continue with current mission milestones and record assessment.'}
              </p>
            </div>
            <button
              onClick={onNavigateToAssessments}
              className="mt-3 text-left text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
            >
              <span>Record AI Assessment</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. ROADMAP PROGRESS (Level 0 -> Level 13) */}
      <section className="bg-[#131C31]/70 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-semibold text-white uppercase tracking-wider">
              Roadmap Progress Overview (Level 0 – 13)
            </span>
          </div>
          <button
            onClick={onNavigateToRoadmap}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
          >
            <span>View Full Curriculum</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {roadmapLevels.map(lvl => {
            const isCurrent = lvl.num === currentLevel;
            const isCompleted = lvl.num < currentLevel;
            return (
              <div
                key={lvl.num}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isCurrent
                    ? 'bg-cyan-500/10 border-cyan-500/50 text-white ring-1 ring-cyan-500/30'
                    : isCompleted
                    ? 'bg-slate-900 border-slate-700/60 text-slate-300'
                    : 'bg-[#0B1120]/60 border-slate-800/80 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-mono font-bold ${isCurrent ? 'text-cyan-400' : isCompleted ? 'text-slate-400' : 'text-slate-600'}`}>
                    L{lvl.num}
                  </span>
                  {isCompleted && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                  {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />}
                </div>
                <div className="text-xs font-medium truncate font-sans">{lvl.title}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. SKILLS COCKPIT & RECENT ASSESSMENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skills System Bar Chart */}
        <section className="bg-[#131C31]/70 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <h2 className="font-mono text-xs font-semibold text-white uppercase tracking-wider">
                Demonstrated Skills (Level 0 – 5)
              </h2>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Based on Verified Assessments</span>
          </div>

          <div className="space-y-3">
            {userSkills.slice(0, 6).map(skill => {
              const percentage = (skill.level / 5) * 100;
              return (
                <div key={skill.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300">{skill.skillName}</span>
                    <span className="text-cyan-400 font-bold">{skill.level} / 5</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#0B1120] border border-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(percentage, 4)}%` }}
                    />
                  </div>
                  {skill.notes && (
                    <div className="text-[10px] text-slate-400 truncate">{skill.notes}</div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Recent AI Assessments */}
        <section className="bg-[#131C31]/70 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <h2 className="font-mono text-xs font-semibold text-white uppercase tracking-wider">
                Recent AI Teacher Assessments
              </h2>
            </div>
            <button
              onClick={onNavigateToAssessments}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
            >
              <span>All ({assessments.length})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {assessments.length > 0 ? (
            <div className="space-y-3">
              {assessments.slice(0, 3).map(a => (
                <div key={a.id} className="bg-[#0B1120]/70 border border-slate-800/80 rounded-xl p-3.5 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 truncate">{a.taskTitle || 'Task Assessment'}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold ${
                        a.status === 'PASSED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : a.status === 'PARTIAL'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {a.status}
                    </span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">{a.summary}</p>
                  {a.conceptsToPractice && a.conceptsToPractice.length > 0 && (
                    <div className="text-[11px] text-slate-400 font-mono">
                      Practice: <span className="text-slate-300">{a.conceptsToPractice.join(', ')}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#0B1120]/40 border border-dashed border-slate-800 rounded-xl p-6 text-center text-xs text-slate-500 space-y-2">
              <p>No assessments recorded yet.</p>
              <p className="text-[11px] text-slate-400">
                Copy your AI Context, complete the mission with your external AI, and record the teacher evaluation here.
              </p>
              <button
                onClick={onNavigateToAssessments}
                className="mt-2 inline-flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 font-mono text-xs"
              >
                <span>Record First Assessment</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </section>
      </div>

      {/* 4. PHASE 1 ARCHITECTURE & STACK STATUS */}
      <section className="bg-[#0B1120] border border-slate-800/90 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center space-x-2">
            <Server className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
              Phase 1 System Architecture Status
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            Phase 1 Foundation Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
            <div className="text-slate-400 text-[11px] mb-1">Backend Runtime</div>
            <div className="text-white font-semibold flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Express + TypeScript</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">REST API / Port 3000</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
            <div className="text-slate-400 text-[11px] mb-1">Database & ORM</div>
            <div className="text-white font-semibold flex items-center space-x-1.5">
              <Database className="w-3.5 h-3.5 text-blue-400" />
              <span>Prisma Schema Ready</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Postgres / Container ready</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
            <div className="text-slate-400 text-[11px] mb-1">Authentication</div>
            <div className="text-white font-semibold flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>JWT + bcrypt Security</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Strict User Isolation</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
            <div className="text-slate-400 text-[11px] mb-1">AI Teacher Policy</div>
            <div className="text-white font-semibold flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Zero AI API Integration</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Manual Context Transfer</div>
          </div>
        </div>
      </section>
    </div>
  );
};
