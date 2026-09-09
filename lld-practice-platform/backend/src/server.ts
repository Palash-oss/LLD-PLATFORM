import { createApp } from './app';
import { env } from './config/env';

const app = createApp();

app.listen(env.port, () => {
  console.log(`\n🚀 LLD Practice Platform Backend`);
  console.log(`   Server running at http://localhost:${env.port}`);
  console.log(`   AI Provider: ${env.geminiApiKey ? 'Gemini' : 'Mock (set GEMINI_API_KEY to use real AI)'}`);
  console.log(`   Environment: ${env.nodeEnv}\n`);
});
