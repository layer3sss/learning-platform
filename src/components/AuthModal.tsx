import React, { useState } from 'react';
import { Terminal, Shield, User, X, KeyRound, Mail, AlertCircle } from 'lucide-react';
import { api, setStoredToken } from '../lib/api.js';
import type { User as UserType } from '../types.js';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserType) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'USER' | 'ADMIN'>('USER');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (tab === 'login') {
        const res = await api.login(email, password);
        setStoredToken(res.token);
        onSuccess(res.user);
        onClose();
      } else {
        const res = await api.register(name, email, password, role);
        setStoredToken(res.token);
        onSuccess(res.user);
        onClose();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (targetRole: 'USER' | 'ADMIN') => {
    setError(null);
    setLoading(true);
    try {
      const email = targetRole === 'ADMIN' ? 'admin@devops-os.local' : 'learner@devops-os.local';
      const res = await api.login(email, 'devops123');
      setStoredToken(res.token);
      onSuccess(res.user);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white font-mono">Learning OS Auth</h2>
              <p className="text-xs text-slate-400">Isolated multi-user learning environments</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 p-1.5 mx-6 mt-4 bg-[#0B1120] rounded-xl border border-slate-800 font-mono text-xs">
          <button
            type="button"
            onClick={() => { setTab('login'); setError(null); }}
            className={`py-2 rounded-lg font-medium transition-all ${
              tab === 'login' ? 'bg-[#1E293B] text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setError(null); }}
            className={`py-2 rounded-lg font-medium transition-all ${
              tab === 'register' ? 'bg-[#1E293B] text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start space-x-2 bg-red-950/40 border border-red-800/50 rounded-lg p-3 text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {tab === 'register' && (
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">Full Name</label>
              <div className="relative">
                <input
                  id="auth-name-input"
                  type="text"
                  required
                  placeholder="e.g. Linus Torvalds"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-[#0B1120] border border-slate-800 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5">Email Address</label>
            <div className="relative">
              <input
                id="auth-email-input"
                type="email"
                required
                placeholder="devops@engineer.local"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#0B1120] border border-slate-800 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1.5">Password</label>
            <div className="relative">
              <input
                id="auth-password-input"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-[#0B1120] border border-slate-800 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          {tab === 'register' && (
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">System Role</label>
              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setRole('USER')}
                  className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg border transition-all ${
                    role === 'USER'
                      ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300'
                      : 'border-slate-800 bg-[#0B1120] text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Learner</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('ADMIN')}
                  className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg border transition-all ${
                    role === 'ADMIN'
                      ? 'border-amber-500/50 bg-amber-500/10 text-amber-300'
                      : 'border-slate-800 bg-[#0B1120] text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Curriculum Admin</span>
                </button>
              </div>
            </div>
          )}

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-mono text-xs font-semibold rounded-lg transition-all shadow-md mt-2 flex items-center justify-center space-x-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>{loading ? 'Processing...' : tab === 'login' ? 'Sign In' : 'Create Account'}</span>
          </button>
        </form>

        {/* Quick Testing Access (Demo Users) */}
        <div className="px-6 pb-6 pt-2 border-t border-slate-800/80 bg-[#0B1120]/50">
          <p className="text-[11px] font-mono text-slate-500 mb-2.5 text-center">
            One-Click Testing Accounts (Local & Preview):
          </p>
          <div className="grid grid-cols-2 gap-2 font-mono text-xs">
            <button
              type="button"
              id="demo-login-learner-btn"
              onClick={() => handleQuickDemoLogin('USER')}
              disabled={loading}
              className="py-2 px-2.5 bg-[#131C31] hover:bg-slate-800 border border-slate-700/60 rounded-lg text-cyan-400 flex items-center justify-center space-x-1.5 transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              <span>Learner Demo</span>
            </button>
            <button
              type="button"
              id="demo-login-admin-btn"
              onClick={() => handleQuickDemoLogin('ADMIN')}
              disabled={loading}
              className="py-2 px-2.5 bg-[#131C31] hover:bg-slate-800 border border-slate-700/60 rounded-lg text-amber-400 flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Demo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
