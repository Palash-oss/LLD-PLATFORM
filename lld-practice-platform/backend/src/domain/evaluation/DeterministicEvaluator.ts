import { Evaluator } from './Evaluator';
import { Submission } from '../entities/Submission';
import { Rubric } from '../entities/Problem';
import { EvaluationResult } from './EvaluationResult';
import { DeterministicCheck, OverallSignal } from '../entities/Feedback';

export class DeterministicEvaluator implements Evaluator {
  async evaluate(submission: Submission, rubric: Rubric): Promise<EvaluationResult> {
    const checks: DeterministicCheck[] = [];

    const fullDiagramText = (submission.classDiagram || '').toLowerCase();
    const fullMethodText = (submission.methodSignatures || '').toLowerCase();
    const combinedDesignText = `${fullDiagramText} ${fullMethodText}`;

    // CHECK 1 — Class presence in Mermaid diagram or method signatures
    for (const expectedClass of rubric.expectedClasses) {
      const found = combinedDesignText.includes(expectedClass.toLowerCase());
      checks.push({
        label: `Defined class or concept for '${expectedClass}'`,
        passed: found,
        note: found ? undefined : `Expected class '${expectedClass}' in Mermaid classDiagram or method signatures — not found`,
      });
    }

    // CHECK 2 — Diagram relationships check (check for relationship syntax lines e.g. '-->', '--|>', '*--', 'o--', '..>')
    const hasRelationships = /(-->|--\|>|\*--|o--|\.\.\|>|\.\.>|--)/i.test(submission.classDiagram || '');
    checks.push({
      label: 'Class diagram defines structural relationships (e.g. --> or o--)',
      passed: hasRelationships,
      note: hasRelationships ? undefined : 'Class diagram does not contain relationship arrows between classes',
    });

    // CHECK 3 — Design patterns check
    if (rubric.expectedPatterns.length > 0) {
      const allText = [
        submission.classDiagram,
        submission.methodSignatures,
        submission.responsibilities,
        submission.tradeoffs,
      ].join(' ').toLowerCase();

      const anyPatternFound = rubric.expectedPatterns.some((pattern) =>
        allText.includes(pattern.toLowerCase())
      );
      const foundPatterns = rubric.expectedPatterns.filter((pattern) =>
        allText.includes(pattern.toLowerCase())
      );

      checks.push({
        label: `Used a relevant design pattern (expected: ${rubric.expectedPatterns.join(', ')})`,
        passed: anyPatternFound,
        note: anyPatternFound
          ? `Found: ${foundPatterns.join(', ')}`
          : `None of the expected patterns (${rubric.expectedPatterns.join(', ')}) were mentioned`,
      });
    }

    // CHECK 4 — Trade-off field is substantive
    const hasTradeoff = (submission.tradeoffs || '').trim().length >= 20;
    checks.push({
      label: 'Trade-off field is substantive (>= 20 characters)',
      passed: hasTradeoff,
      note: hasTradeoff ? undefined : 'Trade-off explanation is missing or too brief',
    });

    // CHECK 5 — Method signatures provided
    const hasMethods = (submission.methodSignatures || '').trim().length >= 15;
    checks.push({
      label: 'Key method signatures provided',
      passed: hasMethods,
      note: hasMethods ? undefined : 'Method signatures section is empty or too brief',
    });

    // CHECK 6 — Responsibility explanation
    const hasResponsibilities = (submission.responsibilities || '').trim().length >= 20;
    checks.push({
      label: 'Responsibility split is explained',
      passed: hasResponsibilities,
      note: hasResponsibilities ? undefined : 'Responsibility explanation is missing or too brief',
    });

    // Compute overall signal
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

    return {
      deterministicResults: checks,
      llmResults: [],
      summary: '',
      overallSignal,
      llmAvailable: false,
    };
  }
}
