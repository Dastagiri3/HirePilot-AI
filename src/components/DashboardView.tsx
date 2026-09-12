import React from 'react';
import {
  Send,
  Calendar,
  Trophy,
  Target,
  ArrowUpRight,
  Briefcase,
  Bot,
  FileText,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { CandidateProfile, Job, JobApplication } from '../types.js';

interface DashboardViewProps {
  profile: CandidateProfile | null;
  jobs: Job[];
  applications: JobApplication[];
  selectedJob: Job | null;
  onSelectJob: (job: Job) => void;
  setActiveTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  jobs,
  applications,
  selectedJob,
  onSelectJob,
  setActiveTab,
}) => {
  const totalApps = applications.length;
  const interviews = applications.filter((a) => a.status === 'INTERVIEW').length;
  const offers = applications.filter((a) => a.status === 'OFFER').length;
  const scoredJobs = jobs.filter((j) => typeof j.matchScore === 'number');
  const avgMatch = scoredJobs.length > 0
    ? Math.round(scoredJobs.reduce((acc, j) => acc + (j.matchScore || 0), 0) / scoredJobs.length)
    : 88;

  const upcomingInterviews = applications.filter((a) => a.interviewDate);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 shadow-xl">
        <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Active Target: {selectedJob ? `${selectedJob.title} at ${selectedJob.company}` : 'Senior Full Stack Java Engineer'}
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Welcome back, {profile?.name || 'Engineer'}
            </h1>
            <p className="mt-1 text-sm text-slate-300 max-w-2xl">
              Your profile is matched against {jobs.length} target roles. Your average match score is{' '}
              <span className="font-semibold text-emerald-400">{avgMatch}%</span>. Prepare for upcoming technical interviews or tailor your resume.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setActiveTab('analyzer')}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500"
            >
              <Target className="h-4 w-4" />
              Analyze Job
            </button>
            <button
              onClick={() => setActiveTab('interview')}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
            >
              <Bot className="h-4 w-4 text-indigo-400" />
              Practice Interview
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Applications</span>
            <Send className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{totalApps}</div>
          <p className="mt-1 text-[11px] text-slate-400">Across target pipelines</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Interviews</span>
            <Calendar className="h-4 w-4 text-sky-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{interviews}</div>
          <p className="mt-1 text-[11px] text-emerald-400 font-medium">Active screening</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Avg Match Score</span>
            <Target className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{avgMatch}%</div>
          <p className="mt-1 text-[11px] text-slate-400">ATS verified match</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Offers</span>
            <Trophy className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{offers}</div>
          <p className="mt-1 text-[11px] text-amber-400 font-medium">Final stage</p>
        </div>
      </div>

      {/* Main Grid: Target Jobs & Action Hub */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Target Jobs with Instant AI Analysis */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-indigo-400" />
              Target Jobs &amp; Alignment
            </h2>
            <button
              onClick={() => setActiveTab('jobs')}
              className="text-xs font-medium text-indigo-400 hover:underline inline-flex items-center gap-1"
            >
              View all ({jobs.length}) <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-3">
            {jobs.slice(0, 3).map((job) => {
              const isSelected = selectedJob?.id === job.id;
              return (
                <div
                  key={job.id}
                  className={`rounded-xl border p-4 transition ${
                    isSelected
                      ? 'border-indigo-500/60 bg-indigo-950/20 shadow-lg shadow-indigo-950/40'
                      : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm">{job.title}</span>
                        {isSelected && (
                          <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-300">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {job.company} • {job.location} • {job.employmentType}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {job.matchScore && (
                        <div className="text-right">
                          <div className="text-sm font-bold text-emerald-400">
                            {job.matchScore}%
                          </div>
                          <div className="text-[10px] text-slate-400">Match Score</div>
                        </div>
                      )}

                      <div className="flex gap-1.5">
                        <button
                          onClick={() => {
                            onSelectJob(job);
                            setActiveTab('analyzer');
                          }}
                          className="rounded-lg bg-indigo-600/20 border border-indigo-500/30 px-3 py-1.5 text-xs font-medium text-indigo-300 transition hover:bg-indigo-600 hover:text-white"
                        >
                          Analyze
                        </button>
                        <button
                          onClick={() => {
                            onSelectJob(job);
                            setActiveTab('interview');
                          }}
                          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-700"
                        >
                          Interview
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {job.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Skill Gaps & Alerts */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-sky-400" />
            Priority Missing Skills
          </h2>

          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
            <p className="text-xs text-slate-400">
              Identified across high-paying Java Full Stack postings in your pipeline:
            </p>
            <div className="space-y-2">
              {[
                { name: 'Docker & Multi-Stage Containers', gap: 'High', hours: '4 hrs' },
                { name: 'Kubernetes Pod Networking', gap: 'High', hours: '6 hrs' },
                { name: 'AWS DynamoDB / RDS Architecture', gap: 'Medium', hours: '5 hrs' },
                { name: 'Apache Kafka Event Streaming', gap: 'High', hours: '8 hrs' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-950/40 p-2.5 text-xs"
                >
                  <div>
                    <div className="font-medium text-slate-200">{item.name}</div>
                    <div className="text-[10px] text-slate-400">Est. study: {item.hours}</div>
                  </div>
                  <span className="rounded bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-400 border border-rose-500/20">
                    {item.gap} Priority
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveTab('learning-plan')}
              className="w-full mt-2 rounded-lg border border-slate-700 bg-slate-800 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
            >
              Generate Skill Study Plan
            </button>
          </div>

          {/* Upcoming Interviews Widget */}
          {upcomingInterviews.length > 0 && (
            <div className="rounded-xl border border-sky-500/20 bg-sky-950/20 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-sky-400">
                <Calendar className="h-4 w-4" />
                Scheduled Technical Screen
              </div>
              <div className="mt-2 text-xs text-slate-300">
                <span className="font-semibold text-white">{upcomingInterviews[0].company}</span> —{' '}
                {upcomingInterviews[0].position}
              </div>
              <div className="mt-1 text-[11px] text-sky-300 font-mono">
                Date: {upcomingInterviews[0].interviewDate}
              </div>
              <button
                onClick={() => setActiveTab('interview')}
                className="mt-3 w-full rounded-lg bg-sky-600 py-1.5 text-xs font-semibold text-white transition hover:bg-sky-500"
              >
                Run Practice Session
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
