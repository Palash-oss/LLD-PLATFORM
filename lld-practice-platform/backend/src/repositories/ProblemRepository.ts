import { PrismaClient } from '@prisma/client';
import { Problem, Rubric, RubricDimension } from '../domain/entities/Problem';

export class ProblemRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findAll(): Promise<Problem[]> {
    const rows = await this.prisma.problem.findMany({
      include: { rubric: true },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((row) => this.mapToDomain(row));
  }

  async findBySlug(slug: string): Promise<Problem | null> {
    const row = await this.prisma.problem.findUnique({
      where: { slug },
      include: { rubric: true },
    });
    if (!row) return null;
    return this.mapToDomain(row);
  }

  async findById(id: string): Promise<Problem | null> {
    const row = await this.prisma.problem.findUnique({
      where: { id },
      include: { rubric: true },
    });
    if (!row) return null;
    return this.mapToDomain(row);
  }

  private mapToDomain(row: any): Problem {
    const rubric: Rubric | undefined = row.rubric
      ? {
          id: row.rubric.id,
          problemId: row.rubric.problemId,
          expectedClasses: JSON.parse(row.rubric.expectedClasses),
          expectedPatterns: JSON.parse(row.rubric.expectedPatterns),
          exampleClassDiagram: row.rubric.exampleClassDiagram ?? '',
          dimensions: JSON.parse(row.rubric.dimensions) as RubricDimension[],
        }
      : undefined;
    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      statement: row.statement,
      functionalRequirements: JSON.parse(row.functionalRequirements),
      nonFunctionalRequirements: JSON.parse(row.nonFunctionalRequirements),
      difficulty: row.difficulty as 'easy' | 'medium' | 'hard',
      rubric,
      createdAt: row.createdAt,
    };
  }
}
