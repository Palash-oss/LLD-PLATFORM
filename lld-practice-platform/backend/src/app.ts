import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

// Repositories
import { ProblemRepository } from './repositories/ProblemRepository';
import { AttemptRepository } from './repositories/AttemptRepository';
import { SubmissionRepository } from './repositories/SubmissionRepository';

// Services
import { ProblemService } from './services/ProblemService';
import { AttemptService } from './services/AttemptService';
import { SubmissionService } from './services/SubmissionService';
import { HistoryService } from './services/HistoryService';

// Evaluators & Providers
import { DeterministicEvaluator } from './domain/evaluation/DeterministicEvaluator';
import { LLMEvaluator } from './domain/evaluation/LLMEvaluator';
import { CompositeEvaluator } from './domain/evaluation/CompositeEvaluator';
import { GeminiProvider } from './domain/providers/GeminiProvider';
import { MockProvider } from './domain/providers/MockProvider';
import { hasGeminiKey } from './config/env';

// Routes
import { createProblemsRouter } from './routes/problems.routes';
import { createAttemptsRouter } from './routes/attempts.routes';
import { createHistoryRouter } from './routes/history.routes';

export function createApp(): Application {
  const app = express();

  // ── Middleware ──────────────────────────────────────────────────────────
  app.use(cors()); // Allow frontend (port 5173) to call backend (port 3001)
  app.use(express.json()); // Parse incoming JSON request bodies

  // ── Wire up dependencies (Dependency Injection) ────────────────────────
  const prisma = new PrismaClient();

  // Repositories
  const problemRepo = new ProblemRepository(prisma);
  const attemptRepo = new AttemptRepository(prisma);
  const submissionRepo = new SubmissionRepository(prisma);

  // AI Provider — use Gemini if API key exists, otherwise use Mock
  const aiProvider = hasGeminiKey ? new GeminiProvider() : new MockProvider();

  // Evaluators
  const deterministicEvaluator = new DeterministicEvaluator();
  const llmEvaluator = new LLMEvaluator(aiProvider);
  const compositeEvaluator = new CompositeEvaluator(deterministicEvaluator, llmEvaluator);

  // Services
  const problemService = new ProblemService(problemRepo);
  const attemptService = new AttemptService(attemptRepo, problemRepo, submissionRepo);
  const submissionService = new SubmissionService(
    attemptRepo,
    submissionRepo,
    problemRepo,
    compositeEvaluator
  );
  const historyService = new HistoryService(attemptRepo, problemRepo);

  // ── Routes ─────────────────────────────────────────────────────────────
  app.use('/api/problems', createProblemsRouter(problemService));
  app.use('/api/attempts', createAttemptsRouter(attemptService, submissionService));
  app.use('/api/learners', createHistoryRouter(historyService));

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', aiProvider: hasGeminiKey ? 'gemini' : 'mock' });
  });

  // ── Global error handler ────────────────────────────────────────────────
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ success: false, error: 'Internal server error' });
  });

  return app;
}
