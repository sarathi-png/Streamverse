import { Router, Request, Response } from 'express';
import { fetchTMDB } from '../utils/tmdb.js';

export const trendingRouter = Router();

trendingRouter.get('/', async (req: Request, res: Response) => {
  try {
    const page = req.query.page || '1';
    const data = await fetchTMDB('/trending/all/week', { page: String(page) });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch trending', message: (err as Error).message });
  }
});
