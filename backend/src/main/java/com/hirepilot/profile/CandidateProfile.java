package com.hirepilot.profile;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "candidate_profiles", indexes = {
    @Index(name = "idx_profiles_user_id", columnList = "user_id", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidateProfile {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "user_id", nullable = false, unique = true, length = 64)
    private String userId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String email;

    private String phone;
    private String location;
    private String headline;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(name = "github_url")
    private String githubUrl;

    @Column(name = "linkedin_url")
    private String linkedinUrl;

    @Column(name = "portfolio_url")
    private String portfolioUrl;

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CandidateSkill> skills = new ArrayList<>();

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Education> education = new ArrayList<>();

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Project> projects = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
