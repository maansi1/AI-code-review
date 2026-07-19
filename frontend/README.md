# Redline — Frontend

React 18 + Vite + Tailwind. Talks to the Spring Boot backend over REST/JWT.

## Setup

```bash
cd frontend
npm install
cp .env.example .env   # point VITE_API_URL at your backend if not localhost:8080
npm run dev
```

Opens on `http://localhost:5173`. Register an account, then submit code from
the dashboard.

## Build

```bash
npm run build   # outputs to dist/
npm run preview # serve the production build locally
```

## Design

- **Palette**: near-black ink background with a coral "redline" accent for
  critical issues, amber/blue/mint for the rest of the severity scale, and a
  lavender accent reserved for AI-sourced findings (vs. static-analysis ones).
- **Type**: IBM Plex Sans for UI, IBM Plex Mono for code, scores, and line
  numbers — a nod to the fixed-width precision of a real code review.
- **Signature element**: the review-result page renders the submitted source
  in a read-only viewer with a **review gutter** — colored severity dots at
  each finding's exact line, the way a linter or PR review tool marks up a
  diff. Clicking a dot (or a finding card) cross-highlights the other side.

## Structure

```
src/
  components/   Shared UI (ScoreDial, CodeGutterViewer, FindingsList, AppShell...)
  context/      AuthContext (JWT + user state, persisted to localStorage)
  pages/        AuthPage, DashboardPage, ReviewResultPage, HistoryPage, ProfilePage
  services/     axios client + auth/review API wrappers
```
