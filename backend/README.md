# AI Code Review Assistant — Backend

Spring Boot 3 / Java 17 REST API: JWT auth, code submission (paste or `.java` file
upload), a built-in static analyzer, Gemini-powered AI review, and review history.

## Quick start (zero config)

```bash
cd backend
mvn spring-boot:run
```

Runs on `http://localhost:8080` against an in-memory H2 database — no DB setup
needed to try it out. Browse the schema at `http://localhost:8080/h2-console`
(JDBC URL `jdbc:h2:mem:codereview`, user `sa`, blank password).

To enable AI review, set an environment variable before starting:

```bash
export GEMINI_API_KEY=AIza...
export GEMINI_MODEL=gemini-2.5-flash
mvn spring-boot:run
```

Without it, submissions still work — you get full static-analysis results and
the summary notes that AI review was skipped.

## Running against PostgreSQL (production)

```bash
export DATABASE_URL=jdbc:postgresql://<host>:5432/<db>
export DATABASE_USERNAME=<user>
export DATABASE_PASSWORD=<password>
export JWT_SECRET=<long-random-string>
export GEMINI_API_KEY=AIza...
export GEMINI_MODEL=gemini-2.5-flash
export FRONTEND_URL=https://your-frontend-domain.com

mvn spring-boot:run -Dspring-boot.run.profiles=prod
# or, once packaged:
java -jar target/ai-code-review-assistant.jar --spring.profiles.active=prod
```

## API overview

| Method | Path                  | Auth | Description                          |
|--------|------------------------|------|--------------------------------------|
| POST   | `/api/auth/register`   | No   | Create account, returns JWT          |
| POST   | `/api/auth/login`      | No   | Login, returns JWT                   |
| GET    | `/api/auth/me`         | Yes  | Current user                         |
| PUT    | `/api/auth/profile`    | Yes  | Update name                          |
| PUT    | `/api/auth/password`   | Yes  | Change password                      |
| POST   | `/api/reviews`         | Yes  | Submit pasted code, get review       |
| POST   | `/api/upload`          | Yes  | Upload a `.java` file, get review    |
| GET    | `/api/reviews`         | Yes  | List reviews (`?query=` to search)   |
| GET    | `/api/reviews/{id}`    | Yes  | Full review with findings            |
| DELETE | `/api/reviews/{id}`    | Yes  | Delete a review                      |

All authenticated routes expect `Authorization: Bearer <token>`.

## Architecture notes

- **Static analysis** (`StaticAnalysisService`) is a self-contained regex/heuristic
  analyzer — it runs with zero external tools, so the app works immediately
  after `mvn spring-boot:run`. It flags empty catch blocks, hardcoded secrets,
  public mutable fields, wildcard imports, long methods, high complexity,
  magic numbers, poor naming, and more, and computes LOC / class & method
  counts / cyclomatic complexity / a maintainability index.
- **AI review** (`AiReviewService`) calls Gemini's `generateContent` API with a
  JSON-mode prompt and merges the structured findings with the static ones.
  The final quality score is the average of the static-analysis score and the
  AI's score (or just the static score if no API key is set).
- **Upgrading static analysis**: to add real Checkstyle/PMD/SpotBugs engines
  alongside the built-in analyzer, add their Maven dependencies to `pom.xml`
  and implement additional analyzer classes that return `List<ReviewFinding>`;
  `ReviewService` already merges findings from multiple sources.
- **ZIP project upload**, PDF/Markdown export, and email-based password reset
  are intentionally out of scope for this MVP pass — the entity/DTO layer
  (`Project.uploadType`, etc.) already anticipates them.
