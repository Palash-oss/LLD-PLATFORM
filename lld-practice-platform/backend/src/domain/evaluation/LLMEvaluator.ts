import { Evaluator } from './Evaluator';
import { Submission } from '../entities/Submission';
import { Rubric } from '../entities/Problem';
import { EvaluationResult } from './EvaluationResult';
import { DimensionScore, OverallSignal } from '../entities/Feedback';
import { AIProvider } from '../providers/AIProvider';

export class LLMEvaluator implements Evaluator {
  private provider: AIProvider;

  constructor(provider: AIProvider) {
    this.provider = provider;
  }

  async evaluate(submission: Submission, rubric: Rubric): Promise<EvaluationResult> {
    try {
      const prompt = this.buildPrompt(submission, rubric);

      const rawResponse = await Promise.race([
        this.provider.generate(prompt),
        new Promise<string>((_, reject) =>
          setTimeout(() => reject(new Error('LLM timeout after 45s')), 45000)
        ),
      ]);

      const parsed = this.parseResponse(rawResponse);

      return {
        deterministicResults: [],
        llmResults: parsed.dimensions,
        summary: parsed.summary,
        overallSignal: parsed.overallSignal,
        llmAvailable: true,
      };
    } catch (error) {
      console.error('LLMEvaluator failed:', error);
      return {
        deterministicResults: [],
        llmResults: [],
        summary: '',
        overallSignal: 'needs_work',
        llmAvailable: false,
      };
    }
  }

  private buildPrompt(submission: Submission, rubric: Rubric): string {
    const dimensionsList = rubric.dimensions
      .map((d, index) => `${index + 1}. ${d.name}: ${d.description}`)
      .join('\n');

    return `
You are an expert Low-Level Design (LLD) interviewer reviewing a candidate's solution.
Evaluate the following solution against each dimension listed below.
Respond ONLY with valid JSON — no markdown, no explanation outside the JSON.

--- CANDIDATE SUBMISSION ---
Mermaid Class Diagram:
${submission.classDiagram}

Key Method Signatures:
${submission.methodSignatures}

Responsibility Explanation:
${submission.responsibilities}

Trade-offs Made:
${submission.tradeoffs}

--- EVALUATION DIMENSIONS ---
${dimensionsList}

--- REQUIRED JSON FORMAT ---
{
  "dimensions": [
    {
      "dimension": "dimension name here",
      "signal": "weak" | "acceptable" | "strong",
      "explanation": "2-3 sentence explanation"
    }
  ],
  "summary": "One paragraph overall summary",
  "overallSignal": "needs_work" | "solid" | "strong"
}
`.trim();
  }

  private parseResponse(raw: string): {
    dimensions: DimensionScore[];
    summary: string;
    overallSignal: OverallSignal;
  } {
    const match = raw.match(/\{[\s\S]*\}/);
    const cleaned = match ? match[0] : raw;

    const parsed = JSON.parse(cleaned);

    if (!Array.isArray(parsed.dimensions)) {
      throw new Error('Invalid LLM response: dimensions is not an array');
    }
    return {
      dimensions: parsed.dimensions as DimensionScore[],
      summary: parsed.summary || '',
      overallSignal: (parsed.overallSignal as OverallSignal) || 'needs_work',
    };
  }
}