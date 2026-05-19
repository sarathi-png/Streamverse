import { Router, Request, Response } from 'express';
import { fetchTMDB } from '../utils/tmdb.js';

export const tvRouter = Router();

tvRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await fetchTMDB(`/tv/${id}`, { append_to_response: 'credits,videos,recommendations,similar' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch TV show', message: (err as Error).message });
  }
});

tvRouter.get('/:id/ratings', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await fetchTMDB(`/tv/${id}/content_ratings`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch ratings', message: (err as Error).message });
  }
});

tvRouter.get('/:id/season/:season', async (req: Request, res: Response) => {
  try {
    const { id, season } = req.params;
    const data = await fetchTMDB(`/tv/${id}/season/${season}`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch season', message: (err as Error).message });
  }
});
