import React, { useState, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  Trophy,
  ArrowRight,
  RefreshCw,
  Award,
  ChevronDown,
  ChevronUp,
  Brain,
  MessageSquare,
} from 'lucide-react';
import { Job, InterviewSession, InterviewQuestion } from '../types.js';
import { apiRequest } from '../lib/api.js';

interface InterviewerViewProps {
  selectedJob: Job | null;
  jobs: Job[];
}

export const InterviewerView: React.FC<InterviewerViewProps> = ({ selectedJob, jobs }) => {
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [sessionsList, setSessionsList] = useState<InterviewSession[]>([]);
  const [isStarting, setIsStarting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);

  // Configuration State for new interview
  const [selectedJobId, setSelectedJobId] = useState<string>(selectedJob?.id || (jobs[0]?.id ?? ''));
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [category, setCategory] = useState('Java, Spring Boot & Distributed Architecture');
  const [totalQuestions, setTotalQuestions] = useState(4);

  // Active answer input
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [showIdealAnswer, setShowIdealAnswer] = useState(false);

  // Fetch past sessions
  useEffect(() => {
    apiRequest<InterviewSession[]>('/interviews')
      .then((data) => {
        setSessionsList(data);
        // If there is an in-progress session, load it
        const active = data.find((s) => s.status === 'IN_PROGRESS');
        if (active) setSession(active);
      })
      .catch(() => {});
  }, []);

  const handleStartInterview = async () => {
    const job = jobs.find((j) => j.id === selectedJobId) || selectedJob;
    setIsStarting(true);
    try {
      const newSession = await apiRequest<InterviewSession>('/interviews', {
        method: 'POST',
        body: JSON.stringify({
          jobId: job?.id,
          jobTitle: job?.title || 'Senior Full Stack Java Engineer',
          company: job?.company || 'Enterprise Systems',
          difficulty,
          category,
          totalQuestions,
        }),
      });
      setSession(newSession);
      setCandidateAnswer('');
      setShowIdealAnswer(false);
      setSessionsList([newSession, ...sessionsList]);
    } catch (err) {
      console.error('Failed to start interview:', err);
    } finally {
      setIsStarting(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!session || !candidateAnswer.trim()) return;
    setIsSubmitting(true);
    try {
      const updated = await apiRequest<InterviewSession>(`/interviews/${session.id}/answer`, {
        method: 'POST',
        body: JSON.stringify({ answer: candidateAnswer }),
      });
      setSession(updated);
    } catch (err) {
      console.error('Failed to submit answer:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = async () => {
    if (!session) return;
    setIsAdvancing(true);
    try {
      const updated = await apiRequest<InterviewSession>(`/interviews/${session.id}/next-question`, {
        method: 'POST',
      });
      setSession(updated);
      setCandidateAnswer('');
      setShowIdealAnswer(false);
    } catch (err) {
      console.error('Failed to advance question:', err);
    } finally {
      setIsAdvancing(false);
    }
  };

  const currentQ: InterviewQuestion | undefined = session?.questions[session.currentQuestionIndex];
  const isCurrentAnswered = Boolean(currentQ?.evaluation);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Bot className="h-6 w-6 text-indigo-400" />
            Adaptive AI Technical Interviewer
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Simulate rigorous multi-round technical interviews powered by Gemini 3.8 Flash. Adapts dynamically to your responses.
          </p>
        </div>

        {session && session.status === 'IN_PROGRESS' && (
          <button
            onClick={() => setSession(null)}
            className="rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs text-slate-300 transition hover:bg-slate-700"
          >
            Switch Session / New Setup
          </button>
        )}
      </div>

      {/* Configuration View (When no active session is running) */}
      {(!session || session.status === 'COMPLETED') && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Brain className="h-5 w-5 text-indigo-400" />
              Configure Practice Session
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-slate-300">Target Role &amp; Company</label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.company} — {j.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300">Technical Category Focus</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="Java, Spring Boot & Distributed Architecture">
                  Java, Spring Boot &amp; Distributed Systems
                </option>
                <option value="Database Design, ACID, Indexing & Hibernate">
                  Database Design, PostgreSQL &amp; JPA/Hibernate
                </option>
                <option value="Concurrency, Thread Safety & JVM Internals">
                  Concurrency, Multi-Threading &amp; JVM Internals
                </option>
                <option value="REST APIs, Microservices & System Security">
                  REST APIs, Microservices &amp; Spring Security (JWT)
                </option>
                <option value="Full Stack React, TypeScript & State Management">
                  Full Stack React, TypeScript &amp; State Management
                </option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300">Interview Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="Beginner">Junior / Mid-Level (Fundamentals)</option>
                <option value="Intermediate">Senior Engineer (Deep Architecture)</option>
                <option value="Advanced">Staff / Principal (Distributed Trade-offs)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300">Questions Count</label>
              <select
                value={totalQuestions}
                onChange={(e) => setTotalQuestions(Number(e.target.value))}
                className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value={3}>3 Questions (Quick Screen - 15 mins)</option>
                <option value={4}>4 Questions (Standard Technical - 25 mins)</option>
                <option value={5}>5 Questions (Comprehensive Loop - 35 mins)</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleStartInterview}
              disabled={isStarting}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500 disabled:opacity-50"
            >
              {isStarting ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {isStarting ? 'Generating First Question with AI...' : 'Launch Live Mock Interview'}
            </button>
          </div>
        </div>
      )}

      {/* Completed Session Verdict Card */}
      {session && session.status === 'COMPLETED' && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-6 space-y-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  Interview Completed
                </span>
                <h2 className="text-xl font-bold text-white">
                  Verdict: {session.verdict?.replace('_', ' ')}
                </h2>
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-black text-emerald-400">{session.overallScore}%</div>
              <div className="text-xs text-slate-400">Composite Interview Score</div>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            {session.feedbackSummary}
          </p>
        </div>
      )}

      {/* Active Question & Answer Arena */}
      {session && session.status === 'IN_PROGRESS' && currentQ && (
        <div className="space-y-6">
          {/* Question Banner */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-indigo-600/20 border border-indigo-500/30 px-2.5 py-1 text-xs font-bold text-indigo-300">
                  Question {currentQ.questionNumber} of {session.totalQuestions}
                </span>
                <span className="text-xs text-slate-400">
                  {session.company} • {session.jobTitle}
                </span>
              </div>
              <span className="rounded bg-slate-800 px-2.5 py-0.5 text-[11px] font-semibold text-slate-300">
                {currentQ.difficulty}
              </span>
            </div>

            <h3 className="text-base font-semibold text-white leading-relaxed pt-1">
              {currentQ.question}
            </h3>
          </div>

          {/* Answer Input Area */}
          {!isCurrentAnswered && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4 text-indigo-400" />
                  Your Technical Answer:
                </label>
                <span className="text-[11px] text-slate-500">
                  Word count: {candidateAnswer.trim() ? candidateAnswer.trim().split(/\s+/).length : 0}
                </span>
              </div>

              <textarea
                rows={7}
                placeholder="Explain the concepts, architectural trade-offs, code patterns, and practical production considerations..."
                value={candidateAnswer}
                onChange={(e) => setCandidateAnswer(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs text-white focus:border-indigo-500 focus:outline-none leading-relaxed"
              />

              <div className="flex justify-end gap-2.5 pt-1">
                <button
                  onClick={handleSubmitAnswer}
                  disabled={isSubmitting || !candidateAnswer.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-500 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {isSubmitting ? 'Evaluating Answer with AI...' : 'Submit Answer for Evaluation'}
                </button>
              </div>
            </div>
          )}

          {/* Answer Evaluation Result Card */}
          {isCurrentAnswered && currentQ.evaluation && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-5">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    AI Senior Staff Evaluation
                  </span>
                  <h4 className="text-lg font-bold text-white mt-0.5">Answer Assessment</h4>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black text-emerald-400">
                    {currentQ.evaluation.overallScore}%
                  </div>
                  <div className="text-[10px] text-slate-400">Question Score</div>
                </div>
              </div>

              {/* 4 Score Breakdown Cards */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center">
                  <div className="text-lg font-bold text-indigo-400">
                    {currentQ.evaluation.technicalAccuracy}%
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Technical Accuracy</div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center">
                  <div className="text-lg font-bold text-sky-400">
                    {currentQ.evaluation.conceptualDepth}%
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Conceptual Depth</div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center">
                  <div className="text-lg font-bold text-emerald-400">
                    {currentQ.evaluation.practicalUnderstanding}%
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Practical Understanding</div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-center">
                  <div className="text-lg font-bold text-purple-400">
                    {currentQ.evaluation.communication}%
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Communication Clarity</div>
                </div>
              </div>

              {/* Feedback */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 text-xs text-slate-300 leading-relaxed">
                <span className="font-bold text-white">Detailed Feedback: </span>
                {currentQ.evaluation.feedback}
              </div>

              {/* Strengths and Improvements */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    Key Strengths Demonstrated:
                  </div>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {currentQ.evaluation.keyStrengths.map((str, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-400">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4" />
                    Areas to Elevate:
                  </div>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {currentQ.evaluation.improvementAreas.map((imp, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-rose-400">•</span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Sample Ideal Answer Dropdown */}
              {currentQ.evaluation.sampleIdealAnswer && (
                <div className="rounded-xl border border-slate-800 bg-slate-950">
                  <button
                    onClick={() => setShowIdealAnswer(!showIdealAnswer)}
                    className="flex w-full items-center justify-between p-3.5 text-xs font-semibold text-indigo-300 hover:text-indigo-200"
                  >
                    <span>View Benchmark Staff-Level Answer</span>
                    {showIdealAnswer ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  {showIdealAnswer && (
                    <div className="p-4 pt-0 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 font-mono whitespace-pre-wrap">
                      {currentQ.evaluation.sampleIdealAnswer}
                    </div>
                  )}
                </div>
              )}

              {/* Next Question Navigation */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleNextQuestion}
                  disabled={isAdvancing}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-500 disabled:opacity-50"
                >
                  {isAdvancing ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                  {session.currentQuestionIndex + 1 < session.totalQuestions
                    ? 'Advance to Adaptive Question ' + (session.currentQuestionIndex + 2)
                    : 'Complete Interview & View Final Report'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
