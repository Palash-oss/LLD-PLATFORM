import { Evaluator } from './Evaluator';
import { Submission } from '../entities/Submission';
import { Rubric } from '../entities/Problem';
import { EvaluationResult } from './EvaluationResult';
import { DimensionScore, OverallSignal } from '../entities/Feedback';
import { AIProvider } from '../providers/AIProvider';




export class LLMEvaluator implements Evaluator{
    private provider:AIProvider;

    constructor(provider:AIProvider){
        this.provider=provider;
    }

    async evaluate(submission:Submission,rubric:Rubric):Promise<EvaluationResult>{
        try{
            const prompt = this.buildPrompt(submission,rubric);

        //step2 call ai with a 15 second timeout
        const rawResponse = await Promise.race([
            this.provider.generate(prompt),


            new Promise<string>((_,reject)=>
            setTimeout(()=> reject(new Error('LLM timeout after 15s')),15000))
        ])

        //step3 parse ai response
        const parsed = this.parseResponse(rawResponse);


        //step 4 return result
        return {
            deterministicResults: [],   // LLMEvaluator doesn't do rule checks
        llmResults: parsed.dimensions,
        summary: parsed.summary,
        overallSignal: parsed.overallSignal,
        llmAvailable: true,         // LLM worked successfully
        };

        }
        catch(error){
              console.error('LLMEvaluator failed:', error);
      return {
        deterministicResults: [],
        llmResults: [],       // Empty — AI failed
        summary: '',
        overallSignal: 'needs_work',
        llmAvailable: false,  // This flag tells the frontend: "AI was down"
      };
        }
    }

//building prompt building the text we sent to gemini and we tell ai exactly
//what to format to respond in JSON
private buildPormpt(submission:Submission,rubric:Rubric):string {
    const dimensionsList=rubric.dimensions
    .map((d,index)=>`${index+1}. ${d.name}: ${d.description}`).join('\n');


  return `
You are an expert Low-Level Design (LLD) interviewer reviewing a candidate's solution.
Evaluate the following solution against each dimension listed below.
Respond ONLY with valid JSON — no markdown, no explanation outside the JSON.
 SUBMISSION 
Class Design:
${submission.classDesign}
Responsibility Explanation:
${submission.responsibilities}
Trade-offs Made:
${submission.tradeoffs}
 EVALUATION DIMENSIONS 
${dimensionsList}
 REQUIRED JSON FORMAT 
{
  "dimensions": [
    {
      "dimension": "dimension name here",
      "signal": "weak" | "acceptable" | "strong",
      "explanation": "2-3 sentence explanation"
    }
  ],
  "summary": "One paragraph overall summary",
  "overallSignal": "needs_work" | "solid" | "strong"
}
`.trim();
  

}
 
  // Parses the AI's raw text response into typed data.
  // The AI might return markdown fences (```json...```) so we clean that first.
  private parseResponse(raw: string): {
    dimensions: DimensionScore[];
    summary: string;
    overallSignal: OverallSignal;
  } {
    // Remove markdown code fences if the AI wraps its response in them
    // e.g. "```json\n{...}\n```" → "{...}"
    const cleaned = raw
      .replace(/```json\n?/g, '')   // remove opening ```json
      .replace(/```\n?/g, '')       // remove closing ```
      .trim();
   
    // If the string is not valid JSON → throws an error → caught in evaluate()
    const parsed = JSON.parse(cleaned);
  
    if (!Array.isArray(parsed.dimensions)) {
      throw new Error('Invalid LLM response: dimensions is not an array');
    }
    return {
      dimensions: parsed.dimensions as DimensionScore[],
   
      summary: parsed.summary || '',
      overallSignal: (parsed.overallSignal as OverallSignal) || 'needs_work',
    };
  }
}