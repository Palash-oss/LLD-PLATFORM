import { Evaluator } from './Evaluator';
import { Submission } from '../entities/Submission';
import { Rubric } from '../entities/Problem';
import { EvaluationResult } from './EvaluationResult';
import { OverallSignal } from '../entities/Feedback';


export class CompositeEvaluator implements Evaluator{
    private deterministic:Evaluator;
    private llm : Evaluator;
      // Both evaluators are injected via constructor
  // This means: whoever creates a CompositeEvaluator decides which
  // DeterministicEvaluator and LLMEvaluator to use
constructor(deterministic:Evaluator,llm:Evaluator){
    this.deterministic = deterministic;
    this.llm = llm;
}


async evaluate(submission:Submission, rubric:Rubric):Promise<EvaluationResult>{
     // Run BOTH evaluators at the same time
     // Each result has either:
    //   { status: 'fulfilled', value: EvaluationResult }  ← success
    //   { status: 'rejected',  reason: Error }            ← failure

const [deterministicResult,llmResult] = await Promise.allSettled([
    this.deterministic.evaluate(submission,rubric),
    this.llm.evaluate(submission,rubric),
]);

//extracting determionistic results
 // deterministicResult.status is either 'fulfilled' or 'rejected'
 const deterministicChecks = deterministicResult.status==='fulfilled'?
 deterministicResult.value.deterministicResults:
 [];

const deterministicSignal:OverallSignal = deterministicResult.status==='fulfilled'
?deterministicResult.value.overallSignal
        : 'needs_work';

//extracting llm results
// LLM fails gracefully inside LLMEvaluator (returns empty results, llmAvailable: false)
// but just in case, we handle the rejected case here too

const llmAvailable = 
llmResult.status==='fulfilled'&&llmResult.value.llmAvailable;

const llmDimensions = llmResult.status === 'fulfilled' ? llmResult.value.llmResults : [];


const llmSummary = llmResult.status === 'fulfilled' ? llmResult.value.summary : '';

const llmSignal:OverallSignal = 
llmResult.status==='fulfilled'? llmResult.value.overallSignal:'needs_work';

//merge two signals into one overallsignal
//// If LLM was available: average both signals
// If LLM was not available: use deterministic signal only


 const overallSignal = llmAvailable
      ? this.mergeSignals(deterministicSignal, llmSignal)
      : deterministicSignal;
    // ── Build and return the combined EvaluationResult ────────────────
    return {
      deterministicResults: deterministicChecks,
      llmResults: llmDimensions,
      summary: llmSummary,
      overallSignal,
      llmAvailable,
    };


}

//mergesignal
 // Combines two OverallSignals into one.
  // Simple rule: the average of the two signals.
  // We convert signal → number, average, convert back → signal
  private mergeSignals(a:OverallSignal,b:OverallSignal):OverallSignal{
    
    const signalToNumber = (s:OverallSignal):number=>{
        if(s==='strong')return 3;
         if (s === 'solid') return 2;
      return 1; // 'needs_work'
    }
      const numberToSignal = (n: number): OverallSignal => {
      if (n >= 2.5) return 'strong';
      if (n >= 1.5) return 'solid';
      return 'needs_work';
    };
    // Average the two scores and convert back to a signal
    const avg = (signalToNumber(a) + signalToNumber(b)) / 2;
    return numberToSignal(avg);
  }



}


























