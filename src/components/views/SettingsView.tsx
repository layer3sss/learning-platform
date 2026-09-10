import React, { useState } from 'react';
import { Settings, User, Terminal, Database, Server, Shield, AlertTriangle, RotateCcw } from 'lucide-react';
import { api } from '../../lib/api.js';
import type { User as UserType } from '../../types.js';

interface SettingsViewProps {
  user: UserType | null;
  onProgressReset: () => Promise<void> | void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ user, onProgressReset }) => {
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  const handleResetProgress = async () => {
    setResetting(true);
    setResetError(null);
    setResetMessage(null);
    try {
      const result = await api.resetMyProgress();
      setResetMessage(result.message);
      setConfirmingReset(false);
      await onProgressReset();
    } catch (err) {
      setResetError(err instanceof Error ? err.message : 'Failed to reset progress.');
    } finally {
      setResetting(false);
    }
  };
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 font-mono text-xs">
      <div className="bg-[#131C31] border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center space-x-2 text-cyan-400 mb-1">
          <Settings className="w-4 h-4" />
          <span>SYSTEM CONFIGURATION</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white font-sans">Learner Settings & Profile</h1>
        <p className="text-slate-400 font-sans mt-1">
          Environment configuration, learning philosophy settings, and local runtime specifications.
        </p>
      </div>

      {user && (
        <div className="bg-[#131C31]/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center space-x-2">
            <User className="w-4 h-4 text-cyan-400" />
            <span>Profile Data</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#0B1120] p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px]">FULL NAME</span>
              <span className="text-white font-medium text-sm">{user.name}</span>
            </div>
            <div className="bg-[#0B1120] p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px]">EMAIL ADDRESS</span>
              <span className="text-white font-medium text-sm">{user.email}</span>
            </div>
            <div className="bg-[#0B1120] p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px]">ROLE</span>
              <span className="text-cyan-400 font-bold">{user.role}</span>
            </div>
            <div className="bg-[#0B1120] p-3.5 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[10px]">MEMBER SINCE</span>
              <span className="text-slate-300">{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="bg-[#0B1120] p-4 rounded-xl border border-slate-800 space-y-1 font-sans">
            <span className="text-slate-500 font-mono text-[10px] block">LEARNING PHILOSOPHY</span>
            <p className="text-slate-200 text-xs leading-relaxed">{user.learningPhilosophy}</p>
          </div>

          <div className="bg-[#0B1120] p-4 rounded-xl border border-slate-800 space-y-1 font-sans">
            <span className="text-slate-500 font-mono text-[10px] block">PREFERRED LEARNING METHOD</span>
            <p className="text-slate-200 text-xs leading-relaxed">{user.preferredMethod}</p>
          </div>
        </div>
      )}

      {/* Target Infrastructure Info */}
      <div className="bg-[#131C31]/60 border border-slate-800 rounded-2xl p-6 space-y-3 font-sans shadow-sm">
        <h2 className="text-sm font-semibold text-white font-mono uppercase tracking-wider flex items-center space-x-2">
          <Server className="w-4 h-4 text-blue-400" />
          <span>Deployment Target</span>
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          The Learning OS is packaged with a multi-stage Dockerfile and ready for Kubernetes deployment (tested for local home k3s/microk8s clusters). Persistent storage manifests and Docker Compose configurations are included in the repository.
        </p>
      </div>

      {/* Danger Zone: Progress Reset */}
      <div className="bg-[#131C31]/60 border border-red-900/50 rounded-2xl p-6 space-y-4 font-sans shadow-sm">
        <h2 className="text-sm font-semibold text-white font-mono uppercase tracking-wider flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span>Danger Zone</span>
        </h2>

        <div className="bg-[#0B1120] p-4 rounded-xl border border-red-900/40 space-y-3">
          <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
            <div className="space-y-1">
              <span className="text-white text-sm font-semibold flex items-center space-x-2">
                <RotateCcw className="w-3.5 h-3.5 text-red-400" />
                <span>Reset my learning progress</span>
              </span>
              <p className="text-xs text-slate-400 leading-relaxed">
                Permanently erases all of your progress and returns you to Level 0: task and project statuses, skill levels, assessments, journal entries, evidence links, and your current mission. Your account is kept.
                <span className="text-red-400"> This cannot be undone.</span>
              </p>
            </div>
            {!confirmingReset ? (
              <button
                id="reset-progress-btn"
                onClick={() => { setConfirmingReset(true); setResetMessage(null); setResetError(null); }}
                disabled={!user || resetting}
                className="shrink-0 px-4 py-2 rounded-lg text-xs font-bold font-mono bg-red-500/10 text-red-300 border border-red-500/40 hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset Progress
              </button>
            ) : (
              <div className="shrink-0 flex items-center gap-2">
                <button
                  id="reset-progress-cancel-btn"
                  onClick={() => setConfirmingReset(false)}
                  disabled={resetting}
                  className="px-3 py-2 rounded-lg text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  id="reset-progress-confirm-btn"
                  onClick={handleResetProgress}
                  disabled={resetting}
                  className="px-3 py-2 rounded-lg text-xs font-bold font-mono bg-red-600 text-white hover:bg-red-500 transition-colors disabled:opacity-50"
                >
                  {resetting ? 'Erasing…' : 'Yes, erase everything'}
                </button>
              </div>
            )}
          </div>
          {resetMessage && (
            <div className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2">
              {resetMessage}
            </div>
          )}
          {resetError && (
            <div className="text-xs text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {resetError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
