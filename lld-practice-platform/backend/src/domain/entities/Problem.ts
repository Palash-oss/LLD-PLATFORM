export interface Problem{
    id:string,  //unique identifier we use string as Prisma uses cuid() a helper functyion to generate unique id
     


    title:string; //Design problem heading eg:Parking lot System


    slug:string //url version title eg: parking-lot used in api routes to do GET

    statement:string; //The main text of the problem


    functionalRequirements:string[]; //these are what:WHAT THE SYSTEM MUST DO EG:[["Support multiple vehicle types", "Issue a ticket on entry", ...]]



    nonFunctionalRequirements:string[]; //these are how well: HOW THE SYSTEM MUST BEHAVE EG:[["Highly available system", "Low latency", ...]]



    difficulty:'easy'|'medium' |'hard'; //Difficulty level of the problem any one of these

    rubric?:Rubric;//Rubric defined below optional as there is no rubric for any problem



    createdAt:Date;//The datetime when this problem was first created 



    updatedAt:Date;//The datetime when this problem was last update

}

//Rubric
//The per-problem evaluation criteria. This is what makes feedback SPECIFIC
//to each problem instead of generic "is your design good?" checks.
// DeterministicEvaluator uses expectedClasses + expectedPatterns.
// LLMEvaluator uses dimensions to build its prompt.



export interface Rubric{
    id:string;

    problemId:string;//every problem has at most one rubric 

    expectedClasses:string[]; //expected class names,empty means any classes are fine


    expectedPatterns:string[]//expected design patterns,empty means any patterns are fine

    dimensions:RubricDimension[];
      // The axes the LLM will score feedback against.
  // Each dimension = one aspect of design quality.
  // LLMEvaluator sends these to Gemini and gets back a score per dimension.



    
}


export interface RubricDimension{
    name:string;//dimension name,e.g. "Object-Oriented Design"

    description:string;//description of what this dimension means in the context of the problem, tells the LLM what to look for.
}