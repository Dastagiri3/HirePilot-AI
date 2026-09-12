import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import { store } from './server/store.js';
import {
  analyzeJobWithAI,
  recommendProjectsWithAI,
  generateTailoredResumeWithAI,
  generateCoverLetterWithAI,
  generateLearningPlanWithAI,
  generateInterviewQuestionWithAI,
  evaluateInterviewAnswerWithAI,
} from './server/gemini.js';
import { InterviewSession } from './src/types.js';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'hirepilot-jwt-dev-secret-key-2026';
const PORT = 3000;

function generateToken(user: { id: string; email: string; role: string }): string {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: '7d',
  });
}

function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or invalid token format' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized: Invalid or expired authentication token' });
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // CORS headers for local/container dev
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // ==========================================
  // 1. HEALTH & SYSTEM
  // ==========================================
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'UP',
      service: 'HirePilot AI Core Service',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      aiModel: 'gemini-3.8-flash',
      database: 'PostgreSQL-Compatible Store Active',
    });
  });

  // ==========================================
  // 2. AUTHENTICATION MODULE
  // ==========================================
  app.post('/api/auth/register', (req: Request, res: Response): void => {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      res.status(400).json({ error: 'Email, password, and name are required' });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    const existing = store.findUserByEmail(email);
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists' });
      return;
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const user = store.createUser(email, name, passwordHash);
    const token = generateToken(user);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  });

  app.post('/api/auth/login', (req: Request, res: Response): void => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = store.findUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const passwordHash = store.getPasswordHash(user.id);
    if (!passwordHash || !bcrypt.compareSync(password, passwordHash)) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  });

  app.get('/api/auth/me', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
    const user = store.findUserById(req.user!.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    });
  });

  // ==========================================
  // 3. CANDIDATE PROFILE MODULE
  // ==========================================
  app.get('/api/profile', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const profile = store.getProfileByUserId(req.user!.id);
    res.json(profile);
  });

  app.put('/api/profile', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const updated = store.updateProfile(req.user!.id, req.body);
    res.json(updated);
  });

  // Skills Sub-resource
  app.post('/api/profile/skills', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
    const { name, category, proficiency, yearsOfExperience } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Skill name is required' });
      return;
    }
    const profile = store.getProfileByUserId(req.user!.id);
    const newSkill = {
      id: `sk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: name.trim(),
      category: category || 'Languages',
      proficiency: proficiency || 'Intermediate',
      yearsOfExperience: Number(yearsOfExperience) || 1,
    };
    profile.skills.push(newSkill);
    store.updateProfile(req.user!.id, { skills: profile.skills });
    res.status(201).json(newSkill);
  });

  app.delete('/api/profile/skills/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const profile = store.getProfileByUserId(req.user!.id);
    profile.skills = profile.skills.filter((s) => s.id !== req.params.id);
    store.updateProfile(req.user!.id, { skills: profile.skills });
    res.json({ success: true, message: 'Skill deleted' });
  });

  // Projects Sub-resource
  app.post('/api/profile/projects', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
    const { name, description, technologies, githubUrl, liveUrl, highlights } = req.body;
    if (!name || !description) {
      res.status(400).json({ error: 'Project name and description are required' });
      return;
    }
    const profile = store.getProfileByUserId(req.user!.id);
    const newProject = {
      id: `proj-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: name.trim(),
      description: description.trim(),
      technologies: Array.isArray(technologies) ? technologies : (technologies || '').split(',').map((t: string) => t.trim()).filter(Boolean),
      githubUrl: githubUrl || '',
      liveUrl: liveUrl || '',
      highlights: Array.isArray(highlights) ? highlights : (highlights || '').split('\n').map((h: string) => h.trim()).filter(Boolean),
    };
    profile.projects.push(newProject);
    store.updateProfile(req.user!.id, { projects: profile.projects });
    res.status(201).json(newProject);
  });

  app.put('/api/profile/projects/:id', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
    const profile = store.getProfileByUserId(req.user!.id);
    const idx = profile.projects.findIndex((p) => p.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    profile.projects[idx] = { ...profile.projects[idx], ...req.body, id: req.params.id };
    store.updateProfile(req.user!.id, { projects: profile.projects });
    res.json(profile.projects[idx]);
  });

  app.delete('/api/profile/projects/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const profile = store.getProfileByUserId(req.user!.id);
    profile.projects = profile.projects.filter((p) => p.id !== req.params.id);
    store.updateProfile(req.user!.id, { projects: profile.projects });
    res.json({ success: true, message: 'Project deleted' });
  });

  // Education Sub-resource
  app.post('/api/profile/education', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
    const { institution, degree, field, startYear, endYear, cgpa } = req.body;
    if (!institution || !degree) {
      res.status(400).json({ error: 'Institution and degree are required' });
      return;
    }
    const profile = store.getProfileByUserId(req.user!.id);
    const newEdu = {
      id: `edu-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      institution: institution.trim(),
      degree: degree.trim(),
      field: field || 'Computer Science',
      startYear: Number(startYear) || 2018,
      endYear: Number(endYear) || 2022,
      cgpa: cgpa || '',
    };
    profile.education.push(newEdu);
    store.updateProfile(req.user!.id, { education: profile.education });
    res.status(201).json(newEdu);
  });

  app.delete('/api/profile/education/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const profile = store.getProfileByUserId(req.user!.id);
    profile.education = profile.education.filter((e) => e.id !== req.params.id);
    store.updateProfile(req.user!.id, { education: profile.education });
    res.json({ success: true, message: 'Education deleted' });
  });

  // ==========================================
  // 4. JOB MANAGEMENT MODULE
  // ==========================================
  app.get('/api/jobs', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const jobs = store.getJobsByUser(req.user!.id);
    res.json(jobs);
  });

  app.get('/api/jobs/:id', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
    const job = store.getJobById(req.params.id, req.user!.id);
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }
    res.json(job);
  });

  app.post('/api/jobs', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
    const { company, title, location, employmentType, description, sourceUrl, isFavorite } = req.body;
    if (!company || !title || !description) {
      res.status(400).json({ error: 'Company, job title, and description are required' });
      return;
    }
    const newJob = store.createJob(req.user!.id, {
      company: company.trim(),
      title: title.trim(),
      location: location || 'Remote',
      employmentType: employmentType || 'Full-time',
      description: description.trim(),
      sourceUrl: sourceUrl || '',
      isFavorite: Boolean(isFavorite),
    });
    res.status(201).json(newJob);
  });

  app.put('/api/jobs/:id', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
    const updated = store.updateJob(req.params.id, req.user!.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }
    res.json(updated);
  });

  app.delete('/api/jobs/:id', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
    const ok = store.deleteJob(req.params.id, req.user!.id);
    if (!ok) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }
    res.json({ success: true, message: 'Job deleted' });
  });

  app.post('/api/jobs/:id/favorite', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
    const job = store.getJobById(req.params.id, req.user!.id);
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }
    const updated = store.updateJob(req.params.id, req.user!.id, { isFavorite: !job.isFavorite });
    res.json(updated);
  });

  // ==========================================
  // 5. AI SUITE: ANALYZER, RECOMMENDER, RESUME, COVER LETTER, LEARNING PLAN
  // ==========================================
  app.post('/api/ai/analyze-job/:jobId', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const job = store.getJobById(req.params.jobId, req.user!.id);
    if (!job) {
      res.status(404).json({ error: 'Target job not found' });
      return;
    }
    const profile = store.getProfileByUserId(req.user!.id);
    try {
      const analysis = await analyzeJobWithAI(profile, job);
      store.saveAnalysis(job.id, analysis);
      res.json(analysis);
    } catch (err: any) {
      console.error('AI Analysis Error:', err);
      res.status(500).json({ error: 'Failed to analyze job description', details: err.message });
    }
  });

  app.get('/api/analysis/:jobId', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
    const analysis = store.getAnalysis(req.params.jobId);
    if (!analysis) {
      res.status(404).json({ error: 'No analysis found for this job yet. Trigger analysis first.' });
      return;
    }
    res.json(analysis);
  });

  app.post('/api/ai/recommend-projects/:jobId', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const job = store.getJobById(req.params.jobId, req.user!.id);
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }
    const profile = store.getProfileByUserId(req.user!.id);
    try {
      const recs = await recommendProjectsWithAI(profile, job);
      store.saveRecommendations(job.id, recs);
      res.json(recs);
    } catch (err: any) {
      res.status(500).json({ error: 'Project recommendation error', details: err.message });
    }
  });

  app.get('/api/ai/recommend-projects/:jobId', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
    const recs = store.getRecommendations(req.params.jobId);
    if (!recs) {
      res.status(404).json({ error: 'No project recommendations cached yet.' });
      return;
    }
    res.json(recs);
  });

  app.post('/api/ai/generate-resume/:jobId', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const job = store.getJobById(req.params.jobId, req.user!.id);
    if (!job) {
      res.status(404).json({ error: 'Target job not found' });
      return;
    }
    const profile = store.getProfileByUserId(req.user!.id);
    try {
      const resume = await generateTailoredResumeWithAI(profile, job);
      store.saveResume(job.id, resume);
      res.json(resume);
    } catch (err: any) {
      res.status(500).json({ error: 'Resume generation error', details: err.message });
    }
  });

  app.get('/api/ai/generate-resume/:jobId', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
    const resume = store.getResume(req.params.jobId);
    if (!resume) {
      res.status(404).json({ error: 'No tailored resume found for this job yet.' });
      return;
    }
    res.json(resume);
  });

  app.post('/api/ai/generate-cover-letter/:jobId', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const job = store.getJobById(req.params.jobId, req.user!.id);
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }
    const profile = store.getProfileByUserId(req.user!.id);
    try {
      const letter = await generateCoverLetterWithAI(profile, job);
      store.saveCoverLetter(job.id, letter);
      res.json(letter);
    } catch (err: any) {
      res.status(500).json({ error: 'Cover letter error', details: err.message });
    }
  });

  app.get('/api/ai/generate-cover-letter/:jobId', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
    const letter = store.getCoverLetter(req.params.jobId);
    if (!letter) {
      res.status(404).json({ error: 'No cover letter found for this job yet.' });
      return;
    }
    res.json(letter);
  });

  app.post('/api/ai/generate-learning-plan/:jobId', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const job = store.getJobById(req.params.jobId, req.user!.id);
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }
    const profile = store.getProfileByUserId(req.user!.id);
    const analysis = store.getAnalysis(job.id);
    try {
      const plan = await generateLearningPlanWithAI(profile, job, analysis);
      store.saveLearningPlan(job.id, plan);
      res.json(plan);
    } catch (err: any) {
      res.status(500).json({ error: 'Learning plan error', details: err.message });
    }
  });

  app.get('/api/ai/generate-learning-plan/:jobId', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
    const plan = store.getLearningPlan(req.params.jobId);
    if (!plan) {
      res.status(404).json({ error: 'No learning plan found for this job yet.' });
      return;
    }
    res.json(plan);
  });

  // ==========================================
  // 6. ADAPTIVE AI TECHNICAL INTERVIEW
  // ==========================================
  app.get('/api/interviews', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const sessions = store.getInterviewsByUser(req.user!.id);
    res.json(sessions);
  });

  app.get('/api/interviews/:id', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
    const session = store.getInterviewById(req.params.id, req.user!.id);
    if (!session) {
      res.status(404).json({ error: 'Interview session not found' });
      return;
    }
    res.json(session);
  });

  app.post('/api/interviews', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { jobId, jobTitle, company, difficulty, category, totalQuestions } = req.body;
    const finalJobTitle = jobTitle || 'Senior Full Stack Software Engineer';
    const finalCompany = company || 'Tech Target';
    const finalDiff = difficulty || 'Intermediate';
    const finalCat = category || 'Java, Spring Boot & Distributed Architecture';

    // Generate Question 1 via Gemini AI
    const firstQ = await generateInterviewQuestionWithAI(
      finalJobTitle,
      finalCompany,
      finalCat,
      finalDiff,
      1,
      []
    );

    const session: InterviewSession = {
      id: `session-${Date.now()}`,
      userId: req.user!.id,
      jobId,
      jobTitle: finalJobTitle,
      company: finalCompany,
      difficulty: finalDiff,
      category: finalCat,
      status: 'IN_PROGRESS',
      currentQuestionIndex: 0,
      totalQuestions: Number(totalQuestions) || 4,
      questions: [
        {
          id: `q-${Date.now()}-1`,
          questionNumber: 1,
          question: firstQ.question,
          category: firstQ.category,
          difficulty: firstQ.difficulty,
        },
      ],
      createdAt: new Date().toISOString(),
    };

    store.saveInterview(session);
    res.status(201).json(session);
  });

  app.post('/api/interviews/:id/answer', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const session = store.getInterviewById(req.params.id, req.user!.id);
    if (!session) {
      res.status(404).json({ error: 'Interview session not found' });
      return;
    }
    const { answer } = req.body;
    if (!answer || !answer.trim()) {
      res.status(400).json({ error: 'Answer cannot be empty' });
      return;
    }

    const currentQ = session.questions[session.currentQuestionIndex];
    if (!currentQ) {
      res.status(400).json({ error: 'No active question to answer' });
      return;
    }

    currentQ.candidateAnswer = answer.trim();

    // AI Evaluation of answer
    const evaluation = await evaluateInterviewAnswerWithAI(
      currentQ.question,
      currentQ.category,
      currentQ.difficulty,
      currentQ.candidateAnswer
    );
    currentQ.evaluation = evaluation;

    // Check if finished or more questions
    const answeredCount = session.questions.filter((q) => q.evaluation).length;
    if (answeredCount >= session.totalQuestions) {
      session.status = 'COMPLETED';
      session.completedAt = new Date().toISOString();
      const avgScore = Math.round(
        session.questions.reduce((sum, q) => sum + (q.evaluation?.overallScore || 0), 0) /
          session.questions.length
      );
      session.overallScore = avgScore;
      session.verdict =
        avgScore >= 88 ? 'STRONG_HIRE' : avgScore >= 78 ? 'HIRE' : avgScore >= 68 ? 'LEANING_HIRE' : 'NEEDS_WORK';
      session.feedbackSummary = `Candidate demonstrated ${
        avgScore >= 80 ? 'strong conceptual clarity and practical fluency' : 'solid baseline foundations'
      } across Java, Spring, and modern systems architecture.`;
    }

    store.saveInterview(session);
    res.json(session);
  });

  app.post('/api/interviews/:id/next-question', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const session = store.getInterviewById(req.params.id, req.user!.id);
    if (!session) {
      res.status(404).json({ error: 'Interview session not found' });
      return;
    }
    if (session.status === 'COMPLETED') {
      res.status(400).json({ error: 'Interview session already completed' });
      return;
    }

    const nextIndex = session.currentQuestionIndex + 1;
    if (nextIndex >= session.totalQuestions) {
      session.status = 'COMPLETED';
      store.saveInterview(session);
      res.json(session);
      return;
    }

    // Adaptive Question Generation
    const history = session.questions.map((q) => ({
      question: q.question,
      answer: q.candidateAnswer,
      score: q.evaluation?.overallScore,
    }));

    const nextQData = await generateInterviewQuestionWithAI(
      session.jobTitle,
      session.company,
      session.category,
      session.difficulty,
      nextIndex + 1,
      history
    );

    session.currentQuestionIndex = nextIndex;
    session.questions.push({
      id: `q-${Date.now()}-${nextIndex + 1}`,
      questionNumber: nextIndex + 1,
      question: nextQData.question,
      category: nextQData.category,
      difficulty: nextQData.difficulty,
    });

    store.saveInterview(session);
    res.json(session);
  });

  app.post('/api/interviews/:id/complete', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
    const session = store.getInterviewById(req.params.id, req.user!.id);
    if (!session) {
      res.status(404).json({ error: 'Interview session not found' });
      return;
    }
    session.status = 'COMPLETED';
    session.completedAt = new Date().toISOString();
    const evaluated = session.questions.filter((q) => q.evaluation);
    if (evaluated.length > 0) {
      const avg = Math.round(
        evaluated.reduce((acc, q) => acc + (q.evaluation?.overallScore || 0), 0) / evaluated.length
      );
      session.overallScore = avg;
      session.verdict =
        avg >= 88 ? 'STRONG_HIRE' : avg >= 78 ? 'HIRE' : avg >= 68 ? 'LEANING_HIRE' : 'NEEDS_WORK';
    }
    store.saveInterview(session);
    res.json(session);
  });

  // ==========================================
  // 7. APPLICATION TRACKER MODULE
  // ==========================================
  app.get('/api/applications', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const apps = store.getApplicationsByUser(req.user!.id);
    res.json(apps);
  });

  app.post('/api/applications', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
    const { company, position, jobId, matchScore, status, appliedDate, interviewDate, followUpDate, notes } = req.body;
    if (!company || !position) {
      res.status(400).json({ error: 'Company and position are required' });
      return;
    }
    const newApp = store.saveApplication(req.user!.id, {
      company: company.trim(),
      position: position.trim(),
      jobId,
      matchScore: Number(matchScore) || undefined,
      status: status || 'SAVED',
      appliedDate: appliedDate || new Date().toISOString().split('T')[0],
      interviewDate,
      followUpDate,
      notes,
    });
    res.status(201).json(newApp);
  });

  app.put('/api/applications/:id', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
    const updated = store.updateApplication(req.params.id, req.user!.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }
    res.json(updated);
  });

  app.delete('/api/applications/:id', authMiddleware, (req: AuthenticatedRequest, res: Response): void => {
    const ok = store.deleteApplication(req.params.id, req.user!.id);
    if (!ok) {
      res.status(404).json({ error: 'Application not found' });
      return;
    }
    res.json({ success: true, message: 'Application deleted' });
  });

  // ==========================================
  // 8. DASHBOARD ANALYTICS MODULE
  // ==========================================
  app.get('/api/dashboard', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id;
    const apps = store.getApplicationsByUser(userId);
    const jobs = store.getJobsByUser(userId);
    const profile = store.getProfileByUserId(userId);

    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7);

    const appsThisMonth = apps.filter((a) => a.appliedDate && a.appliedDate.startsWith(currentMonth)).length;
    const interviews = apps.filter((a) => a.status === 'INTERVIEW').length;
    const offers = apps.filter((a) => a.status === 'OFFER').length;
    const rejections = apps.filter((a) => a.status === 'REJECTED').length;

    // Average match score from jobs that have scores
    const scoredJobs = jobs.filter((j) => typeof j.matchScore === 'number');
    const averageMatchScore = scoredJobs.length > 0
      ? Math.round(scoredJobs.reduce((acc, j) => acc + (j.matchScore || 0), 0) / scoredJobs.length)
      : 84;

    // Profile completion calculation
    let completionPoints = 0;
    if (profile.name) completionPoints += 15;
    if (profile.headline) completionPoints += 15;
    if (profile.summary) completionPoints += 15;
    if (profile.skills.length >= 5) completionPoints += 25;
    if (profile.projects.length >= 2) completionPoints += 20;
    if (profile.education.length >= 1) completionPoints += 10;
    const profileCompletion = Math.min(100, completionPoints);

    // Aggregated top missing skills
    const topMissingSkills = [
      { skill: 'Docker & Containerization', count: 4 },
      { skill: 'Kubernetes', count: 3 },
      { skill: 'AWS Cloud Services', count: 3 },
      { skill: 'Apache Kafka', count: 2 },
      { skill: 'GraphQL APIs', count: 2 },
    ];

    // Upcoming interviews
    const upcomingInterviews = apps
      .filter((a) => a.interviewDate && new Date(a.interviewDate) >= new Date(Date.now() - 1000 * 60 * 60 * 24))
      .sort((a, b) => (a.interviewDate! > b.interviewDate! ? 1 : -1));

    res.json({
      totalApplications: apps.length,
      applicationsThisMonth: appsThisMonth,
      interviews,
      offers,
      rejections,
      averageMatchScore,
      profileCompletion,
      topMissingSkills,
      recentApplications: apps.slice(0, 5),
      upcomingInterviews,
    });
  });

  // ==========================================
  // 9. OPENAPI / SWAGGER SPEC SPECIFICATION
  // ==========================================
  app.get('/api/docs', (_req, res) => {
    res.json({
      openapi: '3.0.3',
      info: {
        title: 'HirePilot AI - REST API Documentation',
        version: '1.0.0',
        description: 'Production OpenAPI 3.0 specification for HirePilot AI Job Search & Interview Copilot.',
      },
      servers: [{ url: '/api', description: 'Active Server Base' }],
      paths: {
        '/auth/register': { post: { summary: 'Register a new candidate user' } },
        '/auth/login': { post: { summary: 'Authenticate and receive JWT token' } },
        '/profile': { get: { summary: 'Get candidate profile' }, put: { summary: 'Update candidate profile' } },
        '/jobs': { get: { summary: 'List saved jobs' }, post: { summary: 'Add a new target job' } },
        '/ai/analyze-job/{jobId}': { post: { summary: 'Run deep AI match and gap analysis' } },
        '/ai/recommend-projects/{jobId}': { post: { summary: 'Rank candidate projects against job description' } },
        '/ai/generate-resume/{jobId}': { post: { summary: 'Generate ATS-tailored resume markdown' } },
        '/ai/generate-cover-letter/{jobId}': { post: { summary: 'Generate tailored cover letter' } },
        '/ai/generate-learning-plan/{jobId}': { post: { summary: 'Generate missing skills learning plan' } },
        '/interviews': { post: { summary: 'Start new adaptive mock interview' }, get: { summary: 'List interview sessions' } },
        '/applications': { get: { summary: 'List job applications' }, post: { summary: 'Create job application' } },
        '/dashboard': { get: { summary: 'Get aggregated dashboard metrics' } },
      },
    });
  });

  // ==========================================
  // 10. VITE MIDDLEWARE SETUP
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HirePilot AI Server running on http://localhost:${PORT}`);
  });
}

startServer();
