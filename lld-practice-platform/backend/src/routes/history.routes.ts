import { Router, Request, Response } from 'express';
import { HistoryService } from '../services/HistoryService';

export function createHistoryRouter(historyService: HistoryService): Router {
  const router = Router();

  // GET /api/learners/:id/history — all attempts by a learner
  router.get('/:learnerId/history', async (req: Request, res: Response) => {
    try {
      const history = await historyService.getLearnerHistory(req.params.learnerId);
      res.json({ success: true, data: history });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET /api/learners/:id/history/:problemId — attempts for one problem
  router.get('/:learnerId/history/:problemId', async (req: Request, res: Response) => {
    try {
      const history = await historyService.getHistoryForProblem(
        req.params.learnerId,
        req.params.problemId
      );
      res.json({ success: true, data: history });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  return router;
}
