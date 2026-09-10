import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider } from './AIProvider';
import { env } from '../../config/env';

export class GeminiProvider implements AIProvider {
  private genAI: GoogleGenerativeAI;
  private primaryModelName: string = 'gemini-3.6-flash';

  constructor() {
    this.genAI = new GoogleGenerativeAI(env.geminiApiKey);
  }

  async generate(prompt: string): Promise<string> {
    const modelsToTry = [this.primaryModelName, 'gemini-2.5-flash', 'gemini-1.5-flash-latest'];
    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        const model = this.genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        if (text) return text;
      } catch (err) {
        lastError = err;
        console.warn(`Gemini model ${modelName} failed, trying fallback model...`);
      }
    }

    throw lastError || new Error('All Gemini models failed');
  }
}
