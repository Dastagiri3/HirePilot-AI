import React, { useState, useEffect } from 'react';
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  Download,
  ShieldCheck,
  RefreshCw,
  Mail,
} from 'lucide-react';
import { Job, TailoredResume, CoverLetter } from '../types.js';
import { apiRequest } from '../lib/api.js';

interface ResumeCopilotViewProps {
  selectedJob: Job | null;
}

export const ResumeCopilotView: React.FC<ResumeCopilotViewProps> = ({ selectedJob }) => {
  const [activeSubTab, setActiveSubTab] = useState<'resume' | 'cover-letter'>('resume');
  const [resume, setResume] = useState<TailoredResume | null>(null);
  const [coverLetter, setCoverLetter] = useState<CoverLetter | null>(null);
  const [isLoadingResume, setIsLoadingResume] = useState(false);
  const [isLoadingLetter, setIsLoadingLetter] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (selectedJob) {
      apiRequest<TailoredResume>(`/ai/generate-resume/${selectedJob.id}`)
        .then((data) => setResume(data))
        .catch(() => setResume(null));

      apiRequest<CoverLetter>(`/ai/generate-cover-letter/${selectedJob.id}`)
        .then((data) => setCoverLetter(data))
        .catch(() => setCoverLetter(null));
    }
  }, [selectedJob]);

  const handleGenerateResume = async () => {
    if (!selectedJob) return;
    setIsLoadingResume(true);
    try {
      const data = await apiRequest<TailoredResume>(`/ai/generate-resume/${selectedJob.id}`, {
        method: 'POST',
      });
      setResume(data);
    } catch (err) {
      console.error('Resume generation failed:', err);
    } finally {
      setIsLoadingResume(false);
    }
  };

  const handleGenerateLetter = async () => {
    if (!selectedJob) return;
    setIsLoadingLetter(true);
    try {
      const data = await apiRequest<CoverLetter>(
        `/ai/generate-cover-letter/${selectedJob.id}`,
        { method: 'POST' }
      );
      setCoverLetter(data);
    } catch (err) {
      console.error('Cover letter failed:', err);
    } finally {
      setIsLoadingLetter(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!selectedJob) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center">
        <FileText className="mx-auto h-12 w-12 text-slate-600" />
        <h3 className="mt-3 text-lg font-bold text-white">No Target Job Selected</h3>
        <p className="mt-1 text-xs text-slate-400">
          Select a job from Saved Jobs to tailor your ATS resume and cover letter.
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
            <FileText className="h-6 w-6 text-indigo-400" />
            ATS Resume &amp; Cover Letter Copilot
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Re-prioritizes your verified candidate experiences to maximize ATS keyword scores and interview callbacks.
          </p>
        </div>

        {/* Subtab Switcher */}
        <div className="flex rounded-xl border border-slate-800 bg-slate-900/80 p-1">
          <button
            onClick={() => setActiveSubTab('resume')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              activeSubTab === 'resume'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            Tailored Resume
          </button>
          <button
            onClick={() => setActiveSubTab('cover-letter')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              activeSubTab === 'cover-letter'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mail className="h-3.5 w-3.5" />
            Targeted Cover Letter
          </button>
        </div>
      </div>

      {/* Hallucination Safety Banner */}
      <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3 text-xs text-slate-300">
        <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
        <span>
          <strong>Strict Anti-Hallucination Policy:</strong> All bullet points, dates, and educational credentials reflect verified profile data only.
        </span>
      </div>

      {/* Content: Resume */}
      {activeSubTab === 'resume' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">ATS-Optimized Markdown Resume</span>
              {resume && (
                <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                  Ready for Submission
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerateResume}
                disabled={isLoadingResume}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-500 disabled:opacity-50"
              >
                {isLoadingResume ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                {resume ? 'Regenerate Resume' : 'Generate Tailored Resume'}
              </button>

              {resume && (
                <>
                  <button
                    onClick={() => handleCopy(resume.markdownContent)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    onClick={() =>
                      handleDownload(
                        resume.markdownContent,
                        `resume-${selectedJob.company.toLowerCase().replace(/\s+/g, '-')}.md`
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download .md
                  </button>
                </>
              )}
            </div>
          </div>

          {resume?.atsKeywords && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Target ATS Keywords Included in this Resume:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {resume.atsKeywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="rounded bg-indigo-950/40 px-2 py-0.5 text-[11px] font-medium text-indigo-300 border border-indigo-800/40"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Resume Viewer / Editor */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-inner">
            {isLoadingResume ? (
              <div className="py-16 text-center space-y-3">
                <Sparkles className="mx-auto h-8 w-8 text-indigo-400 animate-spin" />
                <p className="text-xs text-slate-400">Synthesizing ATS-targeted resume bullets...</p>
              </div>
            ) : resume ? (
              <textarea
                rows={20}
                value={resume.markdownContent}
                onChange={(e) => setResume({ ...resume, markdownContent: e.target.value })}
                className="w-full bg-transparent font-mono text-xs text-slate-300 focus:outline-none leading-relaxed resize-y"
              />
            ) : (
              <div className="py-16 text-center text-xs text-slate-500">
                Click &quot;Generate Tailored Resume&quot; to synthesize your experience specifically for {selectedJob.company}.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content: Cover Letter */}
      {activeSubTab === 'cover-letter' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Tailored Cover Letter</span>
              {coverLetter && (
                <span className="rounded bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold text-sky-400 border border-sky-500/20">
                  Ready to Send
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerateLetter}
                disabled={isLoadingLetter}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-500 disabled:opacity-50"
              >
                {isLoadingLetter ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                {coverLetter ? 'Regenerate Letter' : 'Generate Cover Letter'}
              </button>

              {coverLetter && (
                <button
                  onClick={() => handleCopy(coverLetter.content)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-inner">
            {isLoadingLetter ? (
              <div className="py-16 text-center space-y-3">
                <Sparkles className="mx-auto h-8 w-8 text-indigo-400 animate-spin" />
                <p className="text-xs text-slate-400">Crafting targeted cover letter...</p>
              </div>
            ) : coverLetter ? (
              <textarea
                rows={16}
                value={coverLetter.content}
                onChange={(e) => setCoverLetter({ ...coverLetter, content: e.target.value })}
                className="w-full bg-transparent text-xs text-slate-200 focus:outline-none leading-relaxed resize-y font-sans"
              />
            ) : (
              <div className="py-16 text-center text-xs text-slate-500">
                Click &quot;Generate Cover Letter&quot; to draft a concise, persuasive message explaining your architectural fit for {selectedJob.company}.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
