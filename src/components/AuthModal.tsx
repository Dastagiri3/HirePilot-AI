import React, { useState } from 'react';
import { Sparkles, X, Lock, Mail, User as UserIcon } from 'lucide-react';
import { apiRequest, setStoredToken } from '../lib/api.js';
import { User } from '../types.js';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('alex.chen@hirepilot.dev');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const body = mode === 'login' ? { email, password } : { name, email, password };
      const data = await apiRequest<{ token: string; user: User }>(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
      });

      setStoredToken(data.token);
      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSignIn = () => {
    setEmail('alex.chen@hirepilot.dev');
    setPassword('password123');
    setMode('login');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-bold text-white text-base">HirePilot.AI Account</span>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-900 hover:text-slate-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="mt-5 flex rounded-xl border border-slate-800 bg-slate-900/80 p-1">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`w-1/2 rounded-lg py-1.5 text-xs font-semibold transition ${
              mode === 'login' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`w-1/2 rounded-lg py-1.5 text-xs font-semibold transition ${
              mode === 'register' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-950/40 p-2.5 text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {mode === 'register' && (
            <div>
              <label className="text-xs font-medium text-slate-300">Full Name</label>
              <div className="relative mt-1">
                <UserIcon className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="Alex Chen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 py-2 pl-9 pr-3 text-xs text-white focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-slate-300">Email Address</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                placeholder="alex.chen@hirepilot.dev"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-900 py-2 pl-9 pr-3 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300">Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-900 py-2 pl-9 pr-3 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-500 disabled:opacity-50"
          >
            {isLoading
              ? 'Authenticating...'
              : mode === 'login'
              ? 'Sign In with JWT'
              : 'Register Candidate'}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={handleDemoSignIn}
            className="text-xs text-indigo-400 hover:underline"
          >
            Fill Demo Credentials (Alex Chen)
          </button>
        </div>
      </div>
    </div>
  );
};
