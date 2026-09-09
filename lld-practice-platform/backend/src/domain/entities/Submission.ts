// Submission = the learner's actual answer to a problem.
// It belongs to exactly ONE Attempt (linked via attemptId).
// One Attempt → One Submission → One Feedback (after evaluation)

export interface Submission{
    id:string;

    attemptId:string; // Foreign key — links this Submission to exactly one Attempt

    classDesign:string;
     // The structural answer: class names, fields, method signatures, relationships
  // e.g. "class Vehicle { licensePlate: string; type: VehicleType }
  //        class ParkingSpot { spotId: string; isOccupied: boolean }
  //        class ParkingLot { allocateSpot(v: Vehicle): ParkingSpot }"
  // This is what DeterministicEvaluator scans for expected class names



  responsibilities:string,
  // The learner's explanation of WHY they split responsibilities this way
  // e.g. "PricingStrategy is separate from ParkingSpot because pricing logic
  //        can change (hourly, flat rate, premium) without touching spot allocation"
  // This separates "I drew boxes" from "I understand WHY the boxes are there"



  tradeoffs:string;
   // The learner's explanation of design trade-offs
  // e.g. "I used a Queue for pending vehicles (balance between latency and memory)
  //        instead of a simple array to handle bursts"
  // This shows design maturity: understanding that every design has compromises


 rawText: string; //any extra thoughts leaners has to right can put in here



 createdAt:Date;

}



//data transfer object what user is going to send and not what DB stores
export interface CreateSubmissionInput {
  classDesign: string;       // Required — must not be empty
  responsibilities: string;  // Required — must not be empty
  tradeoffs: string;         // Required — must not be empty (enforced in service)
  rawText?: string;          // Optional — '?' means this field can be missing
}