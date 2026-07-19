package com.aicodereview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponseDto {
    private Long id;
    private Long projectId;
    private String projectName;
    private Integer reviewScore;
    private Integer classCount;
    private Integer methodCount;
    private Integer linesOfCode;
    private Double avgMethodLength;
    private Integer cyclomaticComplexity;
    private Double maintainabilityIndex;
    private String summary;
    private String status;
    private Instant createdAt;
    private String sourceCode;
    private List<FindingDto> findings;
}
