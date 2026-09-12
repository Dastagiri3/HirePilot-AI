import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Sparkles,
  Clock,
  Code2,
  HelpCircle,
  RefreshCw,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { Job, LearningPlan } from '../types.js';
import { apiRequest } from '../lib/api.js';

interface LearningPlanViewProps {
  selectedJob: Job | null;
}

export const LearningPlanView: React.FC<LearningPlanViewProps> = ({ selectedJob }) => {
  const [plan, setPlan] = useState<LearningPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedJob) {
      apiRequest<LearningPlan>(`/ai/generate-learning-plan/${selectedJob.id}`)
        .then((data) => setPlan(data))
        .catch(() => setPlan(null));
    }
  }, [selectedJob]);

  const handleGenerate = async () => {
    if (!selectedJob) return;
    setIsLoading(true);
    try {
      const data = await apiRequest<LearningPlan>(
        `/ai/generate-learning-plan/${selectedJob.id}`,
        { method: 'POST' }
      );
      setPlan(data);
    } catch (err) {
      console.error('Failed to generate learning plan:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedJob) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center">
        <GraduationCap className="mx-auto h-12 w-12 text-slate-600" />
        <h3 className="mt-3 text-lg font-bold text-white">No Target Job Selected</h3>
        <p className="mt-1 text-xs text-slate-400">
          Select a job from Saved Jobs to build a targeted learning path for missing requirements.
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
            <GraduationCap className="h-6 w-6 text-emerald-400" />
            Personalized Skill Gap Learning Plan
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            A concrete action plan with practical projects and interview questions to rapidly bridge skill gaps for this role.
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-500 disabled:opacity-50"
        >
          {isLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {plan ? 'Regenerate Curriculum' : 'Build Learning Plan'}
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center space-y-3">
          <Sparkles className="mx-auto h-8 w-8 text-indigo-400 animate-spin" />
          <h3 className="text-sm font-bold text-white">Curating Architectural Learning Track...</h3>
          <p className="text-xs text-slate-400">
            Structuring curriculum topics, estimating study hours, and framing hands-on verification tasks.
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !plan && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-10 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-slate-600" />
          <h3 className="mt-2 text-base font-bold text-white">No Learning Plan Built Yet</h3>
          <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
            Click &quot;Build Learning Plan&quot; to synthesize missing skills identified in your job match analysis into a high-yield study plan.
          </p>
          <button
            onClick={handleGenerate}
            className="mt-4 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500"
          >
            Generate Learning Track
          </button>
        </div>
      )}

      {/* Plan Items */}
      {!isLoading && plan && (
        <div className="space-y-4">
          {plan.items.map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 transition hover:border-slate-700"
            >
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-xs font-bold text-emerald-400">
                    {idx + 1}
                  </span>
                  <h3 className="text-base font-bold text-white">{item.skillName}</h3>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                      item.priority === 'HIGH'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {item.priority} PRIORITY
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock className="h-3.5 w-3.5 text-sky-400" />
                  <span>Est: {item.estimatedHours}</span>
                </div>
              </div>

              {/* Why it Matters */}
              <div className="text-xs text-slate-300 leading-relaxed">
                <span className="font-semibold text-slate-200">Role Context: </span>
                {item.whyItMatters}
              </div>

              {/* Topics to Study */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5 space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Core Topics to Master:
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.topics.map((t, tIdx) => (
                    <span
                      key={tIdx}
                      className="rounded bg-slate-900 px-2.5 py-1 text-xs font-medium text-slate-200 border border-slate-800"
                    >
                      • {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Practice Task */}
              <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-3.5 space-y-1">
                <div className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <Code2 className="h-4 w-4" />
                  Hands-on Portfolio Task:
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pl-5.5">
                  {item.practiceTask}
                </p>
              </div>

              {/* Typical Interview Questions */}
              {item.interviewQuestions && item.interviewQuestions.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <HelpCircle className="h-3.5 w-3.5 text-sky-400" />
                    Probable Interview Questions:
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-xs text-slate-400 leading-relaxed">
                    {item.interviewQuestions.map((q, qIdx) => (
                      <li key={qIdx}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
