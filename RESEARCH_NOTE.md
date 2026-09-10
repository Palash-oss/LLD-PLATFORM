# Research Note: Why LLD Practice Is Broken and What to Do About It

**Author**: Palash Pathare  
**Date**: September 2026

---

## The Problem I Started With

When software engineers prepare for LLD (Low-Level Design) interview rounds, they run into a very specific problem: there's no good way to practice and actually know if you're doing it right.

LLD interviews ask you to model systems — a Parking Lot, an Elevator, a Vending Machine — using classes, relationships, and design patterns. You have to show that you understand Single Responsibility, know when to use Strategy vs. State, can draw out a class hierarchy that makes sense, and can explain *why* you made the choices you made.

The trouble is, almost everything that exists to practice this is passive. You read a blog post. You watch a video. You look at a GitHub repo of "solved" design problems. None of these tell you whether *your* design is good or what specifically you should change.

I wanted to understand this problem better, so I looked at what people actually use to prepare for LLD rounds.

---

## What's Out There Today

### LeetCode and HackerRank
These are the go-to platforms for technical interview prep. They're excellent for Data Structures and Algorithms — you write code, it runs against test cases, you get instant pass/fail feedback.

They don't touch LLD at all. There's no workflow for submitting a class diagram or getting feedback on your object model. Some LeetCode problems involve OOP, but the evaluation is still "does the code produce the right output", not "is this a good design".

**Gap**: No LLD practice loop at all.

### System Design Interview Resources (Grokking, Educative, YouTube)
These cover system design at two levels: High-Level Design (HLD — databases, queues, CDNs, scaling) and Low-Level Design (OOP, classes, patterns). Resources like Grokking the System Design Interview, Gaurav Sen's YouTube channel, and various GitHub repositories of "LLD solved problems" are popular.

The content is good. The problem is that it's passive. You read someone else's solution. You don't submit your own and find out what's wrong with it.

**Gap**: Good reference material, but no practice loop. You can't submit your design and find out if it's actually correct.

### AlgoExpert / DesignGuru
These platforms have system design modules. DesignGuru has LLD-specific content. But the format is: watch a solution video, read the explanation. Some platforms let you type out a solution, but there's no automated evaluation — it's purely self-graded.

**Gap**: Content is there but no feedback mechanism on your actual submission.

### Excalidraw / Lucidchart / Draw.io
Some learners use whiteboard tools to sketch class diagrams while studying. This helps with the visual thinking, but there's no evaluation, no structured submission, no comparison with previous attempts.

**Gap**: Good for visual thinking, zero feedback on whether the design is correct.

---

## What Learners Actually Need

From looking at what's missing across all these tools, I identified a few things that a good LLD practice experience needs:

**1. A structured way to express your design**  
Not just a text box. LLD has specific components: the class structure (who exists, who owns whom), the interfaces (what can each class do), the responsibility rationale (why did I split things this way), and the trade-offs (what did I sacrifice). These need to be first-class fields, not just freeform text.

**2. Instant feedback that doesn't require a human mentor**  
Most learners preparing for interviews don't have a senior engineer reviewing their designs. They need automated feedback. But LLD is subjective — there's no single right answer. The feedback system has to handle this, giving useful signal even when the design is "different but valid" vs. "actually wrong".

**3. A way to see progress over time**  
Interview prep is an iteration loop. You design something, you get feedback, you try again. A platform that only supports one submission per problem misses this entirely. Learners need to see how their designs changed between attempts.

**4. Low barrier to getting started**  
Mermaid `classDiagram` syntax is learnable in 5 minutes. It's text-based so it's easy to type, but it renders as a real diagram so it's visual. This is much better than asking learners to use a separate drawing tool.

---

## The Product Direction

Based on this research, I built LLD Studio around a simple loop:

**Choose problem → Design visually → Submit → Get feedback → Review → Try again**

The key bets I made:

- **Mermaid diagrams as the design surface**: Forces visual thinking, but stays in text so it's fast to write and easy to evaluate programmatically.
- **4-field structured submission**: Class diagram + method signatures + responsibility rationale + trade-offs. Each maps directly to a real interview evaluation dimension.
- **Hybrid evaluation**: Deterministic rule checks catch concrete requirements (expected classes, valid relationship syntax, pattern presence). AI evaluation handles the qualitative judgment that rules can't — whether the design choices actually make sense architecturally.
- **Attempt history with diffs**: Each submission is stored. The feedback page shows what improved or regressed compared to your previous attempt on the same problem.

The scope I kept deliberately small: 5 problems, 1 learner session (no auth), synchronous evaluation. A 2-day prototype doesn't need multi-tenancy or a job queue — it needs to demonstrate that the core loop works end-to-end.

---

## What I'd Validate Next

If this were a real product, the key questions I'd want answered with real users:

1. Do learners understand what to put in each of the 4 fields without explanation? (The field labels and placeholders help, but this needs user testing.)
2. Does the AI feedback feel useful and trustworthy, or does it feel generic? (The feedback quality is directly tied to prompt design.)
3. How many attempts does it take a typical learner to go from "Needs Work" to "Strong" on a given problem? (This tells you whether the feedback loop is actually driving improvement.)

