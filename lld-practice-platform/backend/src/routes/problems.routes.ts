import { Router, Request, Response } from 'express';
import { ProblemService } from '../services/ProblemService';

export function createProblemsRouter(problemService: ProblemService): Router {
  const router = Router();

  // GET /api/problems — list all problems
  router.get('/', async (_req: Request, res: Response) => {
    try {
      const problems = await problemService.getAllProblems();
      res.json({ success: true, data: problems });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // GET /api/problems/:slug — get one problem by slug
  router.get('/:slug', async (req: Request, res: Response) => {
    try {
      const problem = await problemService.getProblemBySlug(req.params.slug);
      res.json({ success: true, data: problem });
    } catch (err: any) {
      const status = err.message.includes('not found') ? 404 : 500;
      res.status(status).json({ success: false, error: err.message });
    }
  });

  return router;
}
