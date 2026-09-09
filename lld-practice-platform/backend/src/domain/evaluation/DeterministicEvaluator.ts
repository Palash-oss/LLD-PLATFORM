import { Evaluator } from './Evaluator';
import { Submission } from '../entities/Submission';
import { Rubric } from '../entities/Problem';
import { EvaluationResult } from './EvaluationResult';
import { DeterministicCheck, OverallSignal } from '../entities/Feedback';

export class DeterministicEvaluator implements Evaluator {
  async evaluate(submission: Submission, rubric: Rubric): Promise<EvaluationResult> {
    const checks: DeterministicCheck[] = [];

    // CHECK 1 — Did they name the expected classes?
    for (const expectedClass of rubric.expectedClasses) {
      const found = submission.classDesign.toLowerCase().includes(expectedClass.toLowerCase());
      checks.push({
        label: `Defined class or concept for '${expectedClass}'`,
        passed: found,
        note: found ? undefined : `Expected '${expectedClass}' in class design — not found`,
      });
    }

    // CHECK 2 — Did they mention any expected design pattern keywords?
    if (rubric.expectedPatterns.length > 0) {
      const allText = [
        submission.classDesign,
        submission.responsibilities,
        submission.tradeoffs,
      ].join(' ').toLowerCase();

      const anyPatternFound = rubric.expectedPatterns.some(
        (pattern) => allText.includes(pattern.toLowerCase())
      );
      const foundPatterns = rubric.expectedPatterns.filter(
        (pattern) => allText.includes(pattern.toLowerCase())
      );

      checks.push({
        label: `Used a relevant design pattern (expected: ${rubric.expectedPatterns.join(', ')})`,
        passed: anyPatternFound,
        note: anyPatternFound
          ? `Found: ${foundPatterns.join(', ')}`
          : `None of the expected patterns were mentioned`,
      });
    }

    // CHECK 3 — Is the tradeoff field meaningful?
    const hasTradeoff = submission.tradeoffs.trim().length > 20;
    checks.push({
      label: 'Trade-off field is substantive (not empty or trivial)',
      passed: hasTradeoff,
      note: hasTradeoff ? undefined : 'Trade-off explanation is missing or too brief',
    });

    // CHECK 4 — Is classDesign long enough?
    const hasSubstantiveDesign = submission.classDesign.trim().length > 50;
    checks.push({
      label: 'Class design has substantive content',
      passed: hasSubstantiveDesign,
      note: hasSubstantiveDesign ? undefined : 'Class design is too brief',
    });

    // CHECK 5 — Is responsibilities explained?
    const hasResponsibilities = submission.responsibilities.trim().length > 20;
    checks.push({
      label: 'Responsibility split is explained',
      passed: hasResponsibilities,
      note: hasResponsibilities ? undefined : 'Responsibility explanation is missing or too brief',
    });

    // Compute overall signal from how many checks passed
    const passedCount = checks.filter((c) => c.passed).length;
    const passRatio = passedCount / checks.length;

    let overallSignal: OverallSignal;
    if (passRatio >= 0.8) {
      overallSignal = 'strong';
    } else if (passRatio >= 0.5) {
      overallSignal = 'solid';
    } else {
      overallSignal = 'needs_work';
    }

    // Return the result
    return {
      deterministicResults: checks,
      llmResults: [],
      summary: '',
      overallSignal,
      llmAvailable: false,
    };
  }
}
