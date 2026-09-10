# Design Note: Architecture, MVP Specification & System Trade-offs

**Project Name**: LLD Studio  
**Author**: Palash Pathare  
**Date**: September 2026  
**Repository**: LLD Practice & Evaluation Platform  

---

## 1. System Overview & Core MVP Scope

**LLD Studio** is an full-stack low-level system design workspace. The platform allows software engineering candidates to view curated LLD problems, craft structured design solutions visually using Mermaid class diagrams, detail method signatures and responsibility reasoning, document explicit architectural trade-offs, and receive instant rubric evaluation.

### MVP Feature Scope:
1. **Interactive Landing & Problem Catalog**: Filterable problem library featuring Parking Lot, Elevator System, Vending Machine, Library Management, and Movie Ticket Booking.
2. **Interactive Workspace**: Split-view editor featuring a syntax-highlighted code editor for Mermaid `classDiagram` syntax with live debounced SVG rendering.
3. **Structured Submission Entity**: Captures diagram syntax, signatures, responsibilities, trade-offs, and free-form fallback notes.
4. **Hybrid Evaluation Engine**: Composite evaluation combining fast deterministic rule checks (class existence, relationship syntax, pattern keywords) with deep AI evaluation (Google Gemini API).
5. **Iteration & Attempt History**: Attempt history tracking with performance badges, timestamps, and feedback navigation.

---

## 2. End-to-End User Flow

```
[ Landing Page ]
       │
       ▼
[ Problem Catalog ] ──(Select Problem)──► [ Problem Detail Page ]
                                                  │
                                                  ▼
                                      [ Start Attempt Workspace ]
                                                  │
                                                  ▼
                                    ┌──────────────────────────┐
                                    │ Live Mermaid Editor      │
                                    │ + Method Signatures      │
                                    │ + Responsibilities       │
                                    │ + Architectural Tradeoffs│
                                    └─────────────┬────────────┘
                                                  │
                                           (Submit Solution)
                                                  │
                                                  ▼
                                     [ Composite Evaluator ]
                                     ├── Deterministic Checks
                                     └── Gemini LLM Analysis
                                                  │
                                                  ▼
                                      [ Detailed Feedback Page ]
                                     (Scores, Signals, Diffs)
                                                  │
                                                  ▼
                                       [ Attempt History Page ]
```

---

## 3. Data & Entity Architecture

The backend database is modeled using **Prisma ORM** with SQLite storage.

### Data Models & Relationships

```prisma
model Problem {
  id                        String   @id @default(cuid())
  title                     String
  slug                      String   @unique
  statement                 String
  functionalRequirements   String   // JSON string array
  nonFunctionalRequirementsString   // JSON string array
  difficulty                String
  createdAt                 DateTime @default(now())
  updatedAt                 DateTime @updatedAt
  attempts                  Attempt[]
  rubric                    Rubric?
}

model Rubric {
  id                  String   @id @default(cuid())
  problemId           String   @unique
  problem             Problem  @relation(fields: [problemId], references: [id], onDelete: Cascade)
  expectedClasses     String   // JSON array of expected class names
  expectedPatterns    String   // JSON array of design patterns (Strategy, State, etc.)
  exampleClassDiagram String?  // Mermaid placeholder snippet
  dimensions          String   // JSON array of RubricDimension objects
}

model Attempt {
  id           String      @id @default(cuid())
  problemId    String
  problem      Problem     @relation(fields: [problemId], references: [id], onDelete: Cascade)
  learnerId    String
  status       String      // 'in_progress' | 'submitted' | 'evaluating' | 'evaluated' | 'failed'
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
  submissions  Submission[]
  feedbacks    Feedback[]
}

model Submission {
  id               String   @id @default(cuid())
  attemptId        String
  attempt          Attempt  @relation(fields: [attemptId], references: [id], onDelete: Cascade)
  classDiagram     String?  // Mermaid syntax
  methodSignatures String?  // Pseudocode / TypeScript signatures
  responsibilities String?  // Rationale for class breakdown
  tradeoffs        String?  // Explicit architectural trade-offs
  rawText          String?  // Free-form fallback
  createdAt        DateTime @default(now())
}

model Feedback {
  id                 String   @id @default(cuid())
  attemptId          String
  attempt            Attempt  @relation(fields: [attemptId], references: [id], onDelete: Cascade)
  overallSignal      String   // 'needs_work' | 'solid' | 'strong'
  deterministicChecks String  // JSON array of DeterministicCheck objects
  dimensionScores    String   // JSON array of DimensionScore objects
  llmFeedback        String?  // Detailed AI review text
  createdAt          DateTime @default(now())
}
```

---

## 4. Evaluation Engine Architecture

The platform implements the **Composite Pattern** for evaluation, isolating deterministic rule checks from non-deterministic LLM feedback.

```
                  ┌──────────────────────┐
                  │ Composite Evaluator  │
                  └──────────┬───────────┘
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
┌───────────────────────┐         ┌───────────────────────┐
│ DeterministicEngine   │         │ LLMEvaluator (Gemini) │
├───────────────────────┤         ├───────────────────────┤
│ - Class Existence     │         │ - OOP Dimension Score │
│ - Mermaid Relationship│         │ - Pattern Mastery     │
│   Syntax Parsing      │         │ - SOLID Principles    │
│ - Pattern Keywords    │         │ - Actionable Advice   │
│ - Trade-off Gate      │         │ - Mock Fallback Provider│
└───────────────────────┘         └───────────────────────┘
```

1. **Deterministic Evaluator**:
   - Parses the `classDiagram` text for class identifiers and valid Mermaid arrow relationships (`-->`, `*--`, `o--`, `<|--`).
   - Verifies presence of expected domain classes defined in problem rubrics (e.g. `ParkingLot`, `ParkingSpot`, `PricingStrategy`).
   - Checks presence of architectural trade-offs and minimum length thresholds.
2. **LLM Evaluator**:
   - Constructs a structured prompt passing problem statements, functional requirements, rubric dimensions, learner's class diagram, signatures, and trade-off rationale.
   - Invokes Google Gemini API (`@google/genai`) to return structured JSON containing dimension scores, overall signal (`needs_work`, `solid`, `strong`), and concrete recommendations.
   - Built with a graceful `MockProvider` fallback so the platform works seamlessly even when an API key is omitted.

---

## 5. Key Architectural Trade-offs & Decisions

### 1. SQLite + Prisma ORM vs. PostgreSQL
- **Decision**: Used SQLite with Prisma ORM for the local deployment.
- **Trade-off**: Relational simplicity and zero-configuration setup for local evaluation. For multi-tenant production scaling, a simple migration to PostgreSQL can be achieved by changing the Prisma provider url.

### 2. Client-Side Mermaid.js Debounced Rendering vs. Server-Side SVG Generation
- **Decision**: Render Mermaid diagrams entirely on the client using `@mermaid-js` with a 300ms debounce and syntax error fallback.
- **Trade-off**: Offloads diagram rendering CPU burden from backend servers to client browsers and enables sub-50ms instant visual feedback while typing.

### 3. Dual-Engine Hybrid Evaluation vs. Pure LLM Evaluation
- **Decision**: Combined deterministic rule validation with LLM AI assessment.
- **Trade-off**: Pure LLMs can hallucinate or fail on exact syntax checks. Deterministic checks provide instant, reliable feedback on core requirements, while the LLM provides qualitative architectural feedback.

### 4. Structured 4-Field Submission Form vs. Unstructured Single Textbox
- **Decision**: Forced separation into Class Diagram, Method Signatures, Responsibilities, and Trade-offs.
- **Trade-off**: Requires slightly more input effort from the user, but drastically improves evaluation accuracy and teaches candidates how to structure their thoughts during real technical interviews.
