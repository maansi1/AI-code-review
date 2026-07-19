package com.aicodereview.controller;

import com.aicodereview.dto.ReviewResponseDto;
import com.aicodereview.dto.SubmitCodeRequest;
import com.aicodereview.entity.User;
import com.aicodereview.exception.ApiException;
import com.aicodereview.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class FileUploadController {

    private final ReviewService reviewService;
    private static final long MAX_SIZE = 15L * 1024 * 1024;

    @PostMapping
    public ResponseEntity<ReviewResponseDto> uploadAndReview(@AuthenticationPrincipal User user,
                                                               @RequestParam("file") MultipartFile file,
                                                               @RequestParam(value = "projectName", required = false) String projectName) {
        if (file.isEmpty()) {
            throw new ApiException("Uploaded file is empty", HttpStatus.BAD_REQUEST);
        }
        if (file.getSize() > MAX_SIZE) {
            throw new ApiException("File exceeds the 15MB upload limit", HttpStatus.PAYLOAD_TOO_LARGE);
        }
        if (!file.getOriginalFilename().endsWith(".java")) {
            throw new ApiException("Only .java files are supported in this MVP (ZIP project support is a listed extension point)", HttpStatus.BAD_REQUEST);
        }

        try {
            String content = new String(file.getBytes(), StandardCharsets.UTF_8);
            SubmitCodeRequest request = new SubmitCodeRequest();
            request.setProjectName(projectName != null && !projectName.isBlank() ? projectName : file.getOriginalFilename());
            request.setSourceCode(content);
            request.setFileName(file.getOriginalFilename());
            return ResponseEntity.ok(reviewService.submitAndReview(user, request));
        } catch (Exception e) {
            throw new ApiException("Failed to read uploaded file: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}
