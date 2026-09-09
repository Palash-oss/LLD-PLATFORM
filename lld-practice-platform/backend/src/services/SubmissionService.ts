import { AttemptRepository } from '../repositories/AttemptRepository';
import { SubmissionRepository } from '../repositories/SubmissionRepository';
import { ProblemRepository } from '../repositories/ProblemRepository';
import { CreateSubmissionInput, Submission } from '../domain/entities/Submission';
import { CompositeEvaluator } from '../domain/evaluation/CompositeEvaluator';
import { DiffNote } from '../domain/entities/Feedback';

export class SubmissionService {
  private attemptRepo: AttemptRepository;
  private submissionRepo: SubmissionRepository;
  private problemRepo: ProblemRepository;
  private evaluator: CompositeEvaluator;

  constructor(
    attemptRepo: AttemptRepository,
    submissionRepo: SubmissionRepository,
    problemRepo: ProblemRepository,
    evaluator: CompositeEvaluator
  ) {
    this.attemptRepo = attemptRepo;
    this.submissionRepo = submissionRepo;
    this.problemRepo = problemRepo;
    this.evaluator = evaluator;
  }

  async submit(attemptId: string, input: CreateSubmissionInput): Promise<{ message: string }> {
    const attempt = await this.attemptRepo.findById(attemptId);
    if (!attempt) throw new Error(`Attempt '${attemptId}' not found`);

    if (attempt.status !== 'in_progress') {
      throw new Error(`Attempt is already ${attempt.status} — cannot submit again`);
    }

    if (!input.tradeoffs || input.tradeoffs.trim().length < 20) {
      throw new Error('Trade-off explanation is required and must be at least 20 characters');
    }

    const submission = await this.submissionRepo.create(attemptId, input);

    await this.attemptRepo.updateStatus(attemptId, 'submitted', new Date());
    await this.attemptRepo.updateStatus(attemptId, 'evaluating');

    setImmediate(() => {
      this.runEvaluation(attemptId, submission).catch((err) => {
        console.error(`Evaluation crashed for attempt ${attemptId}:`, err);
      });
    });

    return { message: 'Submission received. Evaluation in progress.' };
  }

  private async runEvaluation(attemptId: string, submission: Submission): Promise<void> {
    try {
      const attempt = await this.attemptRepo.findById(attemptId);
      if (!attempt) throw new Error('Attempt not found during evaluation');

      const problem = await this.problemRepo.findById(attempt.problemId);
      if (!problem?.rubric) throw new Error('Problem or rubric not found');

      const comparedToPrevious = await this.buildDiffNotes(
        attempt.learnerId,
        attempt.problemId,
        submission
      );

      const result = await this.evaluator.evaluate(submission, problem.rubric);

      await this.attemptRepo.saveFeedback(attemptId, {
        attemptId,
        deterministicResults: result.deterministicResults,
        llmResults: result.llmResults,
        summary: result.summary,
        overallSignal: result.overallSignal,
        llmAvailable: result.llmAvailable,
        comparedToPrevious,
      });

      await this.attemptRepo.updateStatus(attemptId, 'evaluated');
    } catch (err) {
      console.error(`Evaluation failed for ${attemptId}:`, err);
      await this.attemptRepo.updateStatus(attemptId, 'failed');
    }
  }

  private async buildDiffNotes(
    learnerId: string,
    problemId: string,
    currentSubmission: Submission
  ): Promise<DiffNote[] | null> {
    const previousAttempts = await this.attemptRepo.findByLearnerAndProblem(learnerId, problemId);
    const evaluatedAttempts = previousAttempts.filter((a) => a.status === 'evaluated');

    if (evaluatedAttempts.length === 0) return null;

    const lastAttempt = evaluatedAttempts[evaluatedAttempts.length - 1];
    const lastFeedback = await this.attemptRepo.getFeedback(lastAttempt.id);
    if (!lastFeedback) return null;

    const problem = await this.problemRepo.findById(problemId);
    if (!problem?.rubric) return null;

    const notes: DiffNote[] = [];
    const currentText = [
      currentSubmission.classDiagram,
      currentSubmission.methodSignatures,
      currentSubmission.responsibilities,
      currentSubmission.tradeoffs,
    ].join(' ').toLowerCase();

    for (const expectedClass of problem.rubric.expectedClasses) {
      const inCurrent = currentText.includes(expectedClass.toLowerCase());

      const failedBefore = lastFeedback.deterministicResults.some(
        (check) => check.label.includes(expectedClass) && !check.passed
      );

      if (inCurrent && failedBefore) {
        notes.push({
          type: 'improvement',
          label: `Added '${expectedClass}' — was missing in your previous attempt`,
        });
      } else if (!inCurrent && !failedBefore) {
        notes.push({
          type: 'regression',
          label: `Missing '${expectedClass}' — was present in your previous attempt`,
        });
      }
    }

    return notes.length > 0 ? notes : null;
  }
}
