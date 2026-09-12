import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Star,
  ExternalLink,
  Target,
  FileText,
  Bot,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { Job } from '../types.js';

interface JobsViewProps {
  jobs: Job[];
  selectedJob: Job | null;
  onSelectJob: (job: Job) => void;
  onAddJob: (jobData: Partial<Job>) => Promise<void>;
  onDeleteJob: (jobId: string) => Promise<void>;
  onToggleFavorite: (jobId: string) => Promise<void>;
  setActiveTab: (tab: string) => void;
}

export const JobsView: React.FC<JobsViewProps> = ({
  jobs,
  selectedJob,
  onSelectJob,
  onAddJob,
  onDeleteJob,
  onToggleFavorite,
  setActiveTab,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Job Form State
  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('Remote');
  const [employmentType, setEmploymentType] = useState('Full-time');
  const [description, setDescription] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredJobs = jobs.filter((j) => {
    const term = searchTerm.toLowerCase();
    return (
      j.company.toLowerCase().includes(term) ||
      j.title.toLowerCase().includes(term) ||
      j.description.toLowerCase().includes(term)
    );
  });

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !title.trim() || !description.trim()) return;
    setIsSubmitting(true);
    try {
      await onAddJob({
        company: company.trim(),
        title: title.trim(),
        location: location.trim(),
        employmentType,
        description: description.trim(),
        sourceUrl: sourceUrl.trim(),
      });
      setCompany('');
      setTitle('');
      setDescription('');
      setSourceUrl('');
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Briefcase className="h-6 w-6 text-indigo-400" />
            Target Job Postings ({jobs.length})
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Track software engineering opportunities, run deep gap analysis, and generate tailored materials.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-500"
        >
          <Plus className="h-4 w-4" />
          Add Job Description
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Filter jobs by company, role (e.g. Stripe, Java, Kafka)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-slate-800 bg-slate-900/60 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
        />
      </div>

      {/* Add Job Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white">Add Target Job Posting</h2>
            <p className="text-xs text-slate-400 mt-1">
              Paste the full job description to enable deep AI semantic analysis and resume targeting.
            </p>

            <form onSubmit={handleCreateJob} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-slate-300">Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stripe, Amazon, Brex"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300">Job Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Full Stack Java Engineer"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-slate-300">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Remote (US) / San Francisco, CA"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300">Employment Type</label>
                  <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Part-time">Part-time</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300">Job Description (Full text) *</label>
                <textarea
                  required
                  rows={6}
                  placeholder="Paste the requirements, responsibilities, and qualifications..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900 p-3 text-xs text-white focus:border-indigo-500 focus:outline-none leading-relaxed font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300">Posting URL</label>
                <input
                  type="url"
                  placeholder="https://jobs.company.com/..."
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
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
                  disabled={isSubmitting}
                  className="rounded-lg bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Job Posting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Jobs List */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredJobs.map((job) => {
          const isSelected = selectedJob?.id === job.id;
          return (
            <div
              key={job.id}
              className={`flex flex-col justify-between rounded-2xl border p-5 transition ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-950/20 shadow-xl shadow-indigo-950/40'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                      {job.company}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-0.5 line-clamp-1">{job.title}</h3>
                  </div>

                  <button
                    onClick={() => onToggleFavorite(job.id)}
                    className={`p-1 transition ${
                      job.isFavorite ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'
                    }`}
                  >
                    <Star className="h-4 w-4 fill-current" />
                  </button>
                </div>

                <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                  <span>{job.location}</span>
                  <span>•</span>
                  <span>{job.employmentType}</span>
                </div>

                {job.matchScore && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-400 h-full rounded-full"
                        style={{ width: `${job.matchScore}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-emerald-400">{job.matchScore}% match</span>
                  </div>
                )}

                <p className="mt-3 text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {job.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 space-y-2 pt-4 border-t border-slate-800/80">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      onSelectJob(job);
                      setActiveTab('analyzer');
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 py-1.5 text-xs font-semibold text-indigo-300 transition hover:bg-indigo-600 hover:text-white"
                  >
                    <Target className="h-3.5 w-3.5" />
                    AI Analyze
                  </button>
                  <button
                    onClick={() => {
                      onSelectJob(job);
                      setActiveTab('interview');
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-700"
                  >
                    <Bot className="h-3.5 w-3.5 text-indigo-400" />
                    Interview
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <button
                    onClick={() => onSelectJob(job)}
                    className={`text-[11px] font-medium transition ${
                      isSelected ? 'text-indigo-400 font-bold' : 'hover:text-slate-300'
                    }`}
                  >
                    {isSelected ? '✓ Active Target' : 'Set as Focus'}
                  </button>

                  <button
                    onClick={() => onDeleteJob(job.id)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                    title="Delete Job"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
