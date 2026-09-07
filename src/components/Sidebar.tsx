import React from 'react';
import {
  LayoutDashboard,
  Map,
  FolderGit2,
  CheckSquare,
  Cpu,
  FileCheck2,
  BookOpen,
  Link2,
  Sparkles,
  Settings,
  ShieldCheck
} from 'lucide-react';
import type { Role } from '../types.js';

export type NavView =
  | 'dashboard'
  | 'roadmap'
  | 'projects'
  | 'tasks'
  | 'skills'
  | 'assessments'
  | 'journal'
  | 'evidence'
  | 'aicontext'
  | 'settings'
  | 'admin';

interface SidebarProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  userRole?: Role;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onSelectView, userRole }) => {
  const navItems: { id: NavView; label: string; icon: React.ReactNode; badge?: string; adminOnly?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'roadmap', label: 'Roadmap', icon: <Map className="w-4 h-4" /> },
    { id: 'projects', label: 'Projects', icon: <FolderGit2 className="w-4 h-4" /> },
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'skills', label: 'Skills', icon: <Cpu className="w-4 h-4" /> },
    { id: 'assessments', label: 'Assessments', icon: <FileCheck2 className="w-4 h-4" /> },
    { id: 'journal', label: 'Journal', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'evidence', label: 'Evidence', icon: <Link2 className="w-4 h-4" /> },
    { id: 'aicontext', label: 'AI Context', icon: <Sparkles className="w-4 h-4 text-cyan-400" />, badge: 'Core' },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
    { id: 'admin', label: 'Admin', icon: <ShieldCheck className="w-4 h-4 text-amber-400" />, adminOnly: true }
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-[#0B1120] flex flex-col justify-between p-3 select-none">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-mono uppercase tracking-wider text-slate-500">
          Navigation
        </div>
        {navItems
          .filter(item => !item.adminOnly || userRole === 'ADMIN')
          .map(item => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => onSelectView(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium font-mono transition-colors ${
                  isActive
                    ? 'bg-slate-800/90 text-white font-semibold shadow-inner border border-slate-700/80'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span className={isActive ? 'text-cyan-400' : 'text-slate-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {item.badge}
                  </span>
                )}
                {item.adminOnly && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Admin
                  </span>
                )}
              </button>
            );
          })}
      </div>

      {/* Philosophy Box */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 text-xs text-slate-400 space-y-1.5">
        <div className="font-mono text-[11px] font-semibold text-slate-200 flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          <span>Learning Philosophy</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          The Learning OS is your permanent state. The AI teacher is interchangeable. Build, break, troubleshoot, and record.
        </p>
      </div>
    </aside>
  );
};
