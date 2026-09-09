import { ProblemRepository } from '../repositories/ProblemRepository';
import { Problem } from '../domain/entities/Problem';

export class ProblemService {
  // Service holds a reference to its repository
  private problemRepo: ProblemRepository;

  constructor(problemRepo: ProblemRepository) {
    this.problemRepo = problemRepo;
  }

  // Get all problems — used for the problem list page
  async getAllProblems(): Promise<Problem[]> {
    return this.problemRepo.findAll();
  }

  // Get one problem by slug — used for problem detail page
  // e.g. slug = 'parking-lot'
  async getProblemBySlug(slug: string): Promise<Problem> {
    const problem = await this.problemRepo.findBySlug(slug);

    // If the slug doesn't exist in DB, throw an error
    // The route will catch this and send a 404 response
    if (!problem) {
      throw new Error(`Problem with slug '${slug}' not found`);
    }

    return problem;
  }
}
