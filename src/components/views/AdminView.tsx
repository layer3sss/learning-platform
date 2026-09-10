import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Users,
  Database,
  Layers,
  CheckCircle2,
  HardDrive,
  RefreshCw,
  Trash2,
  Eraser,
  UserMinus,
  AlertTriangle
} from 'lucide-react';
import { api } from '../../lib/api.js';
import type { User, DatabaseStats } from '../../types.js';

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/** Rough per-user size estimate based on average row sizes used by the memory store. */
function estimateUserBytes(totalRows: number): number {
  return totalRows * 1024;
}

export const AdminView: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null);
  const [dbLoading, setDbLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [cleanupBusy, setCleanupBusy] = useState(false);
  const [cleanupResult, setCleanupResult] = useState<string | null>(null);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ userId: string; kind: 'reset' | 'delete' } | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      const list = await api.getAdminUsers();
      setUsers(list);
    } catch (err) {
      console.error('Failed to load admin users list:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDbStats = useCallback(async () => {
    setDbLoading(true);
    setDbError(null);
    try {
      const stats = await api.getDatabaseStats();
      setDbStats(stats);
    } catch (err) {
      setDbError(err instanceof Error ? err.message : 'Failed to load database stats.');
    } finally {
      setDbLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
    loadDbStats();
  }, [loadUsers, loadDbStats]);

  const handleCleanup = async () => {
    setCleanupBusy(true);
    setCleanupResult(null);
    setRowError(null);
    try {
      const result = await api.cleanupOrphanedData();
      setCleanupResult(
        result.totalDeleted > 0
          ? `Removed ${result.totalDeleted} orphaned row(s) belonging to ${result.orphanedUsersFound} deleted user(s).`
          : 'No orphaned data found — database is clean.'
      );
      await Promise.all([loadUsers(), loadDbStats()]);
    } catch (err) {
      setRowError(err instanceof Error ? err.message : 'Cleanup failed.');
    } finally {
      setCleanupBusy(false);
    }
  };

  const handleUserAction = async (userId: string, kind: 'reset' | 'delete') => {
    setBusyUserId(userId);
    setRowError(null);
    try {
      if (kind === 'reset') {
        await api.adminResetUser(userId);
      } else {
        await api.adminDeleteUser(userId);
        setConfirmAction(null);
      }
      await Promise.all([loadUsers(), loadDbStats()]);
    } catch (err) {
      setRowError(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setBusyUserId(null);
    }
  };

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
          <div className="text-[11px] text-slate-400 mt-1">
            {dbStats ? (dbStats.provider === 'postgres' ? `Prisma PostgreSQL${dbStats.databaseName ? ` · ${dbStats.databaseName}` : ''}` : 'In-memory store active') : 'Loading…'}
          </div>
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
          {users.map(u => {
            const stat = dbStats?.users.find(s => s.userId === u.id);
            const isSelf = false; // current admin id is not passed to this view; self-delete is blocked server-side
            return (
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
                {stat && (
                  <div className="text-slate-500 text-[10px]">
                    {stat.totalRows} progress row{stat.totalRows === 1 ? '' : 's'}
                    {stat.lastActivity ? ` · last activity ${new Date(stat.lastActivity).toLocaleDateString()}` : ''}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right text-[11px] text-slate-500">
                  <div>Created: {new Date(u.createdAt).toLocaleDateString()}</div>
                  {stat && <div>{formatBytes(estimateUserBytes(stat.totalRows))}</div>}
                </div>
                {!isSelf && (
                  <div className="flex items-center gap-1.5">
                    {confirmAction?.userId === u.id && confirmAction.kind === 'reset' && (
                      <button
                        onClick={() => handleUserAction(u.id, 'reset')}
                        disabled={busyUserId === u.id}
                        className="px-2 py-1 rounded text-[10px] font-bold bg-red-600 text-white hover:bg-red-500 disabled:opacity-50"
                      >
                        {busyUserId === u.id ? '…' : 'Confirm reset'}
                      </button>
                    )}
                    {confirmAction?.userId === u.id && confirmAction.kind === 'delete' && (
                      <>
                        <button
                          onClick={() => setConfirmAction(null)}
                          disabled={busyUserId === u.id}
                          className="px-2 py-1 rounded text-[10px] bg-slate-700 text-slate-200 hover:bg-slate-600 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleUserAction(u.id, 'delete')}
                          disabled={busyUserId === u.id}
                          className="px-2 py-1 rounded text-[10px] font-bold bg-red-600 text-white hover:bg-red-500 disabled:opacity-50"
                        >
                          {busyUserId === u.id ? '…' : 'Confirm delete'}
                        </button>
                      </>
                    )}
                    {!confirmAction || confirmAction.userId !== u.id ? (
                      <>
                        <button
                          id={`admin-reset-${u.id}`}
                          title="Erase this user's learning progress (keeps the account)"
                          onClick={() => setConfirmAction({ userId: u.id, kind: 'reset' })}
                          className="p-1.5 rounded text-slate-500 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                        >
                          <Eraser className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`admin-delete-${u.id}`}
                          title="Delete this account and all of its data"
                          onClick={() => setConfirmAction({ userId: u.id, kind: 'delete' })}
                          className="p-1.5 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
            );
          })}
          {users.length === 0 && !loading && (
            <div className="p-4 text-slate-500">No users found.</div>
          )}
        </div>
        {rowError && (
          <div className="px-5 py-3 bg-red-500/10 border-t border-red-500/30 text-red-300 text-xs font-mono">
            {rowError}
          </div>
        )}
      </div>

      {/* Database Maintenance */}
      <div className="bg-[#131C31]/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="bg-[#0B1120] px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-xs font-mono font-semibold text-white uppercase tracking-wider flex items-center space-x-2">
            <HardDrive className="w-3.5 h-3.5 text-amber-400" />
            <span>Database Maintenance</span>
          </h2>
          <button
            id="db-refresh-btn"
            onClick={loadDbStats}
            disabled={dbLoading}
            className="flex items-center space-x-1.5 text-[10px] font-mono text-slate-400 hover:text-cyan-300 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${dbLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="p-5 space-y-5 font-mono text-xs">
          {dbError && (
            <div className="text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {dbError}
            </div>
          )}

          {!dbError && dbStats && (
            <>
              {/* Top summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-[#0B1120] p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase">Total Size</div>
                  <div className="text-lg font-bold text-white">{formatBytes(dbStats.totalSizeBytes)}</div>
                </div>
                <div className="bg-[#0B1120] p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase">Total Rows</div>
                  <div className="text-lg font-bold text-white">{dbStats.totalRows}</div>
                </div>
                <div className="bg-[#0B1120] p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase">Users</div>
                  <div className="text-lg font-bold text-white">{dbStats.totalUsers}</div>
                </div>
                <div className="bg-[#0B1120] p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase">Provider</div>
                  <div className="text-lg font-bold text-cyan-400">{dbStats.provider}</div>
                  {dbStats.serverVersion && (
                    <div className="text-[10px] text-slate-500">{dbStats.serverVersion}</div>
                  )}
                </div>
              </div>

              {/* Per-table footprint */}
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Table Footprint</div>
                <div className="bg-[#0B1120] rounded-xl border border-slate-800 divide-y divide-slate-800/60">
                  {dbStats.tables.map(t => {
                    const pct = dbStats.totalSizeBytes > 0 ? Math.round((t.sizeBytes / dbStats.totalSizeBytes) * 100) : 0;
                    return (
                      <div key={t.name} className="px-4 py-2.5 flex items-center justify-between gap-3">
                        <span className="text-slate-300">{t.name}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-28 h-1.5 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                            <div className="h-full bg-cyan-500/60 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-slate-500 w-14 text-right">{t.rowCount} rows</span>
                          <span className="text-slate-400 w-16 text-right">{formatBytes(t.sizeBytes)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Per-user usage */}
              <div>
                <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Storage per User</div>
                <div className="bg-[#0B1120] rounded-xl border border-slate-800 divide-y divide-slate-800/60">
                  {dbStats.users.map(us => (
                    <div key={us.userId} className="px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-slate-200">{us.name}</span>
                        <span className="text-slate-500 ml-2">({us.email})</span>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {us.breakdown.assessments} assessments · {us.breakdown.journalEntries} journal · {us.breakdown.evidences} evidence · {us.breakdown.skills} skills · {us.breakdown.taskProgress} tasks · {us.breakdown.projectProgress} projects
                        </div>
                      </div>
                      <div className="text-right text-[11px] text-slate-400">
                        <span>{us.totalRows} rows</span>
                        <span className="text-slate-600 ml-2">~{formatBytes(estimateUserBytes(us.totalRows))}</span>
                      </div>
                    </div>
                  ))}
                  {dbStats.users.length === 0 && (
                    <div className="px-4 py-2.5 text-slate-500">No users.</div>
                  )}
                </div>
              </div>

              {/* Orphan cleanup */}
              <div className="bg-[#0B1120] p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
                  <div className="space-y-1">
                    <div className="text-white font-semibold flex items-center space-x-2">
                      <Eraser className="w-3.5 h-3.5 text-amber-400" />
                      <span>Orphaned Data Cleanup</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Removes progress rows that still reference users which no longer exist (e.g. after manual database pruning). Safe to run at any time; it never touches data of living accounts.
                    </p>
                  </div>
                  <button
                    id="db-cleanup-btn"
                    onClick={handleCleanup}
                    disabled={cleanupBusy}
                    className="shrink-0 px-3 py-2 rounded-lg text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/40 hover:bg-amber-500/20 transition-colors disabled:opacity-50"
                  >
                    {cleanupBusy ? 'Cleaning…' : 'Run Cleanup'}
                  </button>
                </div>
                {cleanupResult && (
                  <div className="text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2">
                    {cleanupResult}
                  </div>
                )}
              </div>

              <div className="flex items-start space-x-2 text-[10px] text-slate-500">
                <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5 text-slate-600" />
                <span>
                  Checked at {new Date(dbStats.checkedAt).toLocaleString()}
                  {dbStats.provider === 'memory' && ' — size figures are estimates; the in-memory store resets on restart.'}
                </span>
              </div>
            </>
          )}

          {dbLoading && !dbStats && (
            <div className="text-slate-500">Loading database statistics…</div>
          )}
        </div>
      </div>
    </div>
  );
};
