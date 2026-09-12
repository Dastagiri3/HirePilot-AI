import React from 'react';
import {
  LayoutDashboard,
  UserCheck,
  Briefcase,
  FileSearch,
  FolderGit2,
  FileText,
  GraduationCap,
  Bot,
  Kanban,
  FileCode2,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedJobCompany?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  selectedJobCompany,
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: undefined,
    },
    {
      id: 'profile',
      label: 'Candidate Profile',
      icon: UserCheck,
      badge: '92%',
    },
    {
      id: 'jobs',
      label: 'Saved Jobs',
      icon: Briefcase,
      badge: undefined,
    },
    {
      id: 'analyzer',
      label: 'AI Job Analyzer',
      icon: FileSearch,
      badge: 'AI',
    },
    {
      id: 'recommender',
      label: 'Project Recommender',
      icon: FolderGit2,
      badge: 'AI',
    },
    {
      id: 'resume-copilot',
      label: 'Resume & Cover Letter',
      icon: FileText,
      badge: 'ATS',
    },
    {
      id: 'learning-plan',
      label: 'Skill Gap & Learning',
      icon: GraduationCap,
      badge: undefined,
    },
    {
      id: 'interview',
      label: 'AI Mock Interview',
      icon: Bot,
      badge: 'Live',
    },
    {
      id: 'tracker',
      label: 'Application Tracker',
      icon: Kanban,
      badge: undefined,
    },
    {
      id: 'api-docs',
      label: 'Architecture & Docs',
      icon: FileCode2,
      badge: 'OpenAPI',
    },
  ];

  return (
    <aside className="w-full shrink-0 border-r border-slate-800 bg-slate-950/60 p-4 lg:w-64">
      {selectedJobCompany && (
        <div className="mb-4 rounded-lg border border-indigo-500/20 bg-indigo-950/30 p-2.5 text-xs">
          <span className="text-[11px] font-medium text-slate-400">Target Focus:</span>
          <p className="truncate font-semibold text-indigo-300">{selectedJobCompany}</p>
        </div>
      )}

      <nav className="flex flex-wrap gap-1.5 lg:flex-col">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-6 hidden rounded-xl border border-slate-800/80 bg-slate-900/40 p-3 lg:block">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Anti-Hallucination Safe
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
          HirePilot AI evaluates purely against verified candidate experiences. No synthetic degrees or skills are created.
        </p>
      </div>
    </aside>
  );
};
