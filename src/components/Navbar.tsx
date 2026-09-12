import React from 'react';
import { Sparkles, ShieldCheck, LogOut, User as UserIcon, Code2, Server } from 'lucide-react';
import { User } from '../types.js';

interface NavbarProps {
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenAuth,
  onLogout,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <div 
          onClick={() => setActiveTab('dashboard')}
          className="flex cursor-pointer items-center gap-2.5 transition hover:opacity-90"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-sky-500 font-bold text-white shadow-lg shadow-indigo-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight text-white sm:text-lg">
                HirePilot<span className="text-indigo-400">.AI</span>
              </span>
              <span className="rounded bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-400 border border-indigo-500/20">
                PRO
              </span>
            </div>
            <p className="hidden text-[11px] text-slate-400 sm:block">
              Job Search &amp; Interview Copilot
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Architecture & API status indicator */}
        <div 
          onClick={() => setActiveTab('api-docs')}
          className="hidden cursor-pointer items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-950/40 px-3 py-1 text-xs text-emerald-400 transition hover:bg-emerald-900/40 md:flex"
          title="Click to view OpenAPI specs & Java Spring Boot architecture"
        >
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <Server className="h-3.5 w-3.5 text-emerald-400" />
          <span className="font-mono text-[11px]">Spring Boot 3 + Gemini 3.8</span>
        </div>

        {user ? (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-xs text-slate-200 transition hover:border-slate-700 hover:bg-slate-800"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600/30 text-indigo-400">
                <UserIcon className="h-3.5 w-3.5" />
              </div>
              <span className="hidden font-medium sm:inline">{user.name}</span>
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 p-2 text-xs text-slate-400 transition hover:bg-slate-800 hover:text-rose-400"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-500"
          >
            <UserIcon className="h-3.5 w-3.5" />
            Sign In / Demo
          </button>
        )}
      </div>
    </header>
  );
};
