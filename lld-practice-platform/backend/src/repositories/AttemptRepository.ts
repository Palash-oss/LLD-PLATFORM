import { PrismaClient } from '@prisma/client';
import { Attempt, AttemptStatus } from '../domain/entities/Attempt';
import { Feedback, DeterministicCheck, DimensionScore, DiffNote, OverallSignal } from '../domain/entities/Feedback';

export class AttemptRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // create() — Start a new attempt
  async create(learnerId: string, problemId: string): Promise<Attempt> {
   
    const row = await this.prisma.attempt.create({
      data: {
        learnerId,
        problemId,
        status: 'in_progress',
       
      },
    });
    return this.mapAttemptToDomain(row);
  }

  // findById() — Get one attempt
  async findById(id: string): Promise<Attempt | null> {
    const row = await this.prisma.attempt.findUnique({ where: { id } });
    if (!row) return null;
    return this.mapAttemptToDomain(row);
  }

  // findByLearnerAndProblem()Get all attempts for one learner on one problem
  // Used by HistoryService to build diff notes (compare attempt N vs attempt N-1)
  async findByLearnerAndProblem(learnerId: string, problemId: string): Promise<Attempt[]> {
    const rows = await this.prisma.attempt.findMany({
      where: { learnerId, problemId },
    
      orderBy: { createdAt: 'asc' }, 
    });
    return rows.map((row) => this.mapAttemptToDomain(row));
  }

  //findAllByLearner() Get ALL attempts by a learner 
  async findAllByLearner(learnerId: string): Promise<Attempt[]> {
    const rows = await this.prisma.attempt.findMany({
      where: { learnerId },
      orderBy: { createdAt: 'desc' }, // newest first
    });
    return rows.map((row) => this.mapAttemptToDomain(row));
  }

  //updateStatus()Change attempt status
  async updateStatus(id: string, status: AttemptStatus, submittedAt?: Date): Promise<void> {
  
    await this.prisma.attempt.update({
      where: { id },
      data: {
        status,
       
        ...(submittedAt ? { submittedAt } : {}),
       
      },
    });
  }

  //saveFeedback()Store evaluation results in DB
  async saveFeedback(attemptId: string, feedback: Omit<Feedback, 'id' | 'createdAt'>): Promise<void> {
   

    await this.prisma.feedback.create({
      data: {
        attemptId,
       
        deterministicResults: JSON.stringify(feedback.deterministicResults),
        llmResults: JSON.stringify(feedback.llmResults),
        summary: feedback.summary,
        overallSignal: feedback.overallSignal,
        llmAvailable: feedback.llmAvailable,
        comparedToPrevious: feedback.comparedToPrevious
          ? JSON.stringify(feedback.comparedToPrevious)
          : null,
      },
    });
  }

  // getFeedback()  Get feedback for an attempt
  async getFeedback(attemptId: string): Promise<Feedback | null> {
    const row = await this.prisma.feedback.findUnique({ where: { attemptId } });
    if (!row) return null;

    return {
      id: row.id,
      attemptId: row.attemptId,
      deterministicResults: JSON.parse(row.deterministicResults) as DeterministicCheck[],
      llmResults: JSON.parse(row.llmResults) as DimensionScore[],
      summary: row.summary,
      overallSignal: row.overallSignal as OverallSignal,
      llmAvailable: row.llmAvailable,
      comparedToPrevious: row.comparedToPrevious
        ? (JSON.parse(row.comparedToPrevious) as DiffNote[])
        : null,
      createdAt: row.createdAt,
    };
  }

  //  Helper: map DB row → Attempt domain object 
  private mapAttemptToDomain(row: any): Attempt {
    return {
      id: row.id,
      learnerId: row.learnerId,
      problemId: row.problemId,
      status: row.status as AttemptStatus,
      createdAt: row.createdAt,
      submittedAt: row.submittedAt ?? undefined,
     
    };
  }
}
