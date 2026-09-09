// Submission = the learner's actual answer to a problem.
// It belongs to exactly ONE Attempt (linked via attemptId).

export interface Submission {
  id: string;
  attemptId: string; // Foreign key — links this Submission to exactly one Attempt

  classDiagram: string;
  // Mermaid classDiagram syntax — captures classes and relationships visually
  // e.g. "classDiagram\nParkingLot --> ParkingSpot\nParkingSpot --> Vehicle"

  methodSignatures: string;
  // Text/pseudocode of key method signatures per class
  // e.g. "ParkingSpot: +allocate(v: Vehicle): boolean"

  responsibilities: string;
  // Short explanation of responsibility split reasoning

  tradeoffs: string;
  // Required, minimum ~20 characters — at least one explicit trade-off

  rawText: string;
  // Fallback free-form field

  createdAt: Date;
}

// Data Transfer Object sent from frontend
export interface CreateSubmissionInput {
  classDiagram: string;      // Required — Mermaid classDiagram syntax
  methodSignatures: string;  // Required — method signatures pseudocode
  responsibilities: string;  // Required — responsibility explanation
  tradeoffs: string;         // Required — minimum 20 characters
  rawText?: string;          // Optional free-form fallback
}