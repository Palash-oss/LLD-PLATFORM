# AI Usage Report & Governance Document

**Project**: LLD Studio — Low Level System Design Practice & AI Evaluation Platform  
**Author**: Palash Pathare  
**Date**: September 2026  

---

## 1. Executive Summary

This document details the usage of AI tools, prompt engineering, automated code generation, and human-in-the-loop oversight throughout the development of **LLD Studio**. 

AI technology was utilized in two distinct capacities during this project:
1. **Meta-Development / Coding Assistance**: Assisting in rapid full-stack scaffolding, CSS token design, component styling, and test command generation.
2. **Product Feature / Core Domain**: Integration of Google Gemini API (`@google/genai`) into the backend evaluation engine to deliver automated, rubric-aligned architectural reviews for learner submissions.

---

## 2. AI Tools & Architecture Leveraged

- **AI Model / Assistant**: Antigravity AI (Google DeepMind Agentic Coding Framework) & Google Gemini 1.5/2.0 API models.
- **Frontend Stack Scaffolding**: React 18, Vite, TypeScript, Lucide React, Mermaid.js.
- **Backend Stack Scaffolding**: Express.js, TypeScript, Prisma ORM, SQLite.

---

## 3. Detailed AI Usage Breakdown

### A. Core Evaluation Engine & Prompt Engineering
- **Prompt Architecture**: Designed a structured system prompt inside `LLMEvaluator.ts` that enforces JSON output schemas.
- **Context Injection**: The prompt dynamically injects the problem statement, functional requirements, rubric dimensions, learner's Mermaid class diagram, method signatures, responsibility justification, and architectural trade-offs.
- **Mock Provider Safeguard**: Implemented a fallback `MockProvider` so that if `GEMINI_API_KEY` is not present, the system cleanly degrades without runtime crashes, returning deterministic mock evaluation data.

### B. Visual Workspace & Mermaid Live Preview
- **Debounced Rendering**: Prompted and implemented client-side debouncing (300ms) for `mermaid.render()` inside `MermaidLivePreview.tsx`.
- **Syntax Resilience**: Added try/catch fallback handling during typing so that mid-typing syntax errors maintain the last successfully rendered SVG diagram instead of breaking the UI.

### C. UI/UX Design Token System
- **Design Tokens**: Generated a clean vanilla CSS design system (`tokens.css`) utilizing Google Fonts (`Plus Jakarta Sans`, `Inter`, `JetBrains Mono`), slate color palettes, soft drop shadows, and custom WebKit scrollbars (`::-webkit-scrollbar`).
- **Emoji Replacement**: Replaced emoji indicators across all workspace screens with clean, consistent vector icons from `lucide-react`.

---

## 4. Human-in-the-Loop Oversight & Refinements

AI outputs were actively audited, tested, and modified based on human engineering judgment:

1. **UX Rule Gate Adjustments**:
   - *AI Draft*: The initial workspace rejected submissions under 20 characters in trade-offs with a hard blocking error.
   - *Human Oversight*: Relaxed strict blocking validation to prevent user friction, converting hard blocks into constructive feedback warnings in the evaluation step.
2. **History Page Filtering**:
   - *AI Draft*: The initial history query displayed abandoned or incomplete `in_progress` attempts mixed with completed submissions.
   - *Human Oversight*: Refined frontend filtering in `HistoryPage.tsx` to display only evaluated and failed attempts, grouping them logically per problem.
3. **Database Schema & Prisma Client Sync**:
   - *Human Action*: Executed `npx prisma db push`, `npx prisma generate`, and seeded 5 default problems with full Mermaid placeholder snippets.

---

## 5. Limitations & Future AI Enhancements

- **Token Consumption**: LLM evaluation prompts currently include full submission text. For large class diagrams, future iterations will implement schema token compression.
- **Diagram Syntax Parsing**: The deterministic evaluator relies on regex-based Mermaid relation matching (`-->`, `*--`). A dedicated ANTLR/Mermaid AST parser could further enhance syntax precision.
- **Multi-Turn AI Coaching**: Future enhancements will enable conversational follow-up questions with the AI evaluator on specific trade-off decisions.
