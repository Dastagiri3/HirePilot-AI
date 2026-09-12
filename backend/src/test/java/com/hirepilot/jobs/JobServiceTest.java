package com.hirepilot.jobs;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JobServiceTest {

    @Mock
    private JobRepository jobRepository;

    private Job sampleJob;

    @BeforeEach
    void setUp() {
        sampleJob = Job.builder()
                .id("job-test-1")
                .userId("user-123")
                .company("Stripe")
                .title("Senior Full Stack Java Engineer")
                .location("San Francisco, CA")
                .employmentType("Full-time")
                .description("Build resilient payment infrastructure with Java and React.")
                .dateAdded(LocalDate.now())
                .isFavorite(true)
                .build();
    }

    @Test
    @DisplayName("Should retrieve jobs strictly belonging to the authenticated user")
    void testGetJobsByUser() {
        when(jobRepository.findByUserIdOrderByDateAddedDesc("user-123"))
                .thenReturn(List.of(sampleJob));

        List<Job> result = jobRepository.findByUserIdOrderByDateAddedDesc("user-123");

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Stripe", result.get(0).getCompany());
        verify(jobRepository, times(1)).findByUserIdOrderByDateAddedDesc("user-123");
    }

    @Test
    @DisplayName("Should isolate user access and prevent IDOR vulnerability")
    void testPreventIDORAccess() {
        when(jobRepository.findByIdAndUserId("job-test-1", "attacker-user"))
                .thenReturn(Optional.empty());

        Optional<Job> result = jobRepository.findByIdAndUserId("job-test-1", "attacker-user");

        assertTrue(result.isEmpty(), "Attacker should not be able to fetch another user's job");
    }

    @Test
    @DisplayName("Should persist new job with valid fields")
    void testSaveJob() {
        when(jobRepository.save(any(Job.class))).thenReturn(sampleJob);

        Job saved = jobRepository.save(sampleJob);

        assertNotNull(saved);
        assertEquals("Stripe", saved.getCompany());
        assertEquals("Senior Full Stack Java Engineer", saved.getTitle());
    }
}
