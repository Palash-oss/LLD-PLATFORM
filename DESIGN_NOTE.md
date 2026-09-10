# Design Note: LLD Studio — Architecture and Key Decisions

**Author**: Palash Pathare  
**Date**: September 2026

---

## MVP Scope

The MVP focuses on one thing: the practice loop. Everything else (auth, multi-tenancy, admin panel, content management) is explicitly out of scope.

The loop is: **Choose problem → Design → Submit → Get feedback → Review → Try again**

Concretely, the MVP includes:
- 5 curated LLD problems (Parking Lot, Elevator System, Vending Machine, Library Management, Movie Ticket Booking)
- A workspace where learners write their design using 4 structured fields
- Submission that triggers automatic evaluation
- A feedback page showing what worked and what to improve
- An attempt history page so learners can track progress

One learner, no authentication, synchronous evaluation. Intentionally simple.

---

## User Flow

```
Landing Page
    ↓
Problem List  →  Problem Detail (reads requirements, views example diagram)
    ↓
Start Attempt  →  Workspace
                    ├── Field 1: Mermaid class diagram (with live preview)
                    ├── Field 2: Method signatures (pseudocode)
                    ├── Field 3: Responsibility rationale
                    └── Field 4: Architectural trade-offs
    ↓
Submit  →  Evaluation runs (deterministic + AI)
    ↓
Feedback Page  →  Overall signal + dimension scores + specific checks + AI review
    ↓
Attempt History  →  All past attempts on this problem, side by side
```

---

## Domain Model

### Problem

Represents a single LLD challenge. Stores the problem statement, functional requirements, non-functional requirements, and difficulty level. Has a one-to-one relationship with a `Rubric` that defines how it should be evaluated.

```typescript
interface Problem {
  id: string
  title: string
  slug: string                     // URL-safe identifier, e.g. "parking-lot"
  statement: string                // The full problem description
  functionalRequirements: string[] // What the system must do
  nonFunctionalRequirements: string[]
  difficulty: 'easy' | 'medium' | 'hard'
}
```

### Rubric

The evaluation rubric for a problem. Defines which classes the evaluator expects to find, which design patterns are relevant, and how to score each dimension.

```typescript
interface Rubric {
  id: string
  problemId: string
  expectedClasses: string[]          // e.g. ["ParkingLot", "ParkingSpot", "Vehicle", "Ticket"]
  expectedPatterns: string[]         // e.g. ["Strategy", "Singleton"]
  exampleClassDiagram: string        // A Mermaid classDiagram hint shown in the workspace
  dimensions: RubricDimension[]      // What aspects to score (class design, patterns, etc.)
}

interface RubricDimension {
  name: string          // e.g. "Class Decomposition"
  description: string   // What makes a good answer for this dimension
  weight: number        // How much this counts toward the overall score
}
```

### Attempt

Tracks one learner's attempt at one problem. An attempt can be in progress (not yet submitted) or evaluated (feedback is ready).

```typescript
interface Attempt {
  id: string
  problemId: string
  learnerId: string
  status: 'in_progress' | 'submitted' | 'evaluating' | 'evaluated' | 'failed'
  createdAt: Date
  updatedAt: Date
}
```

### Submission

The content of what the learner submitted. Structured as four fields, each capturing a different dimension of LLD understanding.

```typescript
interface Submission {
  id: string
  attemptId: string
  classDiagram: string       // Mermaid classDiagram syntax
  methodSignatures: string   // Pseudocode or TypeScript-style signatures
  responsibilities: string   // Rationale for how classes are split
  tradeoffs: string          // What was traded off and why
  rawText?: string           // Optional free-form notes
  createdAt: Date
}
```

### Feedback

The evaluation result for a submission. Combines deterministic check results with AI dimension scores and an overall signal.

```typescript
interface Feedback {
  id: string
  attemptId: string
  overallSignal: 'needs_work' | 'solid' | 'strong'
  deterministicChecks: DeterministicCheck[]   // Pass/fail checks
  dimensionScores: DimensionScore[]           // AI-scored rubric dimensions
  llmFeedback?: string                        // AI's full narrative review
  createdAt: Date
}

interface DeterministicCheck {
  name: string
  passed: boolean
  message: string
}

interface DimensionScore {
  dimension: string
  score: number    // 1-5
  feedback: string
}
```

---

## Evaluation Engine

The most important design decision in the whole platform is how evaluation works. LLD solutions are subjective — there's no single correct answer to "design a parking lot." But some answers are clearly better than others. The evaluation engine has to give useful feedback that works across many valid solutions.

I solved this with a **composite evaluator** that combines two very different approaches.

### DeterministicEvaluator

Handles the objective, checkable parts of evaluation:

- **Class presence**: Does the Mermaid diagram contain the expected classes defined in the rubric? (e.g., `ParkingLot`, `ParkingSpot`, `Vehicle`, `Ticket` for the Parking Lot problem)
- **Relationship syntax**: Does the diagram use valid Mermaid relationship arrows? (`-->` for association, `*--` for composition, `o--` for aggregation, `<|--` for inheritance)
- **Pattern keywords**: Does the submission mention the expected design patterns? (e.g., "Strategy" pattern for pricing in a parking lot)
- **Field completeness**: Are the required fields non-empty?

This runs fast (milliseconds), is 100% deterministic, and gives the learner precise, actionable checks — "Expected class ParkingSpot — not found in diagram" is clear feedback.

### LLMEvaluator

Handles the subjective, qualitative parts that rules can't judge:

- Is the class decomposition sensible? Does each class have a clear, single responsibility?
- Does the pattern choice actually fit the problem, or was it applied mechanically?
- Are the trade-offs thoughtful? Does the learner understand what they sacrificed?
- Are the method signatures on the right classes, or are responsibilities in the wrong place?

The LLMEvaluator constructs a structured prompt that includes the problem statement, functional requirements, rubric dimensions, and the learner's full submission. It asks Gemini to return a JSON response with scores per dimension, an overall signal, and a narrative review.

```
LLMEvaluator prompt structure:
  - System role: "You are an expert LLD interviewer evaluating a candidate's design."
  - Problem: [statement + requirements]
  - Rubric: [expected classes, patterns, dimensions]
  - Submission: [classDiagram + methodSignatures + responsibilities + tradeoffs]
  - Output format: { overallSignal, dimensionScores: [...], llmFeedback }
```

### CompositeEvaluator

Combines both. Runs deterministic checks first. If the submission passes minimum gates (at least some expected classes found, fields non-empty), runs the LLM evaluator. Merges both results into one `Feedback` object.

```typescript
class CompositeEvaluator {
  async evaluate(submission: Submission, rubric: Rubric): Promise<Feedback> {
    const deterministicResult = await this.deterministicEvaluator.evaluate(submission, rubric)
    const llmResult = await this.llmEvaluator.evaluate(submission, rubric)
    return this.merge(deterministicResult, llmResult)
  }
}
```

### MockProvider

When `GEMINI_API_KEY` is not set, `GeminiProvider` is replaced with `MockProvider`. This returns deterministic mock scores and feedback text. The platform works end-to-end without an API key — useful for local testing.

---

## How the Evaluator Is Extensible

The evaluator is built around an `Evaluator` interface:

```typescript
interface Evaluator {
  evaluate(submission: Submission, rubric: Rubric): Promise<EvaluationResult>
}
```

Both `DeterministicEvaluator` and `LLMEvaluator` implement this interface. `CompositeEvaluator` takes an array of `Evaluator` instances in its constructor. To add a new evaluation approach — say, a diagram-specific AST parser, or a second AI provider — you implement the interface and add it to the composite. No other code changes needed.

Same for AI providers: `GeminiProvider` and `MockProvider` both implement an `AIProvider` interface. Swapping to Claude or GPT-4 means writing a new class that implements the same interface. The LLMEvaluator doesn't know which AI is underneath.

---

## What Happens When Evaluation Fails

Evaluation is synchronous on submit. The flow is:

1. `POST /api/attempts/:id/submit` receives the submission
2. Sets attempt status to `evaluating`
3. Runs `CompositeEvaluator.evaluate()`
4. If Gemini times out (30s timeout), only deterministic feedback is returned
5. Sets attempt status to `evaluated` (or `failed` if even deterministic evaluation errors out)
6. Returns the feedback in the HTTP response

The learner always gets a response. The worst case is an attempt marked `failed` with an error message — but this almost never happens because the deterministic evaluator never fails. The AI is a "nice to have on top."

---

## Key Trade-offs

### SQLite vs. PostgreSQL

SQLite was chosen for local development — zero configuration, single file, no daemon to run. The Prisma schema can switch to PostgreSQL by changing one line in `.env`. For this prototype, SQLite is the right call.

**Trade-off**: SQLite is a single-writer database. Two concurrent submissions could block each other. Not a problem for a single-learner prototype. For production, switch to PostgreSQL.

### Synchronous Evaluation vs. Async Job Queue

Evaluation happens inline with the HTTP request. The learner waits for the response. This is simple and avoids the complexity of a job queue, webhooks, polling, or WebSockets.

**Trade-off**: If Gemini is slow (10-20 seconds), the learner waits. With a job queue (BullMQ + Redis), evaluation would happen in the background and results would be pushed via WebSocket. That adds real complexity — correct for production, wrong for a 2-day prototype.

### Structured 4-Field Submission vs. Free Text

Forcing learners into 4 specific fields (diagram, signatures, responsibilities, trade-offs) makes the submission slightly more work. A single text box would be easier to fill.

**Trade-off**: The structure is the point. Each field maps to a real interview evaluation dimension. It also makes the LLM prompt much more precise — feeding structured fields gives Gemini far better signal than a wall of unstructured text.

### Regex-Based Mermaid Parsing vs. AST Parser

The deterministic evaluator extracts class names and relationship types from Mermaid `classDiagram` syntax using regex. This works for standard diagrams but could miss edge cases in unusual syntax.

**Trade-off**: A proper Mermaid AST parser would be more robust but adds a dependency and significant complexity. For the 5 problems in this prototype, regex works reliably enough.

---

## Repository Layer

Each entity has its own repository class (e.g., `ProblemRepository`, `AttemptRepository`, `SubmissionRepository`, `FeedbackRepository`). Repositories handle all database access using Prisma. Services depend on repository interfaces, not concrete Prisma calls directly.

This means the storage layer is replaceable without touching business logic. Swap SQLite for PostgreSQL, or even an in-memory store for tests, by swapping the repository implementation.

