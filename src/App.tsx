import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.js';
import { Sidebar } from './components/Sidebar.js';
import { DashboardView } from './components/DashboardView.js';
import { ProfileView } from './components/ProfileView.js';
import { JobsView } from './components/JobsView.js';
import { JobAnalyzerView } from './components/JobAnalyzerView.js';
import { ProjectRecommenderView } from './components/ProjectRecommenderView.js';
import { ResumeCopilotView } from './components/ResumeCopilotView.js';
import { LearningPlanView } from './components/LearningPlanView.js';
import { InterviewerView } from './components/InterviewerView.js';
import { ApplicationTrackerView } from './components/ApplicationTrackerView.js';
import { ApiDocsView } from './components/ApiDocsView.js';
import { AuthModal } from './components/AuthModal.js';
import { User, CandidateProfile, Job, JobApplication } from './types.js';
import { apiRequest, getStoredToken, setStoredToken, removeStoredToken } from './lib/api.js';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // Initial Load: Authenticate and fetch core domain data
  useEffect(() => {
    async function init() {
      try {
        let token = getStoredToken();
        // If no token stored yet, auto-login with demo candidate for instant preview
        if (!token) {
          const authRes = await apiRequest<{ token: string; user: User }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({
              email: 'alex.chen@hirepilot.dev',
              password: 'password123',
            }),
          });
          token = authRes.token;
          setStoredToken(token);
          setUser(authRes.user);
        } else {
          const me = await apiRequest<User>('/auth/me');
          setUser(me);
        }

        // Fetch User's candidate profile, jobs, and applications in parallel
        const [profileData, jobsData, appsData] = await Promise.all([
          apiRequest<CandidateProfile>('/profile'),
          apiRequest<Job[]>('/jobs'),
          apiRequest<JobApplication[]>('/applications'),
        ]);

        setProfile(profileData);
        setJobs(jobsData);
        setApplications(appsData);

        if (jobsData.length > 0) {
          setSelectedJob(jobsData[0]);
        }
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setIsInitializing(false);
      }
    }

    init();
  }, []);

  const handleLogout = () => {
    removeStoredToken();
    setUser(null);
    setIsAuthOpen(true);
  };

  const handleAuthSuccess = async (authenticatedUser: User) => {
    setUser(authenticatedUser);
    try {
      const [profileData, jobsData, appsData] = await Promise.all([
        apiRequest<CandidateProfile>('/profile'),
        apiRequest<Job[]>('/jobs'),
        apiRequest<JobApplication[]>('/applications'),
      ]);
      setProfile(profileData);
      setJobs(jobsData);
      setApplications(appsData);
      if (jobsData.length > 0) {
        setSelectedJob(jobsData[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = async (updated: Partial<CandidateProfile>) => {
    const res = await apiRequest<CandidateProfile>('/profile', {
      method: 'PUT',
      body: JSON.stringify(updated),
    });
    setProfile(res);
  };

  const handleAddJob = async (jobData: Partial<Job>) => {
    const newJob = await apiRequest<Job>('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
    const updated = [newJob, ...jobs];
    setJobs(updated);
    setSelectedJob(newJob);
  };

  const handleDeleteJob = async (jobId: string) => {
    await apiRequest(`/jobs/${jobId}`, { method: 'DELETE' });
    const updated = jobs.filter((j) => j.id !== jobId);
    setJobs(updated);
    if (selectedJob?.id === jobId) {
      setSelectedJob(updated[0] || null);
    }
  };

  const handleToggleFavorite = async (jobId: string) => {
    const updated = await apiRequest<Job>(`/jobs/${jobId}/favorite`, { method: 'POST' });
    setJobs(jobs.map((j) => (j.id === jobId ? updated : j)));
    if (selectedJob?.id === jobId) {
      setSelectedJob(updated);
    }
  };

  const handleAddApplication = async (appData: Partial<JobApplication>) => {
    const newApp = await apiRequest<JobApplication>('/applications', {
      method: 'POST',
      body: JSON.stringify(appData),
    });
    setApplications([newApp, ...applications]);
  };

  const handleUpdateApplication = async (appId: string, updates: Partial<JobApplication>) => {
    const updated = await apiRequest<JobApplication>(`/applications/${appId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    setApplications(applications.map((a) => (a.id === appId ? updated : a)));
  };

  const handleDeleteApplication = async (appId: string) => {
    await apiRequest(`/applications/${appId}`, { method: 'DELETE' });
    setApplications(applications.filter((a) => a.id !== appId));
  };

  if (isInitializing) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-950 text-white">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-600/30 animate-bounce">
          <span className="text-xl font-black">HP</span>
        </div>
        <p className="mt-4 text-xs font-semibold tracking-wider uppercase text-slate-400">
          Initializing HirePilot AI Copilot...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Workspace with Responsive Sidebar */}
      <div className="flex flex-1 flex-col lg:flex-row">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedJobCompany={selectedJob?.company}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              profile={profile}
              jobs={jobs}
              applications={applications}
              selectedJob={selectedJob}
              onSelectJob={setSelectedJob}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
            />
          )}

          {activeTab === 'jobs' && (
            <JobsView
              jobs={jobs}
              selectedJob={selectedJob}
              onSelectJob={setSelectedJob}
              onAddJob={handleAddJob}
              onDeleteJob={handleDeleteJob}
              onToggleFavorite={handleToggleFavorite}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'analyzer' && (
            <JobAnalyzerView
              selectedJob={selectedJob}
              jobs={jobs}
              onSelectJob={setSelectedJob}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'recommender' && (
            <ProjectRecommenderView
              selectedJob={selectedJob}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'resume-copilot' && (
            <ResumeCopilotView
              selectedJob={selectedJob}
            />
          )}

          {activeTab === 'learning-plan' && (
            <LearningPlanView
              selectedJob={selectedJob}
            />
          )}

          {activeTab === 'interview' && (
            <InterviewerView
              selectedJob={selectedJob}
              jobs={jobs}
            />
          )}

          {activeTab === 'tracker' && (
            <ApplicationTrackerView
              applications={applications}
              onAddApplication={handleAddApplication}
              onUpdateApplication={handleUpdateApplication}
              onDeleteApplication={handleDeleteApplication}
            />
          )}

          {activeTab === 'api-docs' && <ApiDocsView />}
        </main>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
