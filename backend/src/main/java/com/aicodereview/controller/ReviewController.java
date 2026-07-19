package com.aicodereview.controller;

import com.aicodereview.dto.ReviewResponseDto;
import com.aicodereview.dto.ReviewSummaryDto;
import com.aicodereview.dto.SubmitCodeRequest;
import com.aicodereview.entity.User;
import com.aicodereview.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<ReviewResponseDto> submitCode(@AuthenticationPrincipal User user,
                                                          @Valid @RequestBody SubmitCodeRequest request) {
        return ResponseEntity.ok(reviewService.submitAndReview(user, request));
    }

    @GetMapping
    public ResponseEntity<List<ReviewSummaryDto>> listReviews(@AuthenticationPrincipal User user,
                                                                @RequestParam(required = false) String query) {
        return ResponseEntity.ok(reviewService.listReviews(user, query));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReviewResponseDto> getReview(@AuthenticationPrincipal User user, @PathVariable Long id) {
        return ResponseEntity.ok(reviewService.getReview(user, id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteReview(@AuthenticationPrincipal User user, @PathVariable Long id) {
        reviewService.deleteReview(user, id);
        return ResponseEntity.ok(Map.of("message", "Review deleted"));
    }
}
