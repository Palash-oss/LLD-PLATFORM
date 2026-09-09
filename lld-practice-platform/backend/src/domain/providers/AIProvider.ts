
export interface AIProvider {
  generate(prompt: string): Promise<string>;
  // prompt = the text we send to the AI
  // returns Promise<string> = the AI's text response (async, takes time)
}