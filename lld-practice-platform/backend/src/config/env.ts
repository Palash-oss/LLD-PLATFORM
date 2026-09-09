// dotenv reads the .env file and puts every key=value pair into process.env
// It must be called before anything reads process.env
import dotenv from 'dotenv'
dotenv.config();


export const env={
    port: parseInt(process.env.PORT||'3001',10),

    // If NODE_ENV is not set, default to 'development'
  nodeEnv: process.env.NODE_ENV || 'development',

 // The SQLite file path. If not set, default to a local file called dev.db
  databaseUrl: process.env.DATABASE_URL || 'file:./dev.db',


   // The Gemini API key. If not set, it's an empty string ''
  geminiApiKey: process.env.GEMINI_API_KEY || '',



  // The demo learner's ID — used since we have no real auth system
  demoLearnerId: process.env.DEMO_LEARNER_ID || 'learner-demo-001',
}as const;

// A derived boolean: is the API key present and non-empty?
// This is used in the AI provider factory to choose Gemini vs MockProvider
// .length > 0 means: the string has at least one character (not empty)
export const hasGeminiKey = env.geminiApiKey.length>0;
