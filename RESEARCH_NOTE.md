# Research Note: Interactive LLD Practice & Evaluation Platform

**Author**: Palash Pathare  
**Date**: September 2026  
**Target Subject**: Low-Level System Design (LLD) Mastery for Software Engineers  

---

## 1. Problem Statement & Background

Software engineering interviews at top tech companies frequently evaluate candidates on **Low-Level System Design (LLD)** or **Object-Oriented Design (OOD)**. In these interviews, candidates are expected to model domain entities, apply design patterns (e.g., Strategy, Factory, Observer, State), cleanly split responsibilities (SOLID principles), and articulate explicit architectural trade-offs.

### Key Pain Points of Current Learners:
1. **Algorithmic Bias in Existing Platforms**: Platforms like LeetCode and HackerRank excel at Data Structures and Algorithms (DSA) but provide zero native workflow or automated feedback for low-level object-oriented system design.
2. **Passive vs. Active Practice**: Learners typically consume static blog posts or video tutorials (e.g., "Design Parking Lot in Java"). However, passive reading does not build muscle memory for modeling classes, choosing design patterns under constraint, or justifying trade-offs.
3. **Lack of Instant, Structured Feedback**: Unlike competitive programming where test cases pass or fail deterministically, LLD solutions are subjective. Learners rarely receive detailed feedback on their responsibility splits or class relationships without human mentor intervention.
4. **Visual Disconnect**: System design requires visual thinking, yet candidates are forced to communicate class structures using raw code snippets or informal whiteboard sketches without standardized diagram generation.

---

## 2. Market Gap & Product Direction

| Aspect | Existing Coding Platforms | Static Tutorials / Design Books | **LLD Studio (Proposed MVP)** |
| :--- | :--- | :--- | :--- |
| **Primary Focus** | LeetCode / DSA Puzzles | Passive Architecture Reading | **Interactive LLD Class Modeling** |
| **Diagramming** | None | Static images | **Real-Time Mermaid.js Live Rendering** |
| **Submission Model** | Code file execution | None | **Structured 4-Dimension Submission** |
| **Evaluation** | Unit test assertion | None | **Dual-Engine (Rule-Based + AI LLM)** |
| **Feedback Loop** | Pass/Fail boolean | Manual reading | **Rubric-Scored Dimensions & Diff Tracking** |

### Product Vision
**LLD Studio** aims to be the standard platform for interactive low-level design practice. It treats class diagrams, method signatures, responsibility reasoning, and trade-offs as first-class citizens in a unified, modern web workspace.

---

## 3. Target User Personas

1. **Mid-Level Software Engineers (SDE-1 to SDE-2)**: Preparing for machine coding and LLD interview rounds. Seeking structured practice with real-world problems (Parking Lot, Elevator System, Vending Machine).
2. **Senior Engineers / Architects**: Looking to hone OOP design pattern application and validate clean architecture decisions against automated domain rubrics.
3. **Computer Science Students & Bootcamp Learners**: Transitioning from basic programming to software engineering principles (SOLID, Design Patterns, Encapsulation).

---

## 4. Key Functional & Product Requirements

1. **Curated Problem Library**: Diverse problem set categorized by difficulty (Easy, Medium, Hard) covering essential design patterns (Strategy, State, Observer, Singleton, Factory).
2. **Live Visual Workspace**: Instant preview of Mermaid class diagrams with sub-300ms debouncing and mid-typing syntax resilience.
3. **Structured Design Capture**:
   - Visual Class Diagram (Mermaid `classDiagram`)
   - Method Signatures & Attributes (Pseudocode/TypeScript)
   - Responsibility Split Rationale (SOLID justification)
   - Architectural Trade-offs & Compromises
4. **Dual-Layer Automated Evaluation**:
   - **Deterministic Engine**: Rapid validation of domain classes, valid relationship syntax (`-->`, `*--`, `<|..`), pattern keyword detection, and length gates.
   - **LLM Evaluation Engine**: AI-assisted rubric evaluation generating scores and actionable improvement advice across dimensions.
5. **Iteration & Progression History**: Historical attempt tracking to visually compare past design iterations and measure growth.

---

## 5. Evaluation & Impact Metrics

- **Completion Rate**: % of learners who complete all 4 design submission fields per problem.
- **Iteration Rate**: Average number of design attempts per problem before reaching a "Solid" or "Strong" evaluation signal.
- **Diagram Syntax Error Frequency**: Reduction in Mermaid rendering errors over time due to real-time preview feedback.
