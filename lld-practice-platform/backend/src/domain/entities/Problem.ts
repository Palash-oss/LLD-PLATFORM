export interface Problem {
  id: string;
  title: string;
  slug: string;
  statement: string;
  functionalRequirements: string[];
  nonFunctionalRequirements: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  rubric?: Rubric;
  createdAt: Date;
}

export interface Rubric {
  id: string;
  problemId: string;
  expectedClasses: string[];
  expectedPatterns: string[];
  exampleClassDiagram?: string; // Seed example Mermaid snippet for placeholder
  dimensions: RubricDimension[];
}

export interface RubricDimension {
  name: string;
  description: string;
}