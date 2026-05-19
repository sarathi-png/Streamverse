import { Router, Request, Response } from 'express';
import { fetchTMDB } from '../utils/tmdb.js';

export const recommendationsRouter = Router();

recommendationsRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const type = (req.query.type as string) || 'movie';
    const endpoint = type === 'tv' ? `/tv/${id}/recommendations` : `/movie/${id}/recommendations`;
    const data = await fetchTMDB(endpoint);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recommendations', message: (err as Error).message });
  }
});
