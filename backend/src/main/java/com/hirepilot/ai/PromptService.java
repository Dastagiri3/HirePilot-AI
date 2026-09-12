package com.hirepilot.ai;

import com.hirepilot.jobs.Job;
import com.hirepilot.profile.CandidateProfile;
import org.springframework.stereotype.Service;

@Service
public class PromptService {

    public String buildJobAnalysisPrompt(CandidateProfile candidate, Job job) {
        return """
            You are HirePilot AI, an elite Senior Software Engineering Career Copilot.
            STRICT ANTI-HALLUCINATION DIRECTIVE:
            1. You MUST NEVER invent or hallucinate skills, years of experience, degrees, projects, achievements, or technologies for the candidate.
            2. Only assess against verified candidate information.

            Candidate:
            - Name: %s
            - Headline: %s
            - Summary: %s
            - Verified Skills: %s

            Target Job:
            - Company: %s
            - Title: %s
            - Description:
            %s

            Return a structured JSON object with overallMatch, technicalMatch, experienceMatch, educationMatch, strongMatches, missingRequiredSkills, missingPreferredSkills, skillImportance, recommendations, and summary.
            """.formatted(
                candidate.getName(),
                candidate.getHeadline(),
                candidate.getSummary(),
                candidate.getSkills() != null ? candidate.getSkills().toString() : "None listed",
                job.getCompany(),
                job.getTitle(),
                job.getDescription()
            );
    }

    public String buildProjectRecommenderPrompt(CandidateProfile candidate, Job job) {
        return """
            You are HirePilot AI Project Recommender.
            Rank the candidate's existing verified projects based on their relevance to:
            %s at %s.
            STRICT RULE: Never invent project technologies or features.
            """.formatted(job.getTitle(), job.getCompany());
    }

    public String buildResumeTailoringPrompt(CandidateProfile candidate, Job job) {
        return """
            You are HirePilot AI Resume Copilot.
            Reframe, prioritize, and structure the verified candidate data for:
            %s at %s.
            STRICT RULE: Never fabricate metrics, experience, education, or skills.
            """.formatted(job.getTitle(), job.getCompany());
    }

    public String buildInterviewQuestionPrompt(String jobTitle, String company, String category, String difficulty, int qNum) {
        return """
            You are a Senior Staff Engineer conducting a technical interview for %s at %s.
            Category: %s
            Difficulty: %s
            Question Number: %d
            Ask exactly ONE focused technical question testing practical systems or language architecture.
            """.formatted(jobTitle, company, category, difficulty, qNum);
    }
}
