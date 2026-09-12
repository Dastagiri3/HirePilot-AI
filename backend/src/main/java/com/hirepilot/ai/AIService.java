package com.hirepilot.ai;

import com.hirepilot.profile.CandidateProfile;
import com.hirepilot.jobs.Job;

import java.util.Map;

public interface AIService {
    Map<String, Object> analyzeJob(CandidateProfile candidate, Job job);
    Map<String, Object> recommendProjects(CandidateProfile candidate, Job job);
    Map<String, Object> generateTailoredResume(CandidateProfile candidate, Job job);
    Map<String, Object> generateCoverLetter(CandidateProfile candidate, Job job);
    Map<String, Object> generateLearningPlan(CandidateProfile candidate, Job job);
    Map<String, Object> generateInterviewQuestion(String jobTitle, String company, String category, String difficulty, int questionNumber);
    Map<String, Object> evaluateInterviewAnswer(String question, String category, String difficulty, String candidateAnswer);
}
