import { AttemptRepository } from '../repositories/AttemptRepository';
import { SubmissionRepository } from '../repositories/SubmissionRepository';
import { ProblemRepository } from '../repositories/ProblemRepository';
import { Attempt } from '../domain/entities/Attempt';
import { Feedback } from '../domain/entities/Feedback';
import { Submission } from '../domain/entities/Submission';

export class AttemptService {
  private attemptRepo: AttemptRepository;
  private problemRepo: ProblemRepository;
  private submissionRepo: SubmissionRepository;

  constructor(attemptRepo: AttemptRepository, problemRepo: ProblemRepository, submissionRepo: SubmissionRepository) {
    this.attemptRepo = attemptRepo;
    this.problemRepo = problemRepo;
    this.submissionRepo = submissionRepo;
  }

  // Start a new attempt for a learner on a problem
  async startAttempt(learnerId: string, problemId: string): Promise<Attempt> {
    // First check the problem actually exists
    const problem = await this.problemRepo.findById(problemId);
    if (!problem) {
      throw new Error(`Problem '${problemId}' not found`);
    }

    // Create the attempt in DB with status 'in_progress'
    return this.attemptRepo.create(learnerId, problemId);
  }

  // Get an attempt by ID — used for status polling
  async getAttempt(id: string): Promise<Attempt> {
    const attempt = await this.attemptRepo.findById(id);
    if (!attempt) {
      throw new Error(`Attempt '${id}' not found`);
    }
    return attempt;
  }

  // Get current evaluation status — frontend polls this every 2 seconds
  async getStatus(attemptId: string): Promise<{ status: string }> {
    const attempt = await this.getAttempt(attemptId);
    // Just return the status string — that's all the frontend needs to poll
    return { status: attempt.status };
  }

  // Get feedback once evaluation is complete
  async getFeedback(attemptId: string): Promise<Feedback> {
    // Make sure the attempt exists
    const attempt = await this.getAttempt(attemptId);

    // Make sure evaluation is actually done
    if (attempt.status !== 'evaluated') {
      throw new Error(`Attempt '${attemptId}' is not yet evaluated (status: ${attempt.status})`);
    }

    // Get the feedback from DB
    const feedback = await this.attemptRepo.getFeedback(attemptId);
    if (!feedback) {
      throw new Error(`Feedback for attempt '${attemptId}' not found`);
    }

    return feedback;
  }

  // Get the submission content for an attempt (what the learner actually wrote)
  async getSubmission(attemptId: string): Promise<Submission | null> {
    const attempt = await this.getAttempt(attemptId);
    if (attempt.status === 'in_progress') return null;
    return this.submissionRepo.findByAttemptId(attemptId);
  }
}
