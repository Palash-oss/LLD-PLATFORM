import { PrismaClient } from '@prisma/client';
import { Submission, CreateSubmissionInput } from '../domain/entities/Submission';

export class SubmissionRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // create() — Save a new submission 
  async create(attemptId: string, input: CreateSubmissionInput): Promise<Submission> {
    const row = await this.prisma.submission.create({
      data: {
        attemptId,
        classDesign: input.classDesign,
        responsibilities: input.responsibilities,
        tradeoffs: input.tradeoffs,
        rawText: input.rawText ?? '',
     
      },
    });
    return this.mapToDomain(row);
  }

  //findByAttemptId() — Get submission for an attempt 
  async findByAttemptId(attemptId: string): Promise<Submission | null> {
    const row = await this.prisma.submission.findUnique({ where: { attemptId } });
    if (!row) return null;
    return this.mapToDomain(row);
  }

  private mapToDomain(row: any): Submission {
    return {
      id: row.id,
      attemptId: row.attemptId,
      classDesign: row.classDesign,
      responsibilities: row.responsibilities,
      tradeoffs: row.tradeoffs,
      rawText: row.rawText,
      createdAt: row.createdAt,
    };
  }
}
