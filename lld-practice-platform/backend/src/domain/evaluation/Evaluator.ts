import { Submission } from "../entities/Submission";
import { Rubric } from "../entities/Problem";
import { EvaluationResult } from "./EvaluationResult";

// Because we have 3 concrete classes that implement this ONE interface:
//   1. DeterministicEvaluator — rule-based, no AI, fully predictable
//   2. LLMEvaluator           — calls AI, returns dimension scores
//   3. CompositeEvaluator     — orchestrates the other two
//
// And if you need to add a 4th (e.g. PeerReviewEvaluator, StaticAnalysisEvaluator),
// you write ONE new class that satisfies this contract.
// You do NOT change DeterministicEvaluator, LLMEvaluator, or CompositeEvaluator.
// This is the Open/Closed Principle: open for extension, closed for modification.




export interface Evaluator{
     evaluate(submission: Submission, rubric: Rubric): Promise<EvaluationResult>;
}
  // 'evaluate' is the ONE method every evaluator must have.
    // Parameters:
  //   submission — the learner's answer (classDesign, responsibilities, tradeoffs)
  //   rubric     — the problem's evaluation criteria (expectedClasses, dimensions etc.)