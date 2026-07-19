package com.aicodereview.service;

import com.aicodereview.dto.*;
import com.aicodereview.entity.Project;
import com.aicodereview.entity.Review;
import com.aicodereview.entity.ReviewFinding;
import com.aicodereview.entity.User;
import com.aicodereview.exception.ApiException;
import com.aicodereview.exception.ResourceNotFoundException;
import com.aicodereview.repository.ProjectRepository;
import com.aicodereview.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ProjectRepository projectRepository;
    private final ReviewRepository reviewRepository;
    private final StaticAnalysisService staticAnalysisService;
    private final AiReviewService aiReviewService;

    private static final Map<String, Integer> SEVERITY_PENALTY = Map.of(
            "CRITICAL", 15, "HIGH", 8, "MEDIUM", 4, "LOW", 1, "INFO", 0);

    @Transactional
    public ReviewResponseDto submitAndReview(User user, SubmitCodeRequest request) {
        if (request.getSourceCode().length() > 200_000) {
            throw new ApiException("Source exceeds the 200,000 character limit for a single submission", HttpStatus.PAYLOAD_TOO_LARGE);
        }

        Project project = Project.builder()
                .user(user)
                .projectName(request.getProjectName())
                .uploadType(request.getFileName() != null ? "FILE" : "PASTE")
                .language("Java")
                .sourceCode(request.getSourceCode())
                .build();
        projectRepository.save(project);

        StaticAnalysisService.AnalysisResult staticResult =
                staticAnalysisService.analyze(request.getSourceCode(), request.getFileName());

        AiReviewService.AiReviewResult aiResult = aiReviewService.review(request.getSourceCode());

        List<ReviewFinding> allFindings = new ArrayList<>(staticResult.findings());
        allFindings.addAll(aiResult.findings());

        int staticScore = computeStaticScore(staticResult.findings());
        int finalScore = aiResult.qualityScore() != null
                ? Math.round((staticScore + aiResult.qualityScore()) / 2f)
                : staticScore;

        String summary = buildSummary(staticResult, aiResult, finalScore, allFindings.size());

        Review review = Review.builder()
                .project(project)
                .reviewScore(finalScore)
                .classCount(staticResult.classCount())
                .methodCount(staticResult.methodCount())
                .linesOfCode(staticResult.linesOfCode())
                .avgMethodLength(staticResult.avgMethodLength())
                .cyclomaticComplexity(staticResult.cyclomaticComplexity())
                .maintainabilityIndex(staticResult.maintainabilityIndex())
                .summary(summary)
                .aiRawResponse(aiResult.rawResponse())
                .status("COMPLETED")
                .build();

        for (ReviewFinding f : allFindings) {
            f.setReview(review);
        }
        review.setFindings(allFindings);

        reviewRepository.save(review);
        return toDto(review);
    }

    @Transactional(readOnly = true)
    public ReviewResponseDto getReview(User user, Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        assertOwnership(review, user);
        return toDto(review);
    }

    @Transactional(readOnly = true)
    public List<ReviewSummaryDto> listReviews(User user, String query) {
        List<Review> reviews = (query == null || query.isBlank())
                ? reviewRepository.findAllByUserId(user.getId())
                : reviewRepository.searchByUserId(user.getId(), query);

        return reviews.stream().map(this::toSummaryDto).collect(Collectors.toList());
    }

    @Transactional
    public void deleteReview(User user, Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        assertOwnership(review, user);
        reviewRepository.delete(review);
    }

    private void assertOwnership(Review review, User user) {
        if (!review.getProject().getUser().getId().equals(user.getId())) {
            throw new ApiException("You do not have access to this review", HttpStatus.FORBIDDEN);
        }
    }

    private int computeStaticScore(List<ReviewFinding> findings) {
        int penalty = findings.stream()
                .mapToInt(f -> SEVERITY_PENALTY.getOrDefault(f.getSeverity(), 1))
                .sum();
        return Math.max(0, Math.min(100, 100 - penalty));
    }

    private String buildSummary(StaticAnalysisService.AnalysisResult staticResult,
                                 AiReviewService.AiReviewResult aiResult, int finalScore, int findingCount) {
        StringBuilder sb = new StringBuilder();
        sb.append("Quality score: ").append(finalScore).append("/100 across ").append(findingCount).append(" finding(s). ");
        sb.append(staticResult.classCount()).append(" class(es), ").append(staticResult.methodCount())
                .append(" method(s), cyclomatic complexity ").append(staticResult.cyclomaticComplexity()).append(". ");
        if (aiResult.summary() != null && !aiResult.summary().isBlank()) {
            sb.append(aiResult.summary());
        }
        return sb.toString();
    }

    private ReviewResponseDto toDto(Review review) {
        List<FindingDto> findingDtos = review.getFindings().stream()
                .map(f -> FindingDto.builder()
                        .id(f.getId())
                        .severity(f.getSeverity())
                        .category(f.getCategory())
                        .issue(f.getIssue())
                        .explanation(f.getExplanation())
                        .suggestion(f.getSuggestion())
                        .fileName(f.getFileName())
                        .lineNumber(f.getLineNumber())
                        .source(f.getSource())
                        .build())
                .collect(Collectors.toList());

        return ReviewResponseDto.builder()
                .id(review.getId())
                .projectId(review.getProject().getId())
                .projectName(review.getProject().getProjectName())
                .reviewScore(review.getReviewScore())
                .classCount(review.getClassCount())
                .methodCount(review.getMethodCount())
                .linesOfCode(review.getLinesOfCode())
                .avgMethodLength(review.getAvgMethodLength())
                .cyclomaticComplexity(review.getCyclomaticComplexity())
                .maintainabilityIndex(review.getMaintainabilityIndex())
                .summary(review.getSummary())
                .status(review.getStatus())
                .createdAt(review.getCreatedAt())
                .sourceCode(review.getProject().getSourceCode())
                .findings(findingDtos)
                .build();
    }

    private ReviewSummaryDto toSummaryDto(Review review) {
        long critical = review.getFindings().stream().filter(f -> "CRITICAL".equals(f.getSeverity())).count();
        long high = review.getFindings().stream().filter(f -> "HIGH".equals(f.getSeverity())).count();
        return ReviewSummaryDto.builder()
                .id(review.getId())
                .projectId(review.getProject().getId())
                .projectName(review.getProject().getProjectName())
                .reviewScore(review.getReviewScore())
                .criticalCount((int) critical)
                .highCount((int) high)
                .status(review.getStatus())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
