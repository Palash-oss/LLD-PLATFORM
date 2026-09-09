import { AttemptRepository } from '../repositories/AttemptRepository';
import { ProblemRepository } from '../repositories/ProblemRepository';
import { Attempt } from '../domain/entities/Attempt';

export interface AttemptWithFeedback extends Attempt {
  problemTitle: string;
  problemSlug: string;
}

export class HistoryService {
  private attemptRepo: AttemptRepository;
  private problemRepo: ProblemRepository;

  constructor(attemptRepo: AttemptRepository, problemRepo: ProblemRepository) {
    this.attemptRepo = attemptRepo;
    this.problemRepo = problemRepo;
  }

  async getLearnerHistory(learnerId: string): Promise<AttemptWithFeedback[]> {
    const attempts = await this.attemptRepo.findAllByLearner(learnerId);
    const enriched = await Promise.all(
      attempts.map(async (attempt) => {
        const problem = await this.problemRepo.findById(attempt.problemId);
        return {
          ...attempt,
          problemTitle: problem?.title ?? 'Unknown Problem',
          problemSlug: problem?.slug ?? '',
        };
      })
    );
    return enriched;
  }

  async getHistoryForProblem(learnerId: string, problemId: string) {
    const attempts = await this.attemptRepo.findByLearnerAndProblem(learnerId, problemId);
    const withFeedback = await Promise.all(
      attempts.map(async (attempt) => {
        const feedback =
          attempt.status === 'evaluated'
            ? await this.attemptRepo.getFeedback(attempt.id)
            : null;
        return { ...attempt, feedback };
      })
    );
    return withFeedback;
  }
}
