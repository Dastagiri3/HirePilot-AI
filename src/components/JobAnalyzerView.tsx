import React, { useState, useEffect } from 'react';
import {
  FileSearch,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  RefreshCw,
  FolderGit2,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';
import { Job, JobAnalysis } from '../types.js';
import { apiRequest } from '../lib/api.js';

interface JobAnalyzerViewProps {
  selectedJob: Job | null;
  jobs: Job[];
  onSelectJob: (job: Job) => void;
  setActiveTab: (tab: string) => void;
}

export const JobAnalyzerView: React.FC<JobAnalyzerViewProps> = ({
  selectedJob,
  jobs,
  onSelectJob,
  setActiveTab,
}) => {
  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedJob) {
      // Try to load cached analysis
      apiRequest<JobAnalysis>(`/analysis/${selectedJob.id}`)
        .then((data) => {
          setAnalysis(data);
          setError(null);
        })
        .catch(() => {
          // No cached analysis yet
          setAnalysis(null);
        });
    }
  }, [selectedJob]);

  const handleRunAnalysis = async () => {
    if (!selectedJob) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiRequest<JobAnalysis>(`/ai/analyze-job/${selectedJob.id}`, {
        method: 'POST',
      });
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Please check Gemini API key or connection.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedJob) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center">
        <FileSearch className="mx-auto h-12 w-12 text-slate-600" />
        <h3 className="mt-3 text-lg font-bold text-white">No Target Job Selected</h3>
        <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
          Please select or add a target job from the Jobs tab to run AI semantic match and gap analysis.
        </p>
        <button
          onClick={() => setActiveTab('jobs')}
          className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500"
        >
          Select a Target Job
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Target Switcher */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              {selectedJob.company}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">{selectedJob.location}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-0.5">
            {selectedJob.title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedJob.id}
            onChange={(e) => {
              const j = jobs.find((x) => x.id === e.target.value);
              if (j) onSelectJob(j);
            }}
            className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
          >
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.company} — {j.title}
              </option>
            ))}
          </select>

          <button
            onClick={handleRunAnalysis}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-500 disabled:opacity-50"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {analysis ? 'Re-Analyze with AI' : 'Run AI Analysis'}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-3 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Loading State Animation */}
      {isLoading && (
        <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-8 text-center space-y-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/30 text-indigo-400 shadow-inner animate-pulse">
            <Sparkles className="h-6 w-6 animate-spin" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Running Deep Semantic Alignment...</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Gemini 3.8 Flash is comparing your verified technologies, architectural projects, and experience against the requirements of {selectedJob.company}.
            </p>
          </div>
          <div className="flex justify-center gap-6 text-[11px] text-slate-400 pt-2">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Ground-truth validation
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" /> Zero hallucination guard
            </span>
          </div>
        </div>
      )}

      {/* Analysis Results Display */}
      {!isLoading && analysis && (
        <div className="space-y-6">
          {/* Match Score Matrix */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 text-center">
              <div className="text-3xl font-black text-emerald-400">{analysis.overallMatch}%</div>
              <div className="mt-1 text-xs font-semibold text-white">Overall Match</div>
              <div className="text-[10px] text-emerald-300/70 mt-0.5">ATS Composite Score</div>
            </div>

            <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-5 text-center">
              <div className="text-3xl font-black text-indigo-400">{analysis.technicalMatch}%</div>
              <div className="mt-1 text-xs font-semibold text-white">Technical Match</div>
              <div className="text-[10px] text-indigo-300/70 mt-0.5">Languages &amp; Stacks</div>
            </div>

            <div className="rounded-2xl border border-sky-500/30 bg-sky-950/20 p-5 text-center">
              <div className="text-3xl font-black text-sky-400">{analysis.experienceMatch}%</div>
              <div className="mt-1 text-xs font-semibold text-white">Experience Match</div>
              <div className="text-[10px] text-sky-300/70 mt-0.5">Years &amp; Seniority</div>
            </div>

            <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-5 text-center">
              <div className="text-3xl font-black text-purple-400">{analysis.educationMatch}%</div>
              <div className="mt-1 text-xs font-semibold text-white">Education Match</div>
              <div className="text-[10px] text-purple-300/70 mt-0.5">Degrees &amp; Credentials</div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              Executive Alignment Analysis
            </h3>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">{analysis.summary}</p>
          </div>

          {/* Skill Breakdown: Strong vs Missing */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Strong Matches */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3">
              <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Strong Technical Matches ({analysis.strongMatches.length})
              </h3>
              <p className="text-xs text-slate-400">
                Skills where your verified candidate background strongly exceeds requirements:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {analysis.strongMatches.map((skill, idx) => (
                  <span
                    key={idx}
                    className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 px-3 py-1 text-xs font-semibold text-emerald-300"
                  >
                    ✓ {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Required & Preferred Skills */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Missing Required Skills ({analysis.missingRequiredSkills.length})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  High-priority gaps that could trigger ATS keyword rejection:
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {analysis.missingRequiredSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="rounded-lg border border-rose-500/30 bg-rose-950/30 px-3 py-1 text-xs font-semibold text-rose-300 flex items-center gap-1.5"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {analysis.missingPreferredSkills.length > 0 && (
                <div className="pt-2 border-t border-slate-800">
                  <h4 className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Preferred / Nice-to-Have Skills ({analysis.missingPreferredSkills.length})
                  </h4>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {analysis.missingPreferredSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="rounded-lg border border-amber-500/30 bg-amber-950/30 px-2.5 py-1 text-[11px] font-medium text-amber-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Strategic Recommendations */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-400" />
              Strategic Recommendations to Win the Interview
            </h3>
            <ul className="space-y-2.5">
              {analysis.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600/30 text-[10px] font-bold text-indigo-400">
                    {idx + 1}
                  </span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>

            {/* Quick Action Navigation */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setActiveTab('recommender')}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 px-4 py-2 text-xs font-semibold text-indigo-300 transition hover:bg-indigo-600 hover:text-white"
              >
                <FolderGit2 className="h-4 w-4" />
                Rank Verified Projects for this Role
              </button>
              <button
                onClick={() => setActiveTab('learning-plan')}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
              >
                <GraduationCap className="h-4 w-4 text-emerald-400" />
                Generate Learning Plan for Missing Skills
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State when no analysis yet */}
      {!isLoading && !analysis && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-10 text-center">
          <FileSearch className="mx-auto h-10 w-10 text-indigo-400/60" />
          <h3 className="mt-3 text-base font-bold text-white">Ready for AI Analysis</h3>
          <p className="mt-1 text-xs text-slate-400 max-w-md mx-auto">
            Click &quot;Run AI Analysis&quot; to evaluate your profile against {selectedJob.title} at {selectedJob.company}.
          </p>
          <button
            onClick={handleRunAnalysis}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500"
          >
            <Sparkles className="h-4 w-4" />
            Analyze Alignment Now
          </button>
        </div>
      )}
    </div>
  );
};
