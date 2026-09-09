import { DeterministicCheck,DimensionScore,OverallSignal,DiffNote } from "../entities/Feedback";



//evaluationresult  CompositeEvaluator takes two EvaluationResults and builds one Feedback object.

export interface EvaluationResult{
    deterministicResults:DeterministicCheck[];
    llmResults:DimensionScore[];
    summary: string;
    overallSignal: OverallSignal;
     llmAvailable: boolean;
}















