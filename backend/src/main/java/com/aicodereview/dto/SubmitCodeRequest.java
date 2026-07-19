package com.aicodereview.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SubmitCodeRequest {
    @NotBlank(message = "Project name is required")
    private String projectName;

    @NotBlank(message = "Source code cannot be empty")
    private String sourceCode;

    private String fileName;
}
