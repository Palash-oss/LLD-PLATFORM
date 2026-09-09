import { AIProvider } from './AIProvider';
// MockProvider = fake AI. Returns a pre-written response instantly.
// Used when:
//   1. GEMINI_API_KEY is not set (offline/dev mode)
//   2. Running tests (tests should never call real APIs)

export class MockProvider implements AIProvider{
     // generate() returns a hardcoded JSON string that looks like real AI output.

  async generate(prompt:string):Promise<string>{
// We don't actually use the prompt — we just return fake data.
    // The _ prefix is a convention: "I know this parameter exists but I'm not using it"

    void prompt;


  return JSON.stringify({
    dimensions:[
         {dimension: 'Responsibility Separation',
          signal: 'acceptable',
          explanation:
            'The design shows reasonable separation of concerns. Consider isolating pricing logic further into a dedicated strategy interface.',
  },  

    { dimension: 'Scalability & Flexibility',
          signal: 'strong',
          explanation:
            'The use of interfaces like PaymentGateway and NotificationService makes the system highly flexible and easy to scale.' },

  { dimension: 'Error Handling',
          signal: 'acceptable',
          explanation:
            'Error handling is present but could be more robust, especially around database operations and external API calls.' },

  { dimension: 'Testing & Extensibility',
          signal: 'strong',
          explanation:
            'Excellent use of dependency injection and interfaces makes this system easy to test and extend.' },

  { dimension: 'Documentation & Clarity',
          signal: 'acceptable',
          explanation:
            'The code is generally clear, but adding Javadoc-style comments for the complex logic would further improve maintainability.' },

],

summary:
        'A reasonable first attempt. The core structure is sound but edge cases and pricing extensibility need more attention.',
      overallSignal: 'solid',});




  }





}












