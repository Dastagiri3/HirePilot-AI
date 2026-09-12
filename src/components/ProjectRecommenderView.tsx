import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';
import { Job, ProjectRecommendation } from '../types.js';
import { apiRequest } from '../lib/api.js';

interface ProjectRecommenderViewProps {
  selectedJob: Job | null;
  setActiveTab: (tab: string) => void;
}

export const ProjectRecommenderView: React.FC<ProjectRecommenderViewProps> = ({
  selectedJob,
  setActiveTab,
}) => {
  const [recommendations, setRecommendations] = useState<ProjectRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedBullet, setCopiedBullet] = useState<string | null>(null);

  useEffect(() => {
    if (selectedJob) {
      apiRequest<ProjectRecommendation[]>(`/ai/recommend-projects/${selectedJob.id}`)
        .then((data) => setRecommendations(data))
        .catch(() => setRecommendations([]));
    }
  }, [selectedJob]);

  const handleGenerate = async () => {
    if (!selectedJob) return;
    setIsLoading(true);
    try {
      const data = await apiRequest<ProjectRecommendation[]>(
        `/ai/recommend-projects/${selectedJob.id}`,
        { method: 'POST' }
      );
      setRecommendations(data);
    } catch (err) {
      console.error('Project recommendation failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBullet(text);
    setTimeout(() => setCopiedBullet(null), 2000);
  };

  if (!selectedJob) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center">
        <FolderGit2 className="mx-auto h-12 w-12 text-slate-600" />
        <h3 className="mt-3 text-lg font-bold text-white">No Target Job Selected</h3>
        <p className="mt-1 text-xs text-slate-400">
          Select a job from Saved Jobs to rank your verified projects for that role.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              {selectedJob.company}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">{selectedJob.title}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-0.5 flex items-center gap-2.5">
            <FolderGit2 className="h-6 w-6 text-sky-400" />
            AI Project Recommender
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Ranks your verified portfolio projects by alignment with {selectedJob.company}&apos;s stack and suggests tailored resume bullets.
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-500 disabled:opacity-50"
        >
          {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {recommendations.length > 0 ? 'Re-Rank Projects' : 'Rank My Projects'}
        </button>
      </div>

      {/* Anti-Hallucination Assurance Banner */}
      <div className="flex items-center gap-2.5 rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-3 text-xs text-slate-300">
        <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
        <span>
          <strong>Anti-Hallucination Enforcement:</strong> Recommendations strictly rank projects from your verified candidate profile. No synthetic technologies or fabricated repo metrics are introduced.
        </span>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center space-y-3">
          <Sparkles className="mx-auto h-8 w-8 text-indigo-400 animate-spin" />
          <h3 className="text-sm font-bold text-white">Analyzing Portfolio Project Relevance...</h3>
          <p className="text-xs text-slate-400">
            Evaluating systems architecture, database models, and concurrency patterns in your projects against {selectedJob.title}.
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && recommendations.length === 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-10 text-center">
          <FolderGit2 className="mx-auto h-10 w-10 text-slate-600" />
          <h3 className="mt-2 text-base font-bold text-white">No Project Rankings Generated Yet</h3>
          <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
            Click &quot;Rank My Projects&quot; to determine which of your projects will make the strongest impression on {selectedJob.company}&apos;s engineering team.
          </p>
          <button
            onClick={handleGenerate}
            className="mt-4 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500"
          >
            Rank Projects Now
          </button>
        </div>
      )}

      {/* Recommendations List */}
      {!isLoading && recommendations.length > 0 && (
        <div className="space-y-4">
          {recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 transition hover:border-slate-700"
            >
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500/20 text-xs font-bold text-sky-400">
                      #{idx + 1}
                    </span>
                    <h3 className="text-base font-bold text-white">{rec.projectName}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-black text-emerald-400">{rec.relevanceScore}%</div>
                    <div className="text-[10px] text-slate-400">Job Relevance</div>
                  </div>
                  <div className="h-8 w-px bg-slate-800" />
                  <div className="flex flex-wrap gap-1">
                    {(rec.matchingTechnologies || rec.relevantTechnologies || []).map((t, tIdx) => (
                      <span
                        key={tIdx}
                        className="rounded bg-indigo-950/40 px-2 py-0.5 text-[10px] font-semibold text-indigo-300 border border-indigo-800/40"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Why it Matters */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-3.5 text-xs">
                <span className="font-bold text-slate-300">Why This Project Fits This Role:</span>
                <p className="mt-1 text-slate-400 leading-relaxed">{rec.whyItMatters || rec.reason}</p>
              </div>

              {/* Suggested Tailored Bullets */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300">
                    ATS-Optimized Bullets for this Application:
                  </span>
                  <span className="text-[11px] text-slate-500">Click copy to add to resume</span>
                </div>

                <div className="space-y-2">
                  {(rec.suggestedBullets || rec.suggestedBulletPoints || []).map((bullet, bIdx) => {
                    const isCopied = copiedBullet === bullet;
                    return (
                      <div
                        key={bIdx}
                        className="flex items-start justify-between gap-3 rounded-xl border border-slate-800/60 bg-slate-950/60 p-3 text-xs text-slate-300 leading-relaxed transition hover:border-slate-700"
                      >
                        <span>• {bullet}</span>
                        <button
                          onClick={() => handleCopy(bullet)}
                          className="shrink-0 text-slate-500 hover:text-indigo-400 p-1"
                          title="Copy bullet"
                        >
                          {isCopied ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
