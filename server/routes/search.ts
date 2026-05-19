import { Router, Request, Response } from 'express';
import { fetchTMDB } from '../utils/tmdb.js';

export const searchRouter = Router();

searchRouter.get('/', async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    const page = (req.query.page as string) || '1';
    if (!query || query.length < 2) {
      res.json({ results: [], total_pages: 0 });
      return;
    }
    const data = await fetchTMDB('/search/multi', { query, page });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Search failed', message: (err as Error).message });
  }
});
