# HirePilot AI — QA Test & Verification Report

## 1. Test Summary
- **Total Test Cases Executed:** 28
- **Tests Passed:** 28
- **Tests Failed:** 0
- **Pass Rate:** 100%

## 2. Test Execution Log

| Test ID | Area | Workflow Description | Status |
| :--- | :--- | :--- | :--- |
| **TC-01** | Auth | Candidate User Registration with email, name, and password | **PASS** |
| **TC-02** | Auth | Login with BCrypt hash verification & JWT token issuance | **PASS** |
| **TC-03** | Auth | Rejection of unauthorized requests without Bearer token | **PASS** |
| **TC-04** | Security | IDOR Attack Simulation: Attempting to access another user's profile | **PASS** |
| **TC-05** | Profile | Updating candidate headline, professional summary, and URLs | **PASS** |
| **TC-06** | Profile | Adding new technical skill with proficiency level and years of exp | **PASS** |
| **TC-07** | Profile | Adding and deleting candidate project with GitHub URL and highlights | **PASS** |
| **TC-08** | Profile | Adding candidate education record with institution and CGPA | **PASS** |
| **TC-09** | Jobs | Saving new job description (Stripe Senior Full Stack Engineer) | **PASS** |
| **TC-10** | Jobs | Job search and filtering by company and keyword | **PASS** |
| **TC-11** | Jobs | Toggling job favorite status | **PASS** |
| **TC-12** | AI | Triggering AI Job Analyzer with Gemini 3.8 Flash | **PASS** |
| **TC-13** | AI | Validating structured JSON scores (Overall, Tech, Exp, Edu) | **PASS** |
| **TC-14** | AI | Verifying strict anti-hallucination compliance (no fabricated skills) | **PASS** |
| **TC-15** | AI | Project Recommender: Ranking candidate projects with relevance % | **PASS** |
| **TC-16** | AI | ATS Resume Copilot: Generating tailored Markdown resume | **PASS** |
| **TC-17** | AI | Cover Letter Generator: Creating concise, targeted letter | **PASS** |
| **TC-18** | AI | Personalized Learning Plan: Curriculum for missing skills & tasks | **PASS** |
| **TC-19** | Interview | Initializing adaptive mock interview session (Question 1) | **PASS** |
| **TC-20** | Interview | Submitting candidate answer & receiving multi-axis evaluation | **PASS** |
| **TC-21** | Interview | Generating adaptive Question 2 based on previous performance | **PASS** |
| **TC-22** | Interview | Completing interview session & receiving final hiring verdict | **PASS** |
| **TC-23** | Tracker | Creating job application and setting status to 'APPLIED' | **PASS** |
| **TC-24** | Tracker | Moving application between Kanban columns to 'INTERVIEW' and 'OFFER' | **PASS** |
| **TC-25** | Dashboard | Computing KPIs: Applications, interviews, offers, and average match | **PASS** |
| **TC-26** | Dashboard | Profile completion percentage calculation | **PASS** |
| **TC-27** | API | OpenAPI 3.0 specification endpoint (`/api/docs`) | **PASS** |
| **TC-28** | Health | Actuator / Service Health check endpoint (`/api/health`) | **PASS** |

## 3. Security Findings
- Zero plaintext passwords in database or memory.
- All secrets read from environment variables; zero hardcoded credentials.
- Authorization middleware enforces user identity on all write and read operations.
