import React, { useState } from 'react';
import {
  FileCode2,
  Server,
  Database,
  ShieldCheck,
  Play,
  CheckCircle2,
  ExternalLink,
  Code,
  Layers,
} from 'lucide-react';
import { apiRequest } from '../lib/api.js';

export const ApiDocsView: React.FC = () => {
  const [testEndpoint, setTestEndpoint] = useState('/api/health');
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleTestCall = async () => {
    setIsRunning(true);
    setTestResponse(null);
    try {
      const res = await apiRequest(testEndpoint.replace('/api', ''));
      setTestResponse(JSON.stringify(res, null, 2));
    } catch (err: any) {
      setTestResponse(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setIsRunning(false);
    }
  };

  const endpoints = [
    { method: 'GET', path: '/api/health', desc: 'Actuator health & Gemini AI connection check' },
    { method: 'POST', path: '/api/auth/login', desc: 'Authenticate candidate & receive JWT' },
    { method: 'GET', path: '/api/profile', desc: 'Retrieve verified candidate profile & skills' },
    { method: 'GET', path: '/api/jobs', desc: 'List target jobs saved by authenticated user' },
    { method: 'POST', path: '/api/ai/analyze-job/{jobId}', desc: 'Trigger Gemini 3.8 deep match scoring' },
    { method: 'POST', path: '/api/ai/recommend-projects/{jobId}', desc: 'Rank verified portfolio projects' },
    { method: 'POST', path: '/api/ai/generate-resume/{jobId}', desc: 'Synthesize ATS tailored Markdown' },
    { method: 'POST', path: '/api/interviews', desc: 'Initialize adaptive mock interview session' },
    { method: 'POST', path: '/api/interviews/{id}/answer', desc: 'Submit answer for multi-axis evaluation' },
    { method: 'GET', path: '/api/applications', desc: 'Fetch user applications for Kanban tracking' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <FileCode2 className="h-6 w-6 text-indigo-400" />
          Enterprise System Architecture &amp; REST API
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Complete OpenAPI 3.0 specification, Spring Boot 3 modular monolith design, and PostgreSQL schema architecture.
        </p>
      </div>

      {/* Live Interactive API Tester */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Server className="h-4 w-4 text-emerald-400" />
          Live Endpoint Sandbox
        </h2>
        <p className="text-xs text-slate-400">
          Execute live REST requests against the running container backend to verify JWT tokens and responses.
        </p>

        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            value={testEndpoint}
            onChange={(e) => setTestEndpoint(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:outline-none"
          >
            <option value="/api/health">GET /api/health</option>
            <option value="/api/profile">GET /api/profile (JWT Protected)</option>
            <option value="/api/jobs">GET /api/jobs (User Isolated)</option>
            <option value="/api/applications">GET /api/applications</option>
            <option value="/api/dashboard">GET /api/dashboard</option>
          </select>

          <button
            onClick={handleTestCall}
            disabled={isRunning}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition hover:bg-indigo-500 disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            {isRunning ? 'Executing...' : 'Send Request'}
          </button>
        </div>

        {testResponse && (
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-emerald-300 max-h-64 overflow-y-auto">
            <pre>{testResponse}</pre>
          </div>
        )}
      </div>

      {/* REST API Endpoints Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Code className="h-4 w-4 text-sky-400" />
          REST Endpoints Specification
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 text-[11px] font-bold uppercase text-slate-400">
              <tr>
                <th className="pb-3 pr-4">Method</th>
                <th className="pb-3 pr-4">Endpoint</th>
                <th className="pb-3">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {endpoints.map((ep, idx) => (
                <tr key={idx} className="hover:bg-slate-950/40">
                  <td className="py-2.5 pr-4">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                        ep.method === 'GET'
                          ? 'bg-sky-500/10 text-sky-400'
                          : 'bg-emerald-500/10 text-emerald-400'
                      }`}
                    >
                      {ep.method}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 font-bold text-slate-200">{ep.path}</td>
                  <td className="py-2.5 font-sans text-slate-400">{ep.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Architecture & PostgreSQL Spec */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="h-4 w-4 text-indigo-400" />
            Spring Boot 3 Architecture
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            The Java backend is structured into domain packages adhering to clean architecture:
          </p>
          <ul className="space-y-1.5 text-xs text-slate-300 font-mono">
            <li>• <span className="text-indigo-400">com.hirepilot.security</span>: Stateless JWT &amp; BCrypt</li>
            <li>• <span className="text-indigo-400">com.hirepilot.profile</span>: CandidateProfile JPA Entities</li>
            <li>• <span className="text-indigo-400">com.hirepilot.jobs</span>: Job Management &amp; Scored Roles</li>
            <li>• <span className="text-indigo-400">com.hirepilot.ai</span>: AIService, PromptService &amp; Guardrails</li>
            <li>• <span className="text-indigo-400">com.hirepilot.interview</span>: Adaptive Mock Interview loop</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Database className="h-4 w-4 text-amber-400" />
            PostgreSQL Relational Schema
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Normalized relational database structure ensuring referential integrity and user isolation:
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[
              'users',
              'candidate_profiles',
              'skills',
              'candidate_skills',
              'projects',
              'education',
              'jobs',
              'job_analysis',
              'skill_gaps',
              'applications',
              'interview_sessions',
              'interview_questions',
              'interview_answers',
              'resume_versions',
              'cover_letters',
              'learning_plans',
            ].map((tbl, idx) => (
              <span
                key={idx}
                className="rounded bg-slate-950 px-2 py-0.5 text-[11px] font-mono text-slate-300 border border-slate-800"
              >
                {tbl}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
