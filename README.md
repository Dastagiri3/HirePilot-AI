# HirePilot AI — AI-Powered Job Search & Interview Copilot

> **Production-Grade Full-Stack Portfolio Application**  
> *Built with Java 21, Spring Boot 3, PostgreSQL, React 19, TypeScript, Tailwind CSS, and Google Gemini AI.*

---

## 1. Product Vision & Executive Summary

Job hunting for modern software engineering roles is often inefficient and fragmented:
1. **Generic Resumes Get Filtered:** ATS systems discard resumes that don't match specific technical keywords.
2. **Blind Spot Skill Gaps:** Candidates lack objective insight into why they match 75% of a job versus 95%, or what concrete technologies they must learn first.
3. **Unprepared for High-Pressure Technical Screens:** Traditional interview prep is static (reading LeetCode solutions or flashcards) rather than an adaptive conversational interviewer challenging technical depth and trade-offs.

**HirePilot AI** solves this end-to-end:
```
Candidate Profile  ──►  Target Job Description  ──►  AI Job Analyzer (Gemini 3.8 Flash)
                                                               │
     ┌──────────────────────┬──────────────────────┬───────────┴──────────┐
     ▼                      ▼                      ▼                      ▼
Match Score (88%)    Skill Gap Matrix    Project Recommender      ATS Resume Copilot
Technical/Exp/Edu    Missing Skills      Ranked Portfolio         Tailored Markdown
                            │
     ┌──────────────────────┴──────────────────────┐
     ▼                                             ▼
Personalized Learning Plan                 Adaptive AI Technical Interview
Actionable Curriculum & Tasks              Live Question & Evaluation Loop
                                                   │
                                                   ▼
                                       Kanban Application Tracker
```

---

## 2. Tech Stack & Architecture

### Backend Architecture
- **Language & Runtime:** Java 21 (Eclipse Temurin LTS), Spring Boot 3.3.4
- **Security:** Spring Security 6, Stateless JWT (JJWT 0.12.6), BCrypt 12-round hashing
- **Data Persistence:** Spring Data JPA / Hibernate, PostgreSQL 16, HikariCP connection pooling
- **API Documentation:** OpenAPI 3.0 via SpringDoc & Swagger UI (`/swagger-ui.html`)
- **Testing:** JUnit 5, Mockito, Testcontainers for real isolated PostgreSQL integration tests

### Client & Live Server Architecture
- **Web Client:** React 19, TypeScript 5.8, Tailwind CSS, Lucide React, Motion animations
- **Container Server:** Express + Vite runtime bridging client UI, REST endpoints, and secure server-side Gemini AI calls
- **AI Engine:** Google Gemini (`gemini-3.8-flash`) initialized exclusively server-side via `@google/genai`
- **Data Store:** Thread-safe, JSON/PostgreSQL-compatible ACID store with demo data pre-seeded

---

## 3. Core Modules & Capabilities

1. **Authentication & Authorization:** Secure registration and login, JWT issuance, BCrypt password hashing, and user-level data isolation preventing IDOR attacks.
2. **Candidate Profile Management:** Manage verified technical skills with proficiency levels, educational history, and portfolio projects with GitHub repositories and metrics.
3. **Job Management:** Save, filter, and track job postings from Stripe, Netflix, Datadog, etc.
4. **AI Job Analyzer:** Deep structural comparison returning Overall, Technical, Experience, and Education match scores, strong matches, and missing required vs preferred skills.
5. **Project Recommender:** Ranks candidate's real projects according to target job requirements with custom bullet points, strictly preventing hallucination.
6. **ATS Resume Copilot & Cover Letter Generator:** Tailors resumes and cover letters targeted directly to the hiring team.
7. **Personalized Learning Plan:** Curated study plans, estimated hours, hands-on practice projects, and typical interview questions for each missing skill.
8. **Adaptive AI Technical Interviewer:** Live simulated interview asking one question at a time, evaluating candidate answers across 4 axes (Technical Accuracy, Conceptual Depth, Practical Understanding, Communication), and providing a comprehensive final evaluation report.
9. **Kanban Application Tracker & Analytics Dashboard:** Visual board across 6 stages (`SAVED`, `APPLIED`, `ASSESSMENT`, `INTERVIEW`, `OFFER`, `REJECTED`) with KPIs, conversion metrics, and upcoming interview schedules.

---

## 4. Local Quickstart with Docker Compose

Ensure Docker and Docker Compose are installed, then run:

```bash
# Clone the repository
git clone https://github.com/your-username/hirepilot-ai.git
cd hirepilot-ai

# Launch all microservices (PostgreSQL, Spring Boot Backend, Frontend)
docker compose up --build
```

Access services:
- **Web Application:** `http://localhost:3000`
- **Spring Boot API:** `http://localhost:8080`
- **Swagger Documentation:** `http://localhost:8080/swagger-ui.html`
- **PostgreSQL Database:** `localhost:5432` (`hirepilot_db`)

---

## 5. Security Guardrails

- **Zero Client-Side Keys:** API keys and JWT secrets are stored solely in server environment variables.
- **IDOR Protection:** All API endpoints verify `entity.userId == authenticatedUser.id`.
- **Strict Anti-Hallucination Prompts:** The AI system instruction strictly forbids inventing candidate skills, experiences, or project metrics.
