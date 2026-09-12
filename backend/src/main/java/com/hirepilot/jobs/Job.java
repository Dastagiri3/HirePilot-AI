package com.hirepilot.jobs;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "jobs", indexes = {
    @Index(name = "idx_jobs_user", columnList = "user_id"),
    @Index(name = "idx_jobs_date", columnList = "date_added")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Job {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "user_id", nullable = false, length = 64)
    private String userId;

    @Column(nullable = false)
    private String company;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String location;

    @Column(name = "employment_type", nullable = false)
    @Builder.Default
    private String employmentType = "Full-time";

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(name = "source_url", length = 1000)
    private String sourceUrl;

    @Column(name = "is_favorite", nullable = false)
    @Builder.Default
    private Boolean isFavorite = false;

    @Column(name = "match_score")
    private Integer matchScore;

    private String status;

    @Column(name = "date_added", nullable = false)
    @Builder.Default
    private LocalDate dateAdded = LocalDate.now();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}
