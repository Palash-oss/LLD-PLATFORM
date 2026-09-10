# AI Usage Report

**Project**: LLD Studio — Low Level Design Practice Platform  
**Author**: Palash Pathare  
**Date**: September 2026

---

## Overview

I used AI tools (primarily Antigravity / Google DeepMind coding assistant and Google Gemini API) throughout this project — both as a coding assistant to build the platform faster, and as the core AI feature that powers the evaluation engine.

This document covers 5 meaningful decisions where AI was involved: what I asked for, what it gave me, what I accepted, what I changed, and why.

---

## Decision 1: Evaluation Architecture — Deterministic vs. LLM

**The Problem**: I needed to decide how to evaluate LLD submissions. An LLD solution is not like a code submission where you run tests — there's no single right answer. A `ParkingLot` class can be designed many valid ways.

**What I Asked the AI**: "How should I evaluate LLD design answers that have multiple valid solutions?"

**What AI Suggested**: The AI suggested a hybrid approach — first run deterministic checks (does the diagram contain the expected classes? does it use the right relationship types? does it mention key design patterns?), and then pass the entire submission to an LLM for qualitative review (is the separation of concerns good? does the pattern choice make sense for this problem?).

**What I Accepted**: The hybrid architecture was the right call. I built `DeterministicEvaluator.ts` for rule-based checks and `LLMEvaluator.ts` for AI-powered review. Both are combined in `CompositeEvaluator.ts`.

**What I Rejected / Changed**: The AI initially suggested running both evaluators in parallel and merging results. I changed it to run deterministic first, and only if it passes basic gates does the LLM run. This saves Gemini API calls for clearly incomplete submissions and makes the feedback clearer.

**Why This Matters**: The deterministic layer gives fast, reliable, checkable feedback. The LLM layer gives the kind of architectural nuance that rules can't capture. Together they're more useful than either alone.

---

## Decision 2: Structured 4-Field Submission Form

**The Problem**: What should a learner actually submit? A single text box feels too loose. Full code is intimidating. I wanted something between "sketch on a napkin" and "write a full implementation."

**What I Asked the AI**: "What information does someone need to provide to meaningfully demonstrate their LLD understanding?"

**What AI Suggested**: Four specific fields:
1. A class diagram (Mermaid syntax) — forces visual thinking about structure
2. Method signatures — forces thinking about interfaces and responsibilities
3. Responsibility justification — forces SOLID thinking
4. Trade-offs — forces architectural self-awareness

**What I Accepted**: All four fields. This maps almost exactly to what a senior engineer would evaluate in a real LLD interview.

**What I Changed**: The AI originally suggested making all four fields required with hard minimum character limits. I relaxed this — the form accepts partial submissions and gives constructive feedback on what's missing, rather than blocking submission entirely. A learner struggling to fill one field still gets useful feedback on the others.

**Why This Matters**: The 4-field structure is the core of what makes this platform educationally useful, not just a text box that AI reads.

---

## Decision 3: Live Mermaid Diagram Preview with Debouncing

**The Problem**: Mermaid syntax has a learning curve. If the diagram preview only updates on submit, learners get no feedback while typing and make more errors.

**What I Asked the AI**: "How do I render a Mermaid diagram live as someone types without freezing the browser?"

**What AI Suggested**: Use a `useEffect` with a `setTimeout` debounce — wait 300ms after the user stops typing, then call `mermaid.render()`. Wrap in try/catch so a mid-typing syntax error doesn't crash the preview; instead, keep showing the last valid diagram.

**What I Accepted**: This exact pattern. It works well. 300ms feels instant to the user but prevents `mermaid.render()` from firing on every keystroke.

**What I Changed**: Nothing significant here. The AI's suggestion was sound and I implemented it directly in `MermaidLivePreview.tsx`.

**Why This Matters**: The live preview is the most important UX feature in the workspace. Without it, learners are writing Mermaid syntax blind, which defeats the purpose of using a visual format.

---

## Decision 4: Choosing the Gemini Model — What Actually Works

**The Problem**: The Gemini API surface has changed a lot. `gemini-2.0-flash-exp` was in the codebase but returned 404 errors. I needed to figure out which model is actually available and works reliably.

**What I Asked the AI**: "Which Gemini model should I use for structured JSON output evaluation in 2026?"

**What AI Suggested**: Try `gemini-2.5-flash` as the primary model.

**What I Found (Human Override)**: After testing, I discovered `gemini-3.6-flash` was available and faster. I updated `GeminiProvider.ts` to try `gemini-3.6-flash` first, then fall back to `gemini-2.5-flash`, then `gemini-1.5-flash-latest`. This cascading fallback means if one model is deprecated or rate-limited, the platform degrades gracefully to the next available one instead of crashing.

**What I Also Changed**: The AI evaluation timeout was originally 15 seconds — this caused many evaluations to fall back to mock output because Gemini sometimes takes 10-20 seconds for complex prompts. I increased it to 30 seconds, which fixed the issue.

**Why This Matters**: The AI feature is only useful if it actually works. Model selection and timeout tuning were real engineering decisions I made based on testing, not just AI suggestions.

---

## Decision 5: Attempt History — What to Show and What to Hide

**The Problem**: The history page showed every attempt including in-progress ones, evaluating ones, and failed ones mixed together. It was confusing and showed false "improvements" on a learner's first attempt (since there was no previous attempt to compare to).

**What I Asked the AI**: "How should the attempt history page display previous design attempts usefully?"

**What AI Suggested**: Filter to show only `evaluated` status attempts, grouped by problem, with a badge showing Strong / Solid / Needs Work.

**What I Accepted**: The filtering logic. In `HistoryPage.tsx`, I filter to only show `evaluated` or `failed` attempts. In-progress attempts don't appear — they're irrelevant noise to a learner reviewing their past work.

**What I Changed**: The AI's initial diff logic flagged every class in a first attempt as an "improvement" (since there was no previous attempt to compare against). I fixed this in `FeedbackPage.tsx` to only show diff notes when there's an actual previous attempt to compare to. On a first attempt, we skip the "progress vs. previous" section entirely. This is a correctness fix that required understanding the domain, not just implementing what the AI drafted.

**Why This Matters**: History is only useful if it shows real signal. False positives ("Added ParkingLot — was missing in your previous attempt" on your very first submission) erode trust in the evaluator.

---

## Summary

| # | Decision | AI Role | My Role |
|---|---|---|---|
| 1 | Hybrid evaluation architecture | Suggested the pattern | Tuned execution order and fallback strategy |
| 2 | 4-field structured submission | Suggested the fields | Relaxed validation gates for better UX |
| 3 | Debounced Mermaid live preview | Suggested implementation | Implemented directly, minor adjustments |
| 4 | Gemini model selection + timeout | Gave starting model suggestion | Testing, fallback cascade, timeout tuning |
| 5 | History page filtering + diff logic | Suggested filter approach | Fixed false-positive diff bug in domain logic |

The common thread: AI was useful for suggesting patterns and architecture quickly. The important engineering work — correctness, UX decisions, API debugging, and domain-specific logic — required human judgment.

