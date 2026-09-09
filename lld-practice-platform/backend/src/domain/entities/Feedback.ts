//deterministic evaluation results (no LLM involved)


export interface DeterministicCheck{
    label:string;//a description of what was checked eg:"used Interface "

     passed:boolean;
     //true,false 

     note?:string;
     //optional showed when passed = false exmaple something was empty and was an important requirement.
  
}


//DimensionScore from weak-strong how well did the solution score on this dimension
export interface DimensionScore {
    dimension:string;//dimension name same as in rubricDimensions
    signal:'weak'|'acceptable'|"strong";
  explanation:string;//detailed explanation of the score
}


//diffnote 
// One note showing what changed compared to the learner's PREVIOUS attempt
// on the same problem. Only populated if they've tried this problem before.


export interface DiffNote{
    type:'improvement'|'regression'|'new';
     // 'improvement' = something missing last time is now present
  // 'regression'  = something that WAS present is now missing
  // 'new'         = something entirely new that wasn't in the rubric before

  label:string;
}




//overallSignal no number used 3 string literals used as lld has no single correct answer
//as two different design can be both right


export type OverallSignal = 'needs_work'|'solid'|'strong'



//feedback

export interface Feedback{
    id:string,
    attemptId:string,
    deterministicResults:DeterministicCheck[];
    llmResults:DimensionScore[];
    summary:string;
    overallSignal:OverallSignal;
    llmAvailable:boolean;
    comparedToPrevious: DiffNote[] | null;
    createdAt:Date;
}




