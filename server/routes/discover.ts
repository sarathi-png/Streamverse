import { Router, Request, Response } from 'express';
import { fetchTMDB } from '../utils/tmdb.js';

export const discoverRouter = Router();

discoverRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { type = 'movie', genre, language, year, page = '1', sort_by = 'popularity.desc', translations } = req.query;
    const params: Record<string, string> = { page: String(page), sort_by: String(sort_by) };

    if (genre) {
      const genreStr = String(genre);
      params.with_genres = genreStr;
    }
    if (language) params.with_original_language = String(language);
    if (translations) params.with_translations = String(translations);
    if (year) {
      const yearStr = String(year);
      const endpointType = String(type) as 'movie' | 'tv';
      if (endpointType === 'movie') {
        params.primary_release_year = yearStr;
      } else {
        params.first_air_date_year = yearStr;
      }
    }

    const data = await fetchTMDB(`/discover/${type}`, params);
    res.json(data);
  } catch (err) {
    console.error('[Discover] TMDB error:', (err as Error).message);
    res.status(500).json({ error: 'Failed to discover content', message: (err as Error).message });
  }
});
