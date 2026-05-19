import { Router, Request, Response } from 'express';
import { fetchTMDB } from '../utils/tmdb.js';

export const movieRouter = Router();

movieRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await fetchTMDB(`/movie/${id}`, { append_to_response: 'credits,videos,recommendations,similar' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch movie', message: (err as Error).message });
  }
});

movieRouter.get('/:id/ratings', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await fetchTMDB(`/movie/${id}/release_dates`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch ratings', message: (err as Error).message });
  }
});

movieRouter.get('/:id/embed', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await fetchTMDB(`/movie/${id}`);
    const embedUrls = {
      vidking: `https://www.vidking.net/embed/movie/${id}?autoplay=1&color=6d28d9`,
      vidsrc: `https://vidsrc-embed.ru/embed/movie?tmdb=${id}&autoplay=1`,
      fallbacks: [
        `https://www.vidking.net/embed/movie/${id}?autoplay=1`,
        `https://vidking1.net/embed/movie/${id}?autoplay=1`,
        `https://vidsrc-embed.su/embed/movie?tmdb=${id}&autoplay=1`,
      ],
    };
    res.json({ ...data, embedUrls });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate embed', message: (err as Error).message });
  }
});
