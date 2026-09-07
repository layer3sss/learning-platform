import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.js';
import { Sidebar, type NavView } from './components/Sidebar.js';
import { AuthModal } from './components/AuthModal.js';
import { DashboardView } from './components/views/DashboardView.js';
import { RoadmapView } from './components/views/RoadmapView.js';
import { AIContextView } from './components/views/AIContextView.js';
import { AssessmentsView } from './components/views/AssessmentsView.js';
import { SkillsView } from './components/views/SkillsView.js';
import { JournalView } from './components/views/JournalView.js';
import { EvidenceView } from './components/views/EvidenceView.js';
import { AdminView } from './components/views/AdminView.js';
import { SettingsView } from './components/views/SettingsView.js';
import { api, getStoredToken, setStoredToken, removeStoredToken } from './lib/api.js';
import type { User, LearningState, UserSkill, Assessment, TaskStatus } from './types.js';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [learningState, setLearningState] = useState<LearningState | null>(null);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [currentView, setCurrentView] = useState<NavView>('dashboard');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Initialize Session
  useEffect(() => {
    const initSession = async () => {
      const token = getStoredToken();
      if (token) {
        try {
          const res = await api.getMe();
          setUser(res.user);
          await loadUserData();
          setInitialLoading(false);
          return;
        } catch {
          removeStoredToken();
        }
      }

      // Automatically initialize default Demo Learner for zero-friction preview experience
      try {
        const demoRes = await api.login('learner@devops-os.local', 'devops123');
        setStoredToken(demoRes.token);
        setUser(demoRes.user);
        await loadUserData();
      } catch (err) {
        console.error('Demo auto-login failed:', err);
      } finally {
        setInitialLoading(false);
      }
    };

    initSession();
  }, []);

  const loadUserData = async () => {
    try {
      const [stateRes, skillsRes, assessRes] = await Promise.all([
        api.getLearningState(),
        api.getSkills(),
        api.getAssessments()
      ]);
      setLearningState(stateRes);
      setUserSkills(skillsRes.userSkills);
      setAssessments(assessRes);
    } catch (err) {
      console.error('Failed to load user state:', err);
    }
  };

  const handleLogout = () => {
    removeStoredToken();
    setUser(null);
    setLearningState(null);
    setUserSkills([]);
    setAssessments([]);
    setIsAuthOpen(true);
  };

  const handleSwitchDemo = async (targetRole: 'USER' | 'ADMIN') => {
    try {
      const res = await api.switchDemoUser(targetRole);
      setStoredToken(res.token);
      setUser(res.user);
      await loadUserData();
      if (targetRole === 'ADMIN') {
        setCurrentView('admin');
      } else {
        setCurrentView('dashboard');
      }
    } catch (err) {
      console.error('Demo user switch failed:', err);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: TaskStatus) => {
    try {
      const res = await api.updateTaskStatus(taskId, status);
      setLearningState(res.learningState);
      // reload skills and assessments as well
      const skillsRes = await api.getSkills();
      setUserSkills(skillsRes.userSkills);
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
        <div className="font-mono text-xs text-slate-400">Booting DevOps Learning OS Environment...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col antialiased selection:bg-cyan-500/30 selection:text-cyan-200 font-sans">
      {/* Header */}
      <Header
        user={user}
        learningState={learningState}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onSwitchDemo={handleSwitchDemo}
        onNavigateToAIContext={() => setCurrentView('aicontext')}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentView={currentView}
          onSelectView={setCurrentView}
          userRole={user?.role}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-[#0F172A]">
          {currentView === 'dashboard' && (
            <DashboardView
              learningState={learningState}
              userSkills={userSkills}
              assessments={assessments}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onNavigateToAIContext={() => setCurrentView('aicontext')}
              onNavigateToRoadmap={() => setCurrentView('roadmap')}
              onNavigateToAssessments={() => setCurrentView('assessments')}
            />
          )}

          {(currentView === 'roadmap' || currentView === 'projects' || currentView === 'tasks') && (
            <RoadmapView
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onNavigateToAIContext={() => setCurrentView('aicontext')}
              onNavigateToAssessments={() => setCurrentView('assessments')}
            />
          )}

          {currentView === 'aicontext' && (
            <AIContextView
              onNavigateToAssessments={() => setCurrentView('assessments')}
            />
          )}

          {currentView === 'assessments' && (
            <AssessmentsView
              onAssessmentRecorded={loadUserData}
            />
          )}

          {currentView === 'skills' && (
            <SkillsView />
          )}

          {currentView === 'journal' && (
            <JournalView />
          )}

          {currentView === 'evidence' && (
            <EvidenceView />
          )}

          {currentView === 'admin' && (
            <AdminView />
          )}

          {currentView === 'settings' && (
            <SettingsView user={user} />
          )}
        </main>
      </div>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={async (newUser) => {
          setUser(newUser);
          await loadUserData();
        }}
      />
    </div>
  );
}
