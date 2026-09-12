# HirePilot AI — System Architecture & Design Document

## 1. High-Level Architectural Diagram

```
[ Web Browser Client ]
        │
        │ HTTPS / JSON / Bearer JWT
        ▼
[ Ingress Reverse Proxy / Port 3000 ]
        │
        ├──► [ Express + Vite Dev & API Engine / Port 3000 ]
        │         │
        │         ├──► [ Google GenAI SDK (gemini-3.8-flash) ]  (Server-Side Only)
        │         │
        │         └──► [ PostgreSQL Compatible Persistent Store ]
        │
        └──► [ Spring Boot 3 Core Backend / Port 8080 (Docker) ]
                  │
                  ├──► [ Spring Security Filter Chain & JWT Validator ]
                  │
                  ├──► [ Spring Data JPA / Hibernate Layer ]
                  │         │
                  │         ▼
                  │    [ PostgreSQL 16 Cluster ]
                  │
                  └──► [ Spring AI / Gemini REST Client Proxy ]
```

## 2. Layered Backend Design Pattern

The Spring Boot backend (`backend/src/main/java/com/hirepilot/`) implements a strict 5-tier architecture:

1. **Controller Tier (`com.hirepilot.*.controller`):**
   - Thin REST endpoints responsible solely for HTTP request decoding, DTO validation (`@Valid`), HTTP status codes, and delegation.
   - Zero business logic in controllers.
2. **Service Tier (`com.hirepilot.*.service`):**
   - Encapsulates transaction boundaries (`@Transactional`), business rules, and security context checks.
   - Enforces user isolation checks: `if (!entity.getUserId().equals(currentUser.getId())) throw new AccessDeniedException()`.
3. **Repository Tier (`com.hirepilot.*.repository`):**
   - Extends Spring Data JPA `JpaRepository` with indexed lookup queries avoiding N+1 queries.
4. **Domain Entity Tier (`com.hirepilot.*.entity`):**
   - JPA entities with Hibernate annotations, audit timestamps (`@CreationTimestamp`, `@UpdateTimestamp`), and explicit column constraints.
5. **AI Integration Tier (`com.hirepilot.ai.*`):**
   - Decoupled `AIService` interface with `GeminiAIService` implementation.
   - Isolated `PromptService` generating hardened prompts with anti-hallucination constraints.
   - `AIResponseParser` validating returned JSON before persisting to database.

## 3. Data Flow for Core User Journey

1. **Candidate Profiling:** User inputs skills, education, and GitHub projects. Stored with user ownership.
2. **Job Ingestion:** User inputs target job description (e.g. Stripe Senior Full Stack).
3. **AI Analysis:** Backend assembles candidate profile + job description, sends structured prompt to Gemini 3.8 Flash, parses JSON response into `JobAnalysis` entity, computes match score (88%), and records missing skills.
4. **Downstream AI Workflows:**
   - **Project Recommender:** Matches real candidate projects to job requirements.
   - **Resume Copilot:** Reorganizes verified facts into ATS-optimized Markdown.
   - **Learning Plan:** Builds personalized study tasks for missing skills.
   - **Adaptive Interviewer:** Simulates live technical round with score breakdown and feedback.
5. **Application Lifecycle:** Stored in Kanban pipeline with date alerts.
