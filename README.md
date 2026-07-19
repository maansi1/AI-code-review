# Redline — AI Code Review Assistant

Full-stack Java code review platform: paste or upload a `.java` file, get a
scored review combining a built-in static analyzer with an OpenAI-powered AI
review, annotated line-by-line in a code "review gutter."

- `backend/`  — Spring Boot 3 (Java 17), JWT auth, H2 (zero-config) or
  PostgreSQL, REST API. See `backend/README.md`.
- `frontend/` — React 18 + Vite + Tailwind. See `frontend/README.md`.

## Run it locally

```bash
# Terminal 1
cd backend && mvn spring-boot:run

# Terminal 2
cd frontend && npm install && npm run dev
```

Visit `http://localhost:5173`, create an account, and submit some Java code.
Set `OPENAI_API_KEY` before starting the backend to enable the AI reviewer —
without it, you still get full static-analysis results.

## What's implemented vs. scoped out

Implemented: register/login/JWT auth, profile update, password change, paste
or single-file `.java` submission, a dependency-free static analyzer (bugs,
security, code smells, complexity, naming, magic numbers...), OpenAI-backed
AI review merged with static findings, persisted review history with search
and delete, and a dashboard UI with score gauge, complexity metrics, severity
chart, and the line-annotated code viewer.

Scoped out of this pass (both codebases have clear extension points for
them — see the two READMEs): ZIP/multi-file project upload, PDF/Markdown
export, email-based password reset, and swapping in real Checkstyle/PMD/
SpotBugs engines alongside the built-in analyzer.

## A note on this build

I don't have access to Maven Central in my sandbox, so the backend is
carefully written but not compiled/tested here — you'll want to run
`mvn spring-boot:run` locally as your first check. The frontend *was* built
and verified (`npm run build` succeeds) since npm's registry is reachable.
