import React from 'react';
import { Settings, User, Terminal, Database, Server, Shield } from 'lucide-react';
import type { User as UserType } from '../../types.js';

interface SettingsViewProps {
  user: UserType | null;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ user }) => {
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
    </div>
  );
};
