// This is the full lifecycle of one attempt — the order matters:
//
//   in_progress  →  submitted  →  evaluating  →  evaluated
//                                             →  failed  (only if EVERYTHING breaks)


export type AttemptStatus=
|'in_progress'
|'submitted'
|'evaluating'
|'evaluated'
|'failed';




export interface Attempt{
    id:string;
    learnerId:string;//foreign key to the learner who made the attempt.

    problemId:string;//foreign key to the problem being attempted


    status:AttemptStatus;//current status in the state machine



    createdAt:Date;//when attempt started

    submittedAt?:Date | null; //when attempt was submitted for evaluation

    evaluatedAt?:Date | null; //when evaluation completed
}
  