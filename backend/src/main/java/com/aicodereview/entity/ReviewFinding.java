package com.aicodereview.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "review_findings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewFinding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "review_id", nullable = false)
    private Review review;

    @Column(nullable = false, length = 20)
    private String severity; // CRITICAL, HIGH, MEDIUM, LOW, INFO

    @Column(nullable = false, length = 40)
    private String category; // BUG, SECURITY, CODE_SMELL, PERFORMANCE, STYLE, AI_SUGGESTION

    @Column(nullable = false, length = 200)
    private String issue;

    @Lob
    private String explanation;

    @Lob
    private String suggestion;

    @Column(length = 200)
    private String fileName;

    private Integer lineNumber;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String source = "STATIC"; // STATIC or AI
}
