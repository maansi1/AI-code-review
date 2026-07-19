package com.aicodereview.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "reviews")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false)
    private Integer reviewScore; // 0-100

    @Column(nullable = false)
    private Integer classCount;

    @Column(nullable = false)
    private Integer methodCount;

    @Column(nullable = false)
    private Integer linesOfCode;

    @Column(nullable = false)
    private Double avgMethodLength;

    @Column(nullable = false)
    private Integer cyclomaticComplexity;

    @Column(nullable = false)
    private Double maintainabilityIndex;

    @Lob
    private String summary;

    @Lob
    private String aiRawResponse;

    @Column(nullable = false)
    @Builder.Default
    private String status = "COMPLETED"; // PENDING, COMPLETED, FAILED

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @OneToMany(mappedBy = "review", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<ReviewFinding> findings = new ArrayList<>();

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }
}
