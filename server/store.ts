import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  User,
  CandidateProfile,
  Job,
  JobAnalysis,
  ProjectRecommendation,
  ResumeData,
  CoverLetterData,
  LearningPlan,
  InterviewSession,
  JobApplication,
} from '../src/types.js';

interface DatabaseSchema {
  users: User[];
  passwords: Record<string, string>; // userId -> bcrypt hash
  profiles: Record<string, CandidateProfile>; // userId -> CandidateProfile
  jobs: Job[];
  analyses: Record<string, JobAnalysis>; // jobId -> JobAnalysis
  recommendations: Record<string, ProjectRecommendation[]>; // jobId -> recommendations
  resumes: Record<string, ResumeData>; // jobId -> ResumeData
  coverLetters: Record<string, CoverLetterData>; // jobId -> CoverLetterData
  learningPlans: Record<string, LearningPlan>; // jobId -> LearningPlan
  interviews: InterviewSession[];
  applications: JobApplication[];
}

const DB_FILE = path.join(process.cwd(), 'database.json');

class DataStore {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadDatabase();
    if (this.data.users.length === 0) {
      this.seedInitialData();
    }
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Could not read existing database.json, initializing fresh store.', e);
    }
    return {
      users: [],
      passwords: {},
      profiles: {},
      jobs: [],
      analyses: {},
      recommendations: {},
      resumes: {},
      coverLetters: {},
      learningPlans: {},
      interviews: [],
      applications: [],
    };
  }

  private saveDatabase(): void {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write database.json:', e);
    }
  }

  private seedInitialData(): void {
    const demoUserId = 'user-alex-chen';
    const demoUser: User = {
      id: demoUserId,
      email: 'alex.chen@hirepilot.dev',
      name: 'Alex Chen',
      role: 'USER',
      createdAt: new Date().toISOString(),
    };

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync('password123', salt);

    this.data.users.push(demoUser);
    this.data.passwords[demoUserId] = hashedPassword;

    const demoProfile: CandidateProfile = {
      id: 'prof-alex-chen',
      userId: demoUserId,
      name: 'Alex Chen',
      email: 'alex.chen@hirepilot.dev',
      phone: '+1 (415) 890-3412',
      location: 'San Francisco, CA (Open to Remote)',
      headline: 'Senior Full-Stack Engineer | Java 21 • Spring Boot 3 • React • PostgreSQL',
      summary: 'Passionate Senior Software Engineer with 6+ years of production experience designing scalable distributed microservices, robust RESTful APIs, and responsive React web interfaces. Proven track record in optimizing high-throughput transactional databases and modernizing cloud architectures with strong architectural craftsmanship.',
      githubUrl: 'https://github.com/alexchen-dev',
      linkedinUrl: 'https://linkedin.com/in/alexchen-software',
      portfolioUrl: 'https://alexchen.codes',
      skills: [
        { id: 'sk-1', name: 'Java', category: 'Languages', proficiency: 'Expert', yearsOfExperience: 6 },
        { id: 'sk-2', name: 'Spring Boot', category: 'Frameworks', proficiency: 'Expert', yearsOfExperience: 5 },
        { id: 'sk-3', name: 'Spring Security', category: 'Frameworks', proficiency: 'Advanced', yearsOfExperience: 4 },
        { id: 'sk-4', name: 'PostgreSQL', category: 'Databases', proficiency: 'Advanced', yearsOfExperience: 5 },
        { id: 'sk-5', name: 'React', category: 'Frameworks', proficiency: 'Advanced', yearsOfExperience: 4 },
        { id: 'sk-6', name: 'TypeScript', category: 'Languages', proficiency: 'Advanced', yearsOfExperience: 3 },
        { id: 'sk-7', name: 'REST APIs', category: 'Architecture & Tools', proficiency: 'Expert', yearsOfExperience: 6 },
        { id: 'sk-8', name: 'Microservices', category: 'Architecture & Tools', proficiency: 'Advanced', yearsOfExperience: 4 },
        { id: 'sk-9', name: 'Docker', category: 'Cloud & DevOps', proficiency: 'Intermediate', yearsOfExperience: 2 },
        { id: 'sk-10', name: 'Git', category: 'Architecture & Tools', proficiency: 'Advanced', yearsOfExperience: 6 },
        { id: 'sk-11', name: 'SQL', category: 'Databases', proficiency: 'Advanced', yearsOfExperience: 6 },
      ],
      education: [
        {
          id: 'edu-1',
          institution: 'University of California, Berkeley',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          startYear: 2016,
          endYear: 2020,
          cgpa: '3.86 / 4.0',
        },
      ],
      projects: [
        {
          id: 'proj-1',
          name: 'CloudTask Distributed Job Orchestrator',
          description: 'Fault-tolerant distributed job scheduling platform capable of executing 20,000+ scheduled tasks per second across worker nodes.',
          technologies: ['Java 21', 'Spring Boot 3', 'PostgreSQL', 'Redis', 'Docker', 'React'],
          githubUrl: 'https://github.com/alexchen-dev/cloudtask-engine',
          liveUrl: 'https://cloudtask-demo.dev',
          highlights: [
            'Architected distributed locking using Redis Redlock algorithm and optimistic concurrency control in PostgreSQL to eliminate duplicate task executions.',
            'Implemented resilient backoff retry queues and dead-letter channels with automated alert telemetry.',
            'Built a responsive real-time operations dashboard in React and Tailwind displaying worker cluster health and execution latency metrics.',
          ],
        },
        {
          id: 'proj-2',
          name: 'FinFlow High-Throughput Ledger Engine',
          description: 'Double-entry transactional ledger service compliant with GAAP standards, handling concurrent balance updates with strict consistency.',
          technologies: ['Java', 'Spring Boot', 'Spring Data JPA', 'PostgreSQL', 'Spring Security', 'JWT'],
          githubUrl: 'https://github.com/alexchen-dev/finflow-ledger',
          liveUrl: 'https://finflow-ledger.internal',
          highlights: [
            'Designed immutable double-entry journal ledger schema in PostgreSQL with compound index optimizations, cutting balance reconciliation time by 74%.',
            'Implemented stateless JWT authentication with role-based access control (RBAC) and audit logging for security compliance.',
            'Achieved 95% unit and integration test coverage using JUnit 5, Mockito, and Testcontainers.',
          ],
        },
        {
          id: 'proj-3',
          name: 'DevPulse Code Review Copilot & Metrics Hub',
          description: 'Collaborative code review metrics analyzer providing insights on pull request turnaround velocity, test coverage drift, and team bottlenecks.',
          technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Spring Boot REST', 'PostgreSQL'],
          githubUrl: 'https://github.com/alexchen-dev/devpulse-hub',
          highlights: [
            'Engineered interactive visualization dashboards rendering burndown charts and review turnaround percentiles.',
            'Created secure webhooks integration consuming GitHub events to calculate lead time to production metrics.',
          ],
        },
      ],
    };
    this.data.profiles[demoUserId] = demoProfile;

    // Seed Jobs
    const job1: Job = {
      id: 'job-stripe-sr',
      userId: demoUserId,
      company: 'Stripe',
      title: 'Senior Full Stack Software Engineer (Java / React)',
      location: 'San Francisco, CA / Remote',
      employmentType: 'Full-time',
      dateAdded: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString().split('T')[0],
      isFavorite: true,
      sourceUrl: 'https://stripe.com/jobs/senior-fullstack-engineer',
      matchScore: 88,
      status: 'INTERVIEW',
      description: `About the Role:
At Stripe, we build financial infrastructure for the internet. As a Senior Full Stack Software Engineer on our Core Payment Platform team, you will design, build, and scale mission-critical APIs and web interfaces that power billions of dollars in payments worldwide.

What You Will Do:
- Architect, build, and maintain highly available backend services using Java and modern web applications using React and TypeScript.
- Design resilient, low-latency RESTful APIs and event-driven architectures backed by relational data stores (PostgreSQL / MySQL).
- Collaborate with product designers and engineering teams to deliver intuitive, accessible merchant-facing portals.
- Champion engineering excellence, rigorous automated testing (unit, integration, end-to-end), and secure coding practices.
- Containerize and monitor services using Docker, Kubernetes, and observability tooling.

Qualifications:
- 5+ years of software engineering experience developing full-stack web applications.
- Strong proficiency in Java, Spring Boot, and modern object-oriented design patterns.
- Strong expertise with React, TypeScript, and modern state management.
- Deep hands-on experience with relational databases (PostgreSQL preferred), schema design, indexing, and query optimization.
- Solid understanding of distributed systems principles, concurrency, and idempotent API design.
- Familiarity with Docker, CI/CD pipelines, and cloud environments (AWS / GCP).
- Excellent communication and collaborative problem-solving skills.`,
    };

    const job2: Job = {
      id: 'job-netflix-platform',
      userId: demoUserId,
      company: 'Netflix',
      title: 'Backend Platform Engineer (Java & Cloud Services)',
      location: 'Los Gatos, CA (Hybrid)',
      employmentType: 'Full-time',
      dateAdded: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString().split('T')[0],
      isFavorite: true,
      sourceUrl: 'https://jobs.netflix.com/jobs/platform-engineer',
      matchScore: 82,
      status: 'APPLIED',
      description: `About Netflix:
Netflix is the world's leading streaming entertainment service. We are looking for an experienced Backend Platform Engineer to join our Studio Workflow Systems team.

Responsibilities:
- Build high-scale Java microservices that streamline global media asset ingestion and workflow pipelines.
- Partner with infrastructure teams to operate distributed Spring Boot microservices on AWS and Docker/Kubernetes.
- Optimize database performance and message queues (Kafka / SQS) processing hundreds of thousands of events per minute.
- Drive adoption of automated testing and continuous deployment best practices.

Requirements:
- Strong foundations in Java 17+, Spring Boot, and Spring Data.
- Experience with PostgreSQL or distributed SQL databases.
- Familiarity with AWS services, Docker containerization, and Kafka messaging.
- Knowledge of microservices patterns: circuit breakers, service mesh, and observability.`,
    };

    const job3: Job = {
      id: 'job-datadog-fullstack',
      userId: demoUserId,
      company: 'Datadog',
      title: 'Full Stack Engineer - APM & Developer Tools',
      location: 'Remote, US',
      employmentType: 'Remote',
      dateAdded: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString().split('T')[0],
      isFavorite: false,
      sourceUrl: 'https://careers.datadoghq.com/job/fullstack-apm',
      matchScore: 91,
      status: 'OFFER',
      description: `Datadog is the essential monitoring and security platform for cloud applications. We are seeking a Full Stack Engineer to enhance our developer observability tools.

Required Skills:
- Professional experience with Java or Go, paired with modern TypeScript and React.
- Solid grasp of REST API architectural patterns and SQL optimization.
- Passion for developer experience, high software quality, and elegant UI interfaces.
- Experience with Docker, Linux systems, and automated test automation.`,
    };

    this.data.jobs.push(job1, job2, job3);

    // Seed Applications
    this.data.applications.push(
      {
        id: 'app-1',
        userId: demoUserId,
        jobId: job1.id,
        company: 'Stripe',
        position: 'Senior Full Stack Software Engineer (Java / React)',
        matchScore: 88,
        status: 'INTERVIEW',
        appliedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString().split('T')[0],
        interviewDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString().split('T')[0],
        followUpDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString().split('T')[0],
        notes: 'Technical screen completed successfully. Round 2 System Design & Java Concurrency interview scheduled for Thursday.',
      },
      {
        id: 'app-2',
        userId: demoUserId,
        jobId: job2.id,
        company: 'Netflix',
        position: 'Backend Platform Engineer (Java & Cloud Services)',
        matchScore: 82,
        status: 'APPLIED',
        appliedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString().split('T')[0],
        followUpDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4).toISOString().split('T')[0],
        notes: 'Submitted tailored resume highlighting CloudTask distributed orchestrator project.',
      },
      {
        id: 'app-3',
        userId: demoUserId,
        jobId: job3.id,
        company: 'Datadog',
        position: 'Full Stack Engineer - APM & Developer Tools',
        matchScore: 91,
        status: 'OFFER',
        appliedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString().split('T')[0],
        interviewDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString().split('T')[0],
        notes: 'Received formal offer package! Reviewing total rewards and benefits.',
      },
      {
        id: 'app-4',
        userId: demoUserId,
        company: 'Airbnb',
        position: 'Staff Software Engineer - Guest Experience',
        matchScore: 78,
        status: 'ASSESSMENT',
        appliedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString().split('T')[0],
        followUpDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1).toISOString().split('T')[0],
        notes: 'Complete HackerRank asynchronous assessment on algorithms and concurrency by Monday.',
      },
      {
        id: 'app-5',
        userId: demoUserId,
        company: 'Shopify',
        position: 'Senior Backend Developer (High Scale APIs)',
        matchScore: 85,
        status: 'SAVED',
        appliedDate: new Date().toISOString().split('T')[0],
        notes: 'Saved for tailoring resume with FinFlow double-entry ledger project highlights.',
      }
    );

    this.saveDatabase();
  }

  // --- Users & Auth ---
  public findUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public createUser(email: string, name: string, passwordHash: string): User {
    const newUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      email,
      name,
      role: 'USER',
      createdAt: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    this.data.passwords[newUser.id] = passwordHash;

    // Initialize blank candidate profile
    this.data.profiles[newUser.id] = {
      id: `prof-${newUser.id}`,
      userId: newUser.id,
      name,
      email,
      phone: '',
      location: '',
      headline: '',
      summary: '',
      githubUrl: '',
      linkedinUrl: '',
      portfolioUrl: '',
      skills: [],
      education: [],
      projects: [],
    };

    this.saveDatabase();
    return newUser;
  }

  public getPasswordHash(userId: string): string | undefined {
    return this.data.passwords[userId];
  }

  // --- Candidate Profile ---
  public getProfileByUserId(userId: string): CandidateProfile {
    let profile = this.data.profiles[userId];
    if (!profile) {
      const user = this.findUserById(userId);
      profile = {
        id: `prof-${userId}`,
        userId,
        name: user?.name || 'Candidate',
        email: user?.email || '',
        phone: '',
        location: '',
        headline: '',
        summary: '',
        githubUrl: '',
        linkedinUrl: '',
        portfolioUrl: '',
        skills: [],
        education: [],
        projects: [],
      };
      this.data.profiles[userId] = profile;
      this.saveDatabase();
    }
    return profile;
  }

  public updateProfile(userId: string, updates: Partial<CandidateProfile>): CandidateProfile {
    const current = this.getProfileByUserId(userId);
    const updated = {
      ...current,
      ...updates,
      userId, // guarantee user cannot hijack another profile
    };
    this.data.profiles[userId] = updated;
    this.saveDatabase();
    return updated;
  }

  // --- Jobs ---
  public getJobsByUser(userId: string): Job[] {
    return this.data.jobs.filter((j) => j.userId === userId);
  }

  public getJobById(jobId: string, userId: string): Job | undefined {
    return this.data.jobs.find((j) => j.id === jobId && j.userId === userId);
  }

  public createJob(userId: string, jobData: Omit<Job, 'id' | 'userId' | 'dateAdded'>): Job {
    const newJob: Job = {
      ...jobData,
      id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      userId,
      dateAdded: new Date().toISOString().split('T')[0],
      isFavorite: jobData.isFavorite ?? false,
    };
    this.data.jobs.unshift(newJob);
    this.saveDatabase();
    return newJob;
  }

  public updateJob(jobId: string, userId: string, updates: Partial<Job>): Job | null {
    const index = this.data.jobs.findIndex((j) => j.id === jobId && j.userId === userId);
    if (index === -1) return null;
    this.data.jobs[index] = { ...this.data.jobs[index], ...updates, id: jobId, userId };
    this.saveDatabase();
    return this.data.jobs[index];
  }

  public deleteJob(jobId: string, userId: string): boolean {
    const initialLen = this.data.jobs.length;
    this.data.jobs = this.data.jobs.filter((j) => !(j.id === jobId && j.userId === userId));
    const deleted = this.data.jobs.length < initialLen;
    if (deleted) this.saveDatabase();
    return deleted;
  }

  // --- AI Analysis & Recommendations ---
  public saveAnalysis(jobId: string, analysis: JobAnalysis): void {
    this.data.analyses[jobId] = analysis;
    // Also update match score on job
    const job = this.data.jobs.find((j) => j.id === jobId);
    if (job) {
      job.matchScore = analysis.overallMatch;
    }
    this.saveDatabase();
  }

  public getAnalysis(jobId: string): JobAnalysis | undefined {
    return this.data.analyses[jobId];
  }

  public saveRecommendations(jobId: string, recs: ProjectRecommendation[]): void {
    this.data.recommendations[jobId] = recs;
    this.saveDatabase();
  }

  public getRecommendations(jobId: string): ProjectRecommendation[] | undefined {
    return this.data.recommendations[jobId];
  }

  public saveResume(jobId: string, resume: ResumeData): void {
    this.data.resumes[jobId] = resume;
    this.saveDatabase();
  }

  public getResume(jobId: string): ResumeData | undefined {
    return this.data.resumes[jobId];
  }

  public saveCoverLetter(jobId: string, letter: CoverLetterData): void {
    this.data.coverLetters[jobId] = letter;
    this.saveDatabase();
  }

  public getCoverLetter(jobId: string): CoverLetterData | undefined {
    return this.data.coverLetters[jobId];
  }

  public saveLearningPlan(jobId: string, plan: LearningPlan): void {
    this.data.learningPlans[jobId] = plan;
    this.saveDatabase();
  }

  public getLearningPlan(jobId: string): LearningPlan | undefined {
    return this.data.learningPlans[jobId];
  }

  // --- Interviews ---
  public getInterviewsByUser(userId: string): InterviewSession[] {
    return this.data.interviews.filter((i) => i.userId === userId);
  }

  public getInterviewById(id: string, userId: string): InterviewSession | undefined {
    return this.data.interviews.find((i) => i.id === id && i.userId === userId);
  }

  public saveInterview(session: InterviewSession): void {
    const idx = this.data.interviews.findIndex((i) => i.id === session.id);
    if (idx >= 0) {
      this.data.interviews[idx] = session;
    } else {
      this.data.interviews.unshift(session);
    }
    this.saveDatabase();
  }

  // --- Applications ---
  public getApplicationsByUser(userId: string): JobApplication[] {
    return this.data.applications.filter((a) => a.userId === userId);
  }

  public getApplicationById(id: string, userId: string): JobApplication | undefined {
    return this.data.applications.find((a) => a.id === id && a.userId === userId);
  }

  public saveApplication(userId: string, appData: Omit<JobApplication, 'id' | 'userId'>): JobApplication {
    const newApp: JobApplication = {
      ...appData,
      id: `app-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      userId,
    };
    this.data.applications.unshift(newApp);
    this.saveDatabase();
    return newApp;
  }

  public updateApplication(id: string, userId: string, updates: Partial<JobApplication>): JobApplication | null {
    const idx = this.data.applications.findIndex((a) => a.id === id && a.userId === userId);
    if (idx === -1) return null;
    this.data.applications[idx] = { ...this.data.applications[idx], ...updates, id, userId };
    this.saveDatabase();
    return this.data.applications[idx];
  }

  public deleteApplication(id: string, userId: string): boolean {
    const initialLen = this.data.applications.length;
    this.data.applications = this.data.applications.filter((a) => !(a.id === id && a.userId === userId));
    const deleted = this.data.applications.length < initialLen;
    if (deleted) this.saveDatabase();
    return deleted;
  }
}

export const store = new DataStore();
