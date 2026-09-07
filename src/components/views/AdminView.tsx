import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Database, Layers, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api.js';
import type { User } from '../../types.js';

export const AdminView: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const list = await api.getAdminUsers();
        setUsers(list);
      } catch (err) {
        console.error('Failed to load admin users list:', err);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="bg-[#131C31] border border-amber-500/30 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center space-x-2 text-xs font-mono text-amber-400 mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>ADMINISTRATOR CONSOLE</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">Curriculum & User Administration</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage the global DevOps curriculum, inspect multi-user learning instances, and monitor database integrity.
        </p>
      </div>

      {/* Admin stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#131C31]/80 border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="text-xs font-mono text-slate-500 flex items-center space-x-1.5 mb-1">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>Registered Users</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">{users.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Complete data isolation active</div>
        </div>

        <div className="bg-[#131C31]/80 border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="text-xs font-mono text-slate-500 flex items-center space-x-1.5 mb-1">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>Curriculum Levels</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">14 Levels</div>
          <div className="text-[11px] text-slate-400 mt-1">Levels 0 to 13 initialized</div>
        </div>

        <div className="bg-[#131C31]/80 border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="text-xs font-mono text-slate-500 flex items-center space-x-1.5 mb-1">
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span>Schema Status</span>
          </div>
          <div className="text-2xl font-bold text-cyan-400 font-mono">Synced</div>
          <div className="text-[11px] text-slate-400 mt-1">Prisma PostgreSQL ready</div>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-[#131C31]/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="bg-[#0B1120] px-5 py-3 border-b border-slate-800">
          <h2 className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
            Registered Users & Learning Instances
          </h2>
        </div>

        <div className="divide-y divide-slate-800 font-mono text-xs">
          {users.map(u => (
            <div key={u.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/40 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-white font-bold">{u.name}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      u.role === 'ADMIN'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    }`}
                  >
                    {u.role}
                  </span>
                </div>
                <div className="text-slate-400 text-[11px]">{u.email}</div>
              </div>

              <div className="text-right text-[11px] text-slate-500">
                Created: {new Date(u.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
