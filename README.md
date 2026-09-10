# LLD Studio — Low Level Design Practice Platform

A full-stack web app for practicing Low-Level System Design (LLD) problems and getting instant, structured feedback — both from automated rule checks and Google Gemini AI.

Built as a 2-day engineering assignment for CipherSchools.

---

## What Is This?

LLD interviews ask you to model real-world systems using classes, relationships, and design patterns. The problem is: there's no good tool to actually practice this and get feedback. LeetCode handles algorithms. Most system design resources are passive reading. Nothing tells you whether your class hierarchy makes sense.

LLD Studio fills that gap. Pick a problem (Parking Lot, Elevator, Vending Machine, Library Management, Movie Booking), design your solution using a live Mermaid class diagram editor, write your method signatures, explain your responsibility decisions, note your trade-offs — and submit. The platform evaluates your work and tells you exactly what you did well and what to improve.

---

## Quick Start

You need **Node.js v18+**. The project has two parts — a backend API and a frontend React app. Both need to run.

### Backend Setup

```bash
cd lld-practice-platform/backend

# Install dependencies
npm install

# Create the SQLite database from the Prisma schema
npx prisma db push

# Generate Prisma TypeScript client
npx prisma generate

# Seed the database with 5 LLD problems + evaluation rubrics
npx ts-node prisma/seed.ts
```

Create a `.env` file inside `lld-practice-platform/backend/`:

```env
PORT=3001
DATABASE_URL="file:./dev.db"
GEMINI_API_KEY="your_google_gemini_api_key_here"
DEMO_LEARNER_ID="learner-demo-001"
```

> **Note:** `GEMINI_API_KEY` is optional. Without it, the platform falls back to a deterministic rule-based evaluator with mock AI feedback. The app works either way.

Start the backend:

```bash
npx ts-node src/server.ts
```

You should see:
```
🚀 LLD Practice Platform Backend
   Server running at http://localhost:3001
   AI Provider: Gemini        ← or "Mock" if no API key
   Environment: development
```

### Frontend Setup

```bash
cd lld-practice-platform/frontend

npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Project Structure

```
CipherSchoolsAssignment/
├── README.md                    ← This file
├── AI_USAGE.md                  ← AI usage decisions + rationale
├── RESEARCH_NOTE.md             ← Research on the learner problem
├── DESIGN_NOTE.md               ← Architecture, classes, trade-offs
│
└── lld-practice-platform/
    ├── backend/
    │   ├── prisma/
    │   │   ├── schema.prisma    ← Data models: Problem, Attempt, Submission, Feedback, Rubric
    │   │   ├── seed.ts          ← Seeds 5 problems with full rubrics + example diagrams
    │   │   └── dev.db           ← SQLite database (auto-created on db push)
    │   └── src/
    │       ├── domain/
    │       │   ├── entities/    ← TypeScript interfaces for core domain objects
    │       │   ├── evaluation/  ← DeterministicEvaluator, LLMEvaluator, CompositeEvaluator
    │       │   └── providers/   ← GeminiProvider, MockProvider
    │       ├── repositories/    ← Data access layer (one repo per entity)
    │       ├── routes/          ← Express routers for /api/problems, /api/attempts
    │       ├── services/        ← SubmissionService, AttemptService, EvaluationService
    │       ├── jobs/            ← Async evaluation job handler
    │       ├── app.ts           ← Express app + dependency injection wiring
    │       └── server.ts        ← Entry point
    │
    └── frontend/
        └── src/
            ├── api/             ← Typed fetch client for all backend endpoints
            ├── components/      ← MermaidLivePreview (debounced live renderer)
            ├── pages/           ← LandingPage, ProblemList, ProblemDetail,
            │                       AttemptWorkspace, FeedbackPage, HistoryPage
            ├── styles/          ← CSS design tokens, scrollbars, layout
            └── App.tsx          ← Routing + nav
```

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Backend runtime | Node.js + TypeScript | Type-safe, familiar for JS devs |
| API framework | Express.js | Minimal, fast to set up |
| Database | SQLite + Prisma ORM | Zero config, easy migration path to Postgres |
| AI evaluation | Google Gemini API | Strong reasoning for open-ended design feedback |
| Frontend | React 18 + TypeScript + Vite | Fast dev, strong ecosystem |
| Diagrams | Mermaid.js (client-side) | No server load, instant preview |
| Icons | Lucide React | Clean, consistent SVG icons |
| Styling | Vanilla CSS (design tokens) | No framework dependency, full control |

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check (`{status: "ok", aiProvider: "gemini"}`) |
| `GET` | `/api/problems` | List all LLD problems |
| `GET` | `/api/problems/:slug` | Get one problem with rubric |
| `POST` | `/api/attempts` | Start a new attempt |
| `GET` | `/api/attempts/:id` | Get attempt status |
| `POST` | `/api/attempts/:id/submit` | Submit solution (triggers evaluation) |
| `GET` | `/api/attempts/:id/feedback` | Get evaluation feedback |
| `GET` | `/api/attempts/:id/submission` | Get submitted content |
| `GET` | `/api/attempts?learnerId=X&problemId=Y` | Get attempt history for a learner |

---

## Key Design Decisions

**Why SQLite instead of PostgreSQL?**
Zero configuration for local development. Prisma makes the provider swap trivial — just update `DATABASE_URL`. For a 2-day prototype, SQLite is the right call.

**Why a structured 4-field form instead of a single free-text box?**
The four fields (diagram, method signatures, responsibilities, trade-offs) map directly to what interviewers actually evaluate. Structuring the input makes evaluation much more accurate, and it also teaches learners how to structure their own thinking.

**Why hybrid evaluation (rule-based + AI) instead of AI alone?**
Pure LLM is unreliable for exact structural checks. An LLM might say a class "exists" even when it doesn't appear in the diagram. The deterministic layer catches concrete requirements instantly and reliably. The LLM handles qualitative judgment — whether the design actually makes sense architecturally. Both results are merged.

**What happens if Gemini is slow or unavailable?**
Evaluation runs synchronously on submit with a 30-second timeout on the Gemini call. If AI fails, the attempt still gets evaluated using deterministic rules and is marked `evaluated`. The user always sees useful feedback — not an eternal loading spinner.

---

## Known Limitations

- **Single learner, no auth**: The `learnerId` is set via `.env`. There's no login system — adding auth was out of scope for a 2-day build.
- **Synchronous evaluation**: Feedback arrives after the HTTP response from `/submit`. For slow AI calls, this means a few seconds of wait. An async job queue (e.g. BullMQ) would fix this in production.
- **SQLite single-writer**: Works fine locally. Not suitable for concurrent production writes.
- **Regex-based Mermaid parsing**: The deterministic evaluator uses regex to extract class names and relationships from Mermaid syntax. It handles standard diagrams well, but a proper AST parser would be more robust.

---

## Running Tests

```bash
cd lld-practice-platform/backend
npm test
```

Tests cover the deterministic evaluator, composite evaluator fallback behavior, and edge cases in submission validation.
