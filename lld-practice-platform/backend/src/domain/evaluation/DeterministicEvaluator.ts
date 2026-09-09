// The rule-based evaluator. It does zero AI calls — just plain TypeScript logic. It checks:

// Did the learner mention all expected class names in their classDesign?
// Did they mention any expected design pattern keywords?
// Is the tradeoffs field non-empty?
// Is classDesign long enough to be meaningful?


import { Evaluator } from "./Evaluator";


import { Submission } from '../entities/Submission';
import { Rubric } from '../entities/Problem';
import { EvaluationResult } from './EvaluationResult';
import { DeterministicCheck, OverallSignal } from '../entities/Feedback';




























