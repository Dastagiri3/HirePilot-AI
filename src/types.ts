export type SkillProficiency = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
export type SkillCategory = 'Languages' | 'Frameworks' | 'Databases' | 'Cloud & DevOps' | 'Architecture & Tools' | 'Core CS';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory | string;
  proficiency: SkillProficiency;
  yearsOfExperience: number;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startYear: number;
  endYear: number;
  cgpa: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  githubUrl: string;
  liveUrl?: string;
  highlights: string[];
}

export interface CandidateProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  headline: string;
  summary: string;
  githubUrl: string;
  linkedinUrl: string;
  portfolioUrl: string;
  skills: Skill[];
  education: Education[];
  projects: Project[];
}

export interface Job {
  id: string;
  userId: string;
  company: string;
  title: string;
  location: string;
  employmentType: 'Full-time' | 'Contract' | 'Remote' | 'Part-time' | 'Hybrid';
  description: string;
  sourceUrl?: string;
  dateAdded: string;
  isFavorite: boolean;
  matchScore?: number;
  status?: ApplicationStatus;
}

export interface JobAnalysis {
  id: string;
  jobId: string;
  jobTitle?: string;
  company?: string;
  overallMatch: number;
  technicalMatch: number;
  experienceMatch: number;
  educationMatch: number;
  strongMatches: string[];
  missingRequiredSkills: string[];
  missingPreferredSkills: string[];
  skillImportance: Record<string, 'HIGH' | 'MEDIUM' | 'LOW'>;
  recommendations: string[];
  summary: string;
  analyzedAt: string;
}

export interface ProjectRecommendation {
  projectId?: string;
  projectName: string;
  relevanceScore: number;
  reason?: string;
  whyItMatters?: string;
  relevantTechnologies?: string[];
  matchingTechnologies?: string[];
  suggestedBulletPoints?: string[];
  suggestedBullets?: string[];
}

export interface ResumeData {
  jobId: string;
  jobTitle: string;
  company: string;
  tailoredHeadline?: string;
  tailoredSummary?: string;
  prioritizedSkills?: { category: string; skills: string[] }[];
  tailoredProjects?: {
    projectName: string;
    technologies: string[];
    suggestedBullets: string[];
  }[];
  atsKeywords: string[];
  markdownContent: string;
  generatedAt?: string;
}

export type TailoredResume = ResumeData;

export interface CoverLetterData {
  jobId: string;
  company: string;
  jobTitle: string;
  content: string;
  generatedAt?: string;
}

export type CoverLetter = CoverLetterData;

export interface LearningPlanItem {
  skill?: string;
  skillName?: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  whyItMatters: string;
  topics: string[];
  estimatedHours: string;
  practiceTask: string;
  interviewQuestions: string[];
}

export interface LearningPlan {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  generatedAt: string;
  items: LearningPlanItem[];
}

export type InterviewDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface AnswerEvaluation {
  technicalAccuracy: number;
  conceptualDepth: number;
  practicalUnderstanding: number;
  communication: number;
  overallScore: number;
  feedback: string;
  keyStrengths: string[];
  improvementAreas: string[];
  sampleIdealAnswer: string;
}

export interface InterviewQuestionItem {
  id: string;
  questionNumber: number;
  question: string;
  category: string;
  difficulty: InterviewDifficulty;
  candidateAnswer?: string;
  evaluation?: AnswerEvaluation;
}

export type InterviewQuestion = InterviewQuestionItem;

export interface InterviewSession {
  id: string;
  userId: string;
  jobId?: string;
  jobTitle: string;
  company: string;
  difficulty: InterviewDifficulty;
  category: string;
  status: 'IN_PROGRESS' | 'COMPLETED';
  currentQuestionIndex: number;
  totalQuestions: number;
  questions: InterviewQuestionItem[];
  overallScore?: number;
  feedbackSummary?: string;
  verdict?: 'STRONG_HIRE' | 'HIRE' | 'LEANING_HIRE' | 'NEEDS_WORK';
  createdAt: string;
  completedAt?: string;
}

export type ApplicationStatus = 'SAVED' | 'APPLIED' | 'ASSESSMENT' | 'INTERVIEW' | 'OFFER' | 'REJECTED';

export interface JobApplication {
  id: string;
  userId: string;
  company: string;
  position: string;
  jobId?: string;
  matchScore?: number;
  status: ApplicationStatus;
  appliedDate: string;
  interviewDate?: string;
  followUpDate?: string;
  notes?: string;
  resumeVersion?: string;
  coverLetter?: string;
}

export interface DashboardStats {
  totalApplications: number;
  applicationsThisMonth: number;
  interviews: number;
  offers: number;
  rejections: number;
  averageMatchScore: number;
  profileCompletion: number;
  topMissingSkills: { skill: string; count: number }[];
  recentApplications: JobApplication[];
  upcomingInterviews: JobApplication[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
