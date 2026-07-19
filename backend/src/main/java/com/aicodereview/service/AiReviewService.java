package com.aicodereview.service;

import com.aicodereview.entity.ReviewFinding;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiReviewService {

    private final RestClient aiRestClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.gemini.api-key:}")
    private String geminiApiKey;

    @Value("${app.gemini.model:}")
    private String geminiModel;

    @Value("${app.groq.api-key:}")
    private String groqApiKey;

    @Value("${app.groq.model:}")
    private String groqModel;

    @Value("${app.groq.base-url:}")
    private String groqBaseUrl;

    @Value("${app.gemini.base-url:}")
    private String geminiBaseUrl;

    private static final String SYSTEM_PROMPT = """
            You are a Senior Java Software Engineer performing a code review.
            Review the submitted Java code and respond with ONLY a JSON object
            (no markdown fences, no commentary) matching this exact shape:
            {
              "qualityScore": <integer 0-100>,
              "summary": "<2-4 sentence overall summary>",
              "findings": [
                {
                  "category": "BUG|SECURITY|CODE_SMELL|PERFORMANCE|STYLE",
                  "severity": "CRITICAL|HIGH|MEDIUM|LOW|INFO",
                  "issue": "<short title>",
                  "explanation": "<why it matters>",
                  "suggestion": "<concrete fix, include better naming or refactor advice where relevant>",
                  "lineNumber": <integer or null>
                }
              ]
            }
            Cover bugs, security vulnerabilities, code smells, performance,
            naming, and refactoring opportunities. Be specific and concise.
            """;

    public AiReviewResult review(String sourceCode) {
        if (isConfigured(groqApiKey)) {
            return reviewWithGroq(sourceCode);
        } else if (isConfigured(geminiApiKey)) {
            return reviewWithGemini(sourceCode);
        }

        log.warn("No AI API key configured - skipping AI review.");
        return new AiReviewResult(null, "AI review skipped: no API key configured.", List.of(), null);
    }

    private boolean isConfigured(String key) {
        return key != null && !key.isBlank() && !key.startsWith("${");
    }

    private AiReviewResult reviewWithGroq(String sourceCode) {
        try {
            Map<String, Object> body = Map.of(
                    "model", groqModel,
                    "messages", List.of(
                            Map.of("role", "system", "content", SYSTEM_PROMPT),
                            Map.of("role", "user", "content", "Review this Java code:\n\n" + sourceCode)
                    ),
                    "response_format", Map.of("type", "json_object"),
                    "temperature", 0.2
            );

            String rawResponse = aiRestClient.post()
                    .uri(groqBaseUrl + "/chat/completions")
                    .header("Authorization", "Bearer " + groqApiKey)
                    .header("Content-Type", "application/json")
                    .body(body)
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(rawResponse);
            String content = root.path("choices").path(0).path("message").path("content").asText();
            return parseAiContent(content);

        } catch (Exception ex) {
            log.error("Groq review failed: {}", ex.getMessage());
            return new AiReviewResult(null, "AI review (Groq) unavailable: " + ex.getMessage(), List.of(), null);
        }
    }

    private AiReviewResult reviewWithGemini(String sourceCode) {
        try {
            Map<String, Object> body = Map.of(
                "contents", List.of(
                    Map.of("role", "user", "parts", List.of(
                        Map.of("text", SYSTEM_PROMPT + "\n\nReview this Java code:\n\n" + sourceCode)
                    ))
                ),
                "generationConfig", Map.of(
                    "temperature", 0.2,
                    "responseMimeType", "application/json"
                )
            );

            String rawResponse = aiRestClient.post()
                .uri(geminiBaseUrl + "/v1beta/models/{model}:generateContent?key={key}", geminiModel, geminiApiKey)
                    .header("Content-Type", "application/json")
                    .body(body)
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(rawResponse);
            String content = root.path("candidates").path(0).path("content").path("parts").path(0).path("text").asText();
            return parseAiContent(content);

        } catch (Exception ex) {
            log.error("Gemini review failed: {}", ex.getMessage());
            return new AiReviewResult(null, "AI review (Gemini) unavailable: " + ex.getMessage(), List.of(), null);
        }
    }

    private AiReviewResult parseAiContent(String content) throws Exception {
        JsonNode parsed = objectMapper.readTree(stripFences(content));

        Integer score = parsed.has("qualityScore") ? parsed.get("qualityScore").asInt() : null;
        String summary = parsed.path("summary").asText(null);

        List<ReviewFinding> findings = new ArrayList<>();
        for (JsonNode f : parsed.path("findings")) {
            findings.add(ReviewFinding.builder()
                    .category(f.path("category").asText("CODE_SMELL"))
                    .severity(f.path("severity").asText("LOW"))
                    .issue(f.path("issue").asText("AI finding"))
                    .explanation(f.path("explanation").asText(""))
                    .suggestion(f.path("suggestion").asText(""))
                    .lineNumber(f.hasNonNull("lineNumber") ? f.get("lineNumber").asInt() : null)
                    .source("AI")
                    .build());
        }

        return new AiReviewResult(score, summary, findings, content);
    }

    private String stripFences(String content) {
        String trimmed = content.trim();
        if (trimmed.startsWith("```")) {
            trimmed = trimmed.replaceFirst("^```(json)?", "").trim();
            if (trimmed.endsWith("```")) {
                trimmed = trimmed.substring(0, trimmed.length() - 3).trim();
            }
        }
        return trimmed;
    }

    public record AiReviewResult(Integer qualityScore, String summary, List<ReviewFinding> findings, String rawResponse) {}
}
