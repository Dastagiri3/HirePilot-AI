-- =============================================================================
-- HirePilot AI — Enterprise PostgreSQL Schema
-- Compliant with Spring Data JPA & Hibernate
-- =============================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'ROLE_USER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. Candidate Profiles
CREATE TABLE IF NOT EXISTS candidate_profiles (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    location VARCHAR(255),
    headline VARCHAR(500),
    summary TEXT,
    github_url VARCHAR(500),
    linkedin_url VARCHAR(500),
    portfolio_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON candidate_profiles(user_id);

-- 3. Skills Catalog
CREATE TABLE IF NOT EXISTS skills (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_skills_name ON skills(name);

-- 4. Candidate Skills
CREATE TABLE IF NOT EXISTS candidate_skills (
    id VARCHAR(64) PRIMARY KEY,
    profile_id VARCHAR(64) NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    proficiency VARCHAR(50) NOT NULL, -- Beginner, Intermediate, Advanced, Expert
    years_of_experience INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_candidate_skill UNIQUE (profile_id, skill_name)
);
CREATE INDEX IF NOT EXISTS idx_candidate_skills_profile ON candidate_skills(profile_id);

-- 5. Education
CREATE TABLE IF NOT EXISTS education (
    id VARCHAR(64) PRIMARY KEY,
    profile_id VARCHAR(64) NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    institution VARCHAR(255) NOT NULL,
    degree VARCHAR(255) NOT NULL,
    field VARCHAR(255) NOT NULL,
    start_year INTEGER NOT NULL,
    end_year INTEGER,
    cgpa VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_education_profile ON education(profile_id);

-- 6. Projects
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(64) PRIMARY KEY,
    profile_id VARCHAR(64) NOT NULL REFERENCES candidate_profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    technologies TEXT[] NOT NULL DEFAULT '{}',
    github_url VARCHAR(500),
    live_url VARCHAR(500),
    highlights TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_projects_profile ON projects(profile_id);

-- 7. Jobs Management
CREATE TABLE IF NOT EXISTS jobs (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    employment_type VARCHAR(50) NOT NULL DEFAULT 'Full-time',
    description TEXT NOT NULL,
    source_url VARCHAR(1000),
    is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
    match_score INTEGER,
    status VARCHAR(50),
    date_added DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_jobs_user ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_date ON jobs(date_added);

-- 8. Job Analysis (AI Output)
CREATE TABLE IF NOT EXISTS job_analysis (
    id VARCHAR(64) PRIMARY KEY,
    job_id VARCHAR(64) NOT NULL UNIQUE REFERENCES jobs(id) ON DELETE CASCADE,
    overall_match INTEGER NOT NULL,
    technical_match INTEGER NOT NULL,
    experience_match INTEGER NOT NULL,
    education_match INTEGER NOT NULL,
    strong_matches TEXT[] NOT NULL DEFAULT '{}',
    missing_required_skills TEXT[] NOT NULL DEFAULT '{}',
    missing_preferred_skills TEXT[] NOT NULL DEFAULT '{}',
    skill_importance JSONB NOT NULL DEFAULT '{}',
    recommendations TEXT[] NOT NULL DEFAULT '{}',
    summary TEXT NOT NULL,
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_analysis_job ON job_analysis(job_id);

-- 9. Skill Gaps
CREATE TABLE IF NOT EXISTS skill_gaps (
    id VARCHAR(64) PRIMARY KEY,
    analysis_id VARCHAR(64) NOT NULL REFERENCES job_analysis(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    is_required BOOLEAN NOT NULL DEFAULT TRUE,
    importance_level VARCHAR(20) NOT NULL DEFAULT 'HIGH', -- HIGH, MEDIUM, LOW
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_gaps_analysis ON skill_gaps(analysis_id);

-- 10. Job Applications
CREATE TABLE IF NOT EXISTS applications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id VARCHAR(64) REFERENCES jobs(id) ON DELETE SET NULL,
    company VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    match_score INTEGER,
    status VARCHAR(50) NOT NULL DEFAULT 'SAVED', -- SAVED, APPLIED, ASSESSMENT, INTERVIEW, OFFER, REJECTED
    applied_date DATE NOT NULL DEFAULT CURRENT_DATE,
    interview_date DATE,
    follow_up_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_applications_user ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

-- 11. Interview Sessions
CREATE TABLE IF NOT EXISTS interview_sessions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id VARCHAR(64) REFERENCES jobs(id) ON DELETE SET NULL,
    job_title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    difficulty VARCHAR(50) NOT NULL, -- Beginner, Intermediate, Advanced
    category VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'IN_PROGRESS', -- IN_PROGRESS, COMPLETED
    current_question_index INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL DEFAULT 5,
    overall_score INTEGER,
    verdict VARCHAR(50), -- STRONG_HIRE, HIRE, LEANING_HIRE, NEEDS_WORK
    feedback_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX IF NOT EXISTS idx_interviews_user ON interview_sessions(user_id);

-- 12. Interview Questions
CREATE TABLE IF NOT EXISTS interview_questions (
    id VARCHAR(64) PRIMARY KEY,
    session_id VARCHAR(64) NOT NULL REFERENCES interview_sessions(id) ON DELETE CASCADE,
    question_number INTEGER NOT NULL,
    question TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_questions_session ON interview_questions(session_id);

-- 13. Interview Answers & Evaluations
CREATE TABLE IF NOT EXISTS interview_answers (
    id VARCHAR(64) PRIMARY KEY,
    question_id VARCHAR(64) NOT NULL UNIQUE REFERENCES interview_questions(id) ON DELETE CASCADE,
    candidate_answer TEXT NOT NULL,
    technical_accuracy INTEGER NOT NULL,
    conceptual_depth INTEGER NOT NULL,
    practical_understanding INTEGER NOT NULL,
    communication INTEGER NOT NULL,
    overall_score INTEGER NOT NULL,
    feedback TEXT NOT NULL,
    key_strengths TEXT[] NOT NULL DEFAULT '{}',
    improvement_areas TEXT[] NOT NULL DEFAULT '{}',
    sample_ideal_answer TEXT,
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_answers_question ON interview_answers(question_id);

-- 14. Tailored Resume Versions
CREATE TABLE IF NOT EXISTS resume_versions (
    id VARCHAR(64) PRIMARY KEY,
    job_id VARCHAR(64) NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    job_title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    tailored_headline VARCHAR(500),
    tailored_summary TEXT,
    ats_keywords TEXT[] NOT NULL DEFAULT '{}',
    markdown_content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_resumes_job ON resume_versions(job_id);

-- 15. Tailored Cover Letters
CREATE TABLE IF NOT EXISTS cover_letters (
    id VARCHAR(64) PRIMARY KEY,
    job_id VARCHAR(64) NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    company VARCHAR(255) NOT NULL,
    job_title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_cover_letters_job ON cover_letters(job_id);

-- 16. Learning Plans
CREATE TABLE IF NOT EXISTS learning_plans (
    id VARCHAR(64) PRIMARY KEY,
    job_id VARCHAR(64) NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    job_title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_learning_plans_job ON learning_plans(job_id);

-- 17. Learning Plan Items
CREATE TABLE IF NOT EXISTS learning_plan_items (
    id VARCHAR(64) PRIMARY KEY,
    plan_id VARCHAR(64) NOT NULL REFERENCES learning_plans(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    priority VARCHAR(20) NOT NULL, -- HIGH, MEDIUM, LOW
    why_it_matters TEXT NOT NULL,
    topics TEXT[] NOT NULL DEFAULT '{}',
    estimated_hours VARCHAR(50),
    practice_task TEXT NOT NULL,
    interview_questions TEXT[] NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS idx_plan_items ON learning_plan_items(plan_id);
