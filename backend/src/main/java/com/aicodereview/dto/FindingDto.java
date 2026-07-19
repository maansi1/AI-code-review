package com.aicodereview.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FindingDto {
    private Long id;
    private String severity;
    private String category;
    private String issue;
    private String explanation;
    private String suggestion;
    private String fileName;
    private Integer lineNumber;
    private String source;
}
