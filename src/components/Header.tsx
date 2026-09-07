import React from 'react';
import { Terminal, Shield, User, LogOut, ArrowRightLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import type { User as UserType, LearningState } from '../types.js';

interface HeaderProps {
  user: UserType | null;
  learningState: LearningState | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onSwitchDemo: (role: 'USER' | 'ADMIN') => void;
  onNavigateToAIContext: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  learningState,
  onOpenAuth,
  onLogout,
  onSwitchDemo,
  onNavigateToAIContext
}) => {
  return (
    <header className="h-16 border-b border-slate-800 bg-[#0B1120]/90 backdrop-blur-md sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between">
      {/* Brand & Mission Breadcrumb */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm tracking-tight text-white font-mono">Learning OS</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                DevOps
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline-block">
              Permanent Learning Source of Truth
            </span>
          </div>
        </div>

        {/* Current Mission Pill (Desktop) */}
        {user && learningState && (
          <div className="hidden lg:flex items-center space-x-2 text-xs font-mono bg-slate-900/90 border border-slate-800 rounded-full px-3 py-1 text-slate-300 shadow-sm">
            <span className="text-cyan-400 font-semibold">L{learningState.currentRoadmapLevel}</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400 truncate max-w-[180px]">{learningState.currentProjectTitle || 'Lab'}</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-200 truncate max-w-[200px] font-medium">{learningState.currentTaskTitle || 'Current Task'}</span>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse ml-1" />
          </div>
        )}
      </div>

      {/* Action Controls & User Account */}
      <div className="flex items-center space-x-2.5">
        {user ? (
          <>
            {/* Quick AI Context Action Button */}
            <button
              id="header-ai-context-btn"
              onClick={onNavigateToAIContext}
              className="hidden sm:flex items-center space-x-1.5 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 hover:from-cyan-600/30 hover:to-blue-600/30 border border-cyan-500/40 text-cyan-300 text-xs font-mono px-3 py-1.5 rounded-lg transition-all shadow-sm"
              title="Generate prompt context for external AI"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Copy AI Context</span>
            </button>

            {/* Quick Switch Test Role (Learner / Admin) */}
            <button
              id="header-switch-role-btn"
              onClick={() => onSwitchDemo(user.role === 'ADMIN' ? 'USER' : 'ADMIN')}
              className="flex items-center space-x-1 text-xs text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 hover:border-slate-700 px-2.5 py-1.5 rounded-lg transition-colors font-mono"
              title={`Currently ${user.role}. Click to switch to ${user.role === 'ADMIN' ? 'Learner' : 'Admin'} account`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden md:inline">Switch to {user.role === 'ADMIN' ? 'Learner' : 'Admin'}</span>
            </button>

            {/* User Badge */}
            <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs">
              <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
                {user.role === 'ADMIN' ? <Shield className="w-3.5 h-3.5 text-amber-400" /> : <User className="w-3.5 h-3.5 text-cyan-400" />}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-white font-medium truncate max-w-[120px]">{user.name}</div>
                <div className="text-[10px] text-slate-400 font-mono flex items-center space-x-1">
                  <span>{user.role}</span>
                </div>
              </div>
            </div>

            {/* Logout */}
            <button
              id="header-logout-btn"
              onClick={onLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            id="header-login-btn"
            onClick={onOpenAuth}
            className="flex items-center space-x-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs px-3.5 py-1.5 rounded-lg font-medium transition-all shadow-sm"
          >
            <span>Sign In / Register</span>
          </button>
        )}
      </div>
    </header>
  );
};
