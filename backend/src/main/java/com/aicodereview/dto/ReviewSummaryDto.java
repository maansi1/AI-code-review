package com.aicodereview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewSummaryDto {
    private Long id;
    private Long projectId;
    private String projectName;
    private Integer reviewScore;
    private Integer criticalCount;
    private Integer highCount;
    private String status;
    private Instant createdAt;
}
