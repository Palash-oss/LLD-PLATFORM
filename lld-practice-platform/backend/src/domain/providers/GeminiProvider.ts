import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider } from './AIProvider';
import { env } from '../../config/env';



export class GeminiProvider implements AIProvider{
    private model: ReturnType<InstanceType<typeof GoogleGenerativeAI>['getGenerativeModel']>;



   constructor(){
    const genAI=new GoogleGenerativeAI(env.geminiApiKey);

    this.model = genAI.getGenerativeModel({model:"gemini-2.0-flash-exp"})
   }

async generate(prompt: string): Promise<string> {
    // Send the prompt to Gemini and wait for the response
    // generateContent() returns a complex object — we unwrap it step by step
    const result = await this.model.generateContent(prompt);
   
    const text = result.response.text();
    return text;
  }

}



























