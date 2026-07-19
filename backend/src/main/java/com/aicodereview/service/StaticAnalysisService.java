package com.aicodereview.service;

import com.aicodereview.entity.ReviewFinding;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * A dependency-free static analyzer for Java source. It ships as the default
 * engine so the app works out of the box with zero external tooling.
 *
 * To upgrade to industrial-strength analysis, add the Checkstyle / PMD Maven
 * dependencies (see README "Upgrading static analysis") and implement an
 * additional AnalysisEngine that runs alongside this one - ReviewService
 * merges findings from every engine it is given.
 */
@Service
public class StaticAnalysisService {

    private static final Pattern CLASS_PATTERN = Pattern.compile("\\b(class|interface|enum|record)\\s+\\w+");
    private static final Pattern METHOD_PATTERN = Pattern.compile(
            "(public|private|protected)\\s+(static\\s+)?[\\w<>\\[\\],\\s]+\\s+\\w+\\s*\\([^;]*\\)\\s*\\{");
    private static final Pattern DECISION_POINT_PATTERN = Pattern.compile(
            "\\b(if|for|while|case|catch|&&|\\|\\|)\\b");
    private static final Pattern EMPTY_CATCH_PATTERN = Pattern.compile("catch\\s*\\([^)]*\\)\\s*\\{\\s*}");
    private static final Pattern SYSTEM_OUT_PATTERN = Pattern.compile("System\\.(out|err)\\.print(ln)?\\s*\\(");
    private static final Pattern TODO_PATTERN = Pattern.compile("//\\s*(TODO|FIXME)", Pattern.CASE_INSENSITIVE);
    private static final Pattern MAGIC_NUMBER_PATTERN = Pattern.compile("[^\\w.](?<!case )\\b\\d{2,}\\b(?!\\s*[;)]?\\s*//)");
    private static final Pattern BAD_VAR_NAME_PATTERN = Pattern.compile(
            "\\b(int|String|double|float|boolean|long|var)\\s+(l|o|I|temp|tmp|x1|data\\d*)\\b\\s*=");
    private static final Pattern PUBLIC_FIELD_PATTERN = Pattern.compile("public\\s+(?!static\\s+final)[\\w<>\\[\\]]+\\s+\\w+\\s*[;=]");
    private static final Pattern WILDCARD_IMPORT_PATTERN = Pattern.compile("import\\s+[\\w.]+\\.\\*;");
    private static final Pattern PASSWORD_LITERAL_PATTERN = Pattern.compile(
            "(?i)(password|secret|apikey|api_key)\\s*=\\s*\"[^\"]+\"");

    public AnalysisResult analyze(String sourceCode, String fileName) {
        List<ReviewFinding> findings = new ArrayList<>();
        String[] lines = sourceCode.split("\n", -1);

        int classCount = countMatches(CLASS_PATTERN, sourceCode);
        int methodCount = Math.max(1, countMatches(METHOD_PATTERN, sourceCode));
        int loc = (int) java.util.Arrays.stream(lines)
                .map(String::trim)
                .filter(l -> !l.isEmpty() && !l.startsWith("//") && !l.startsWith("*") && !l.startsWith("/*"))
                .count();
        int complexity = 1 + countMatches(DECISION_POINT_PATTERN, sourceCode);
        double avgMethodLength = methodCount > 0 ? Math.round(((double) loc / methodCount) * 10) / 10.0 : loc;

        // --- line-by-line checks ---
        for (int i = 0; i < lines.length; i++) {
            String line = lines[i];
            int lineNum = i + 1;

            check(SYSTEM_OUT_PATTERN, line, findings, fileName, lineNum, "LOW", "STYLE",
                    "Direct console output in production code",
                    "System.out/err calls bypass structured logging and can leak into production output.",
                    "Replace with a logger (e.g. SLF4J) so output can be filtered and routed by level.");

            check(TODO_PATTERN, line, findings, fileName, lineNum, "INFO", "CODE_SMELL",
                    "Unresolved TODO/FIXME comment",
                    "Marks work the author flagged as incomplete.",
                    "Resolve before merging, or convert into a tracked ticket.");

            check(BAD_VAR_NAME_PATTERN, line, findings, fileName, lineNum, "LOW", "STYLE",
                    "Non-descriptive variable name",
                    "Single-letter or placeholder names (l, temp, data1...) hurt readability and are easy to mistype (e.g. 'l' vs '1').",
                    "Rename to something that describes the value's purpose.");

            check(PUBLIC_FIELD_PATTERN, line, findings, fileName, lineNum, "MEDIUM", "CODE_SMELL",
                    "Mutable public field breaks encapsulation",
                    "Public non-final fields let any caller mutate internal state directly.",
                    "Make the field private and expose a getter, or make it 'private final' if immutable.");

            check(WILDCARD_IMPORT_PATTERN, line, findings, fileName, lineNum, "LOW", "STYLE",
                    "Wildcard import",
                    "Wildcard imports obscure exactly which classes are in use and can cause silent name clashes.",
                    "Import only the specific classes actually used.");

            check(EMPTY_CATCH_PATTERN, line, findings, fileName, lineNum, "HIGH", "BUG",
                    "Empty catch block swallows exceptions",
                    "Silently discarding an exception hides failures and makes debugging production issues far harder.",
                    "At minimum log the exception; ideally handle it or rethrow a meaningful error.");

            check(PASSWORD_LITERAL_PATTERN, line, findings, fileName, lineNum, "CRITICAL", "SECURITY",
                    "Hard-coded credential or secret",
                    "Secrets committed to source code are exposed to anyone with repo access and to version history forever.",
                    "Move the value to an environment variable or a secrets manager.");

            if (line.length() > 120) {
                findings.add(newFinding("LOW", "STYLE", "Line exceeds 120 characters",
                        "Long lines are harder to review, especially in side-by-side diffs.",
                        "Wrap or refactor this line for readability.", fileName, lineNum));
            }

            Matcher magicMatcher = MAGIC_NUMBER_PATTERN.matcher(line);
            if (magicMatcher.find() && !line.trim().startsWith("private static final")
                    && !line.trim().startsWith("public static final")) {
                findings.add(newFinding("LOW", "CODE_SMELL", "Magic number",
                        "An unexplained numeric literal makes intent unclear and is easy to duplicate inconsistently.",
                        "Extract it into a named constant.", fileName, lineNum));
            }
        }

        if (avgMethodLength > 40) {
            findings.add(newFinding("MEDIUM", "CODE_SMELL", "Methods are long on average",
                    "Average method length of " + avgMethodLength + " lines suggests methods are doing too much.",
                    "Extract cohesive chunks of logic into smaller, well-named private methods.", fileName, null));
        }

        if (complexity > 20) {
            findings.add(newFinding("HIGH", "CODE_SMELL", "High cyclomatic complexity",
                    "A complexity score of " + complexity + " indicates many independent execution paths, which is hard to test exhaustively.",
                    "Split branching logic into smaller methods or use polymorphism/strategy pattern to simplify.", fileName, null));
        }

        double maintainabilityIndex = computeMaintainability(loc, complexity, findings.size());

        return new AnalysisResult(classCount, methodCount, loc, avgMethodLength, complexity, maintainabilityIndex, findings);
    }

    private double computeMaintainability(int loc, int complexity, int findingCount) {
        double raw = 100 - (complexity * 1.2) - (findingCount * 1.5) - (Math.log(Math.max(loc, 1)) * 3);
        return Math.max(0, Math.min(100, Math.round(raw * 10) / 10.0));
    }

    private void check(Pattern pattern, String line, List<ReviewFinding> findings, String fileName, int lineNum,
                        String severity, String category, String issue, String explanation, String suggestion) {
        if (pattern.matcher(line).find()) {
            findings.add(newFinding(severity, category, issue, explanation, suggestion, fileName, lineNum));
        }
    }

    private ReviewFinding newFinding(String severity, String category, String issue, String explanation,
                                      String suggestion, String fileName, Integer lineNumber) {
        return ReviewFinding.builder()
                .severity(severity)
                .category(category)
                .issue(issue)
                .explanation(explanation)
                .suggestion(suggestion)
                .fileName(fileName)
                .lineNumber(lineNumber)
                .source("STATIC")
                .build();
    }

    private int countMatches(Pattern pattern, String text) {
        Matcher matcher = pattern.matcher(text);
        int count = 0;
        while (matcher.find()) count++;
        return count;
    }

    public record AnalysisResult(
            int classCount,
            int methodCount,
            int linesOfCode,
            double avgMethodLength,
            int cyclomaticComplexity,
            double maintainabilityIndex,
            List<ReviewFinding> findings
    ) {}
}
