import React, { useState } from 'react';
import {
  Kanban,
  Plus,
  Calendar,
  MoreVertical,
  CheckCircle2,
  Trash2,
  Building2,
  Briefcase,
  FileEdit,
  ArrowRight,
} from 'lucide-react';
import { JobApplication, ApplicationStatus } from '../types.js';

interface ApplicationTrackerViewProps {
  applications: JobApplication[];
  onAddApplication: (appData: Partial<JobApplication>) => Promise<void>;
  onUpdateApplication: (appId: string, updates: Partial<JobApplication>) => Promise<void>;
  onDeleteApplication: (appId: string) => Promise<void>;
}

const COLUMNS: { id: ApplicationStatus; title: string; color: string }[] = [
  { id: 'SAVED', title: 'Saved Target', color: 'border-slate-700 text-slate-300' },
  { id: 'APPLIED', title: 'Applied', color: 'border-indigo-500/40 text-indigo-300' },
  { id: 'ASSESSMENT', title: 'Tech Assessment', color: 'border-sky-500/40 text-sky-300' },
  { id: 'INTERVIEW', title: 'Interviewing', color: 'border-amber-500/40 text-amber-300' },
  { id: 'OFFER', title: 'Offer Extended', color: 'border-emerald-500/40 text-emerald-300' },
  { id: 'REJECTED', title: 'Closed / Archived', color: 'border-rose-500/30 text-rose-400' },
];

export const ApplicationTrackerView: React.FC<ApplicationTrackerViewProps> = ({
  applications,
  onAddApplication,
  onUpdateApplication,
  onDeleteApplication,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [matchScore, setMatchScore] = useState(88);
  const [status, setStatus] = useState<ApplicationStatus>('APPLIED');
  const [interviewDate, setInterviewDate] = useState('');
  const [notes, setNotes] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !position.trim()) return;
    try {
      await onAddApplication({
        company: company.trim(),
        position: position.trim(),
        matchScore: Number(matchScore),
        status,
        interviewDate: interviewDate || undefined,
        notes: notes.trim() || undefined,
      });
      setCompany('');
      setPosition('');
      setNotes('');
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Kanban className="h-6 w-6 text-indigo-400" />
            Job Application Pipeline Tracker
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Track your job applications across stages from initial outreach to technical screen and final offer.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-500"
        >
          <Plus className="h-4 w-4" />
          Add Application
        </button>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white">Track New Job Application</h2>

            <form onSubmit={handleCreate} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-medium text-slate-300">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Netflix, Stripe, Datadog"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300">Position Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Backend Engineer"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300">Status Stage</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                    className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    {COLUMNS.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300">Match Score (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={matchScore}
                    onChange={(e) => setMatchScore(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300">Upcoming Interview Date</label>
                <input
                  type="date"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300">Notes &amp; Recruiter Contacts</label>
                <textarea
                  rows={2}
                  placeholder="Referral name, salary range, technical topics discussed..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900 p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-slate-800 px-4 py-2 text-xs text-slate-400 hover:bg-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  Track Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colApps = applications.filter((a) => a.status === col.id);
          return (
            <div
              key={col.id}
              className="flex flex-col rounded-2xl border border-slate-800/80 bg-slate-900/40 p-3 min-w-[210px]"
            >
              {/* Column Title */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <span className={`text-xs font-bold tracking-tight ${col.color}`}>
                  {col.title}
                </span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-300">
                  {colApps.length}
                </span>
              </div>

              {/* Cards in Column */}
              <div className="mt-3 flex-1 space-y-2.5 overflow-y-auto">
                {colApps.map((app) => (
                  <div
                    key={app.id}
                    className="group rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 space-y-2 transition hover:border-slate-700 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                          {app.company}
                        </div>
                        <h4 className="text-xs font-bold text-white leading-snug">{app.position}</h4>
                      </div>

                      <button
                        onClick={() => onDeleteApplication(app.id)}
                        className="text-slate-600 opacity-0 transition group-hover:opacity-100 hover:text-rose-400 p-0.5"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>

                    {app.matchScore && (
                      <div className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                        {app.matchScore}% Match
                      </div>
                    )}

                    {app.interviewDate && (
                      <div className="flex items-center gap-1 text-[10px] text-amber-300">
                        <Calendar className="h-3 w-3" />
                        <span>{app.interviewDate}</span>
                      </div>
                    )}

                    {app.notes && (
                      <p className="text-[10px] text-slate-400 line-clamp-2">{app.notes}</p>
                    )}

                    {/* Quick Move Selector */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <select
                        value={app.status}
                        onChange={(e) =>
                          onUpdateApplication(app.id, { status: e.target.value as ApplicationStatus })
                        }
                        className="rounded border border-slate-800 bg-slate-900 px-1.5 py-0.5 text-[10px] text-slate-300 focus:outline-none"
                      >
                        {COLUMNS.map((c) => (
                          <option key={c.id} value={c.id}>
                            Move: {c.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}

                {colApps.length === 0 && (
                  <div className="py-8 text-center text-[11px] text-slate-600">No items</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
