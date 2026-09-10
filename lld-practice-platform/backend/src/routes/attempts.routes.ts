import { Router, Request, Response } from 'express';
import { AttemptService } from '../services/AttemptService';
import { SubmissionService } from '../services/SubmissionService';
import { env } from '../config/env';

export function createAttemptsRouter(
  attemptService: AttemptService,
  submissionService: SubmissionService
): Router {
  const router = Router();

  // POST /api/attempts — start a new attempt
  router.post('/', async (req: Request, res: Response) => {
    try {
      const { problemId } = req.body;
      if (!problemId) {
        res.status(400).json({ success: false, error: 'problemId is required' });
        return;
      }
      const attempt = await attemptService.startAttempt(env.demoLearnerId, problemId);
      res.status(201).json({ success: true, data: attempt });
    } catch (err: any) {
      const status = err.message.includes('not found') ? 404 : 500;
      res.status(status).json({ success: false, error: err.message });
    }
  });

  // GET /api/attempts/:id — get attempt state
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const attempt = await attemptService.getAttempt(req.params.id);
      res.json({ success: true, data: attempt });
    } catch (err: any) {
      res.status(404).json({ success: false, error: err.message });
    }
  });

  // POST /api/attempts/:id/submit — submit a solution
  router.post('/:id/submit', async (req: Request, res: Response) => {
    try {
      const { classDiagram, methodSignatures, responsibilities, tradeoffs, rawText } = req.body;
      if (!classDiagram || !methodSignatures || !responsibilities || !tradeoffs) {
        res.status(400).json({
          success: false,
          error: 'classDiagram, methodSignatures, responsibilities, and tradeoffs are all required',
        });
        return;
      }
      const result = await submissionService.submit(req.params.id, {
        classDiagram,
        methodSignatures,
        responsibilities,
        tradeoffs,
        rawText,
      });
      res.json({ success: true, data: result });
    } catch (err: any) {
      const status = err.message.includes('not found') ? 404 : 400;
      res.status(status).json({ success: false, error: err.message });
    }
  });

  // GET /api/attempts/:id/status — poll evaluation status
  router.get('/:id/status', async (req: Request, res: Response) => {
    try {
      const status = await attemptService.getStatus(req.params.id);
      res.json({ success: true, data: status });
    } catch (err: any) {
      res.status(404).json({ success: false, error: err.message });
    }
  });

  // GET /api/attempts/:id/feedback — get feedback once evaluated
  router.get('/:id/feedback', async (req: Request, res: Response) => {
    try {
      const feedback = await attemptService.getFeedback(req.params.id);
      res.json({ success: true, data: feedback });
    } catch (err: any) {
      const status = err.message.includes('not yet evaluated') ? 202 : 404;
      res.status(status).json({ success: false, error: err.message });
    }
  });

  // GET /api/attempts/:id/submission — get what the learner wrote
  router.get('/:id/submission', async (req: Request, res: Response) => {
    try {
      const submission = await attemptService.getSubmission(req.params.id);
      res.json({ success: true, data: submission });
    } catch (err: any) {
      res.status(404).json({ success: false, error: err.message });
    }
  });

  return router;
}
