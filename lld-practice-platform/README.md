# LLD Studio — Low Level System Design Practice & AI Evaluation Platform

**LLD Studio** is a full-stack interactive platform designed to help software engineers practice Low-Level System Design (LLD) problems. Learners design class architectures using visual Mermaid diagrams, detail key method signatures, justify responsibility splits, and document architectural trade-offs to receive automated rule checks and AI-powered evaluation.

---

## 🌟 Key Features

- 📐 **Interactive Mermaid Class Diagram Workspace**: Side-by-side live editor with debounced rendering (300ms) and syntax-resilient preview fallback.
- 🧱 **Structured Design Submission**: Evaluates solutions across four distinct dimensions:
  1. **Visual Class Diagram** (Mermaid `classDiagram` syntax)
  2. **Key Method Signatures & Fields** (Text/pseudocode)
  3. **Responsibility Breakdown & Reasoning** (Single Responsibility & Encapsulation rationale)
  4. **Architectural Trade-offs & Decisions** (Explicit compromises, minimum 20 characters)
- ⚡ **Dual-Layer Evaluation Engine**:
  - **Deterministic Evaluator**: Scans for expected domain classes, relationship syntax (`-->`, `o--`, `*--`, `--|>`), design pattern keywords, and field completeness.
  - **LLM Evaluator (Google Gemini AI)**: Performs deep architectural review scoring specific design dimensions with actionable feedback.
- 📈 **Attempt History & Diff Tracking**: Detects improvements and regressions compared to prior attempts on the same problem.
- 🎨 **Modern UI**: Clean light theme with Plus Jakarta Sans typography, Lucide vector icons, and sleek WebKit scrollbars.

---

## ⚙️ Tech Stack & Architecture

### Backend
- **Runtime**: Node.js & TypeScript (`ts-node`)
- **Framework**: Express.js
- **Database & ORM**: SQLite via Prisma ORM
- **AI Integration**: Google Gemini API (`@google/genai`) with fallback MockProvider
- **Evaluation Pipeline**: Composite Evaluator Pattern combining Rule-Based and LLM Evaluators

### Frontend
- **Framework**: React 18 & TypeScript
- **Bundler**: Vite
- **Visualizations**: Mermaid.js
- **Icons**: Lucide React
- **Styling**: Vanilla CSS Design Tokens with custom WebKit scrollbars

---

## 🚀 Backend Commands Reference

All commands below should be executed inside the `backend` directory.

### 1. Installation
Install backend dependencies:
```bash
cd backend
npm install
```

### 2. Database Migration & Schema Sync
Sync SQLite database with the Prisma schema (`prisma/schema.prisma`):
```bash
npx prisma db push
```

### 3. Generate Prisma Client
Generate the TypeScript Prisma Client:
```bash
npx prisma generate
```

### 4. Seed Database
Populate database with default LLD problems (Parking Lot, Elevator, Vending Machine, Library System, Movie Booking) and Mermaid placeholder snippets:
```bash
npx ts-node prisma/seed.ts
```

### 5. Environment Configuration (`.env`)
Create or edit `.env` in `backend`:
```env
PORT=3001
DATABASE_URL="file:./dev.db"
GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"  # Optional: omit to use MockProvider
DEMO_LEARNER_ID="learner-demo-001"
```

### 6. Start Backend Server
Run the backend server in development mode:
```bash
npx ts-node src/server.ts
```
*Backend server runs at `http://localhost:3001`*

---

## 💻 Frontend Commands Reference

Commands to run the frontend application inside `frontend`:

```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev

# Build for production
npm run build
```
*Frontend dev server runs at `http://localhost:5173`*

---

## 📁 Repository Structure

```
lld-practice-platform/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Prisma database schema
│   │   ├── seed.ts              # Problem & Rubric seed data with Mermaid diagrams
│   │   └── dev.db               # SQLite database
│   ├── src/
│   │   ├── domain/
│   │   │   ├── entities/        # Problem, Attempt, Submission, Feedback models
│   │   │   ├── evaluation/      # Deterministic, LLM & Composite Evaluators
│   │   │   └── providers/       # Gemini AI & Mock providers
│   │   ├── repositories/        # Database data access layer
│   │   ├── routes/              # Express API routers
│   │   ├── services/            # Core business logic (Submission & Evaluation flow)
│   │   └── server.ts            # Entry point
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/                 # Backend API client
    │   ├── components/          # MermaidLivePreview component
    │   ├── pages/               # ProblemList, ProblemDetail, AttemptWorkspace, Feedback, History
    │   ├── styles/              # Design tokens & custom WebKit scrollbars
    │   └── App.tsx              # Main App layout & routing
    └── package.json
```
