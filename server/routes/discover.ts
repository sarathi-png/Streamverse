import { Router, Request, Response } from 'express';
import { fetchTMDB } from '../utils/tmdb.js';

export const discoverRouter = Router();

const DUBBED_REGION_MAP: Record<string, string> = {
  hi: 'IN',
  es: 'MX',
  fr: 'FR',
  ja: 'JP',
  ko: 'KR',
  de: 'DE',
  it: 'IT',
  pt: 'BR',
  ru: 'RU',
  zh: 'CN',
  ar: 'AE',
  tr: 'TR',
  ta: 'IN',
  te: 'IN',
};

const NON_ENGLISH_LANG_CODES = 'ja|ko|zh|hi|es|fr|de|it|pt|ru|ar|tr|ta|te';

discoverRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { type = 'movie', genre, language, year, dubbed, adult, page = '1', sort_by = 'popularity.desc' } = req.query;
    const params: Record<string, string> = { page: String(page), sort_by: String(sort_by) };

    if (genre) {
      const genreStr = String(genre);
      params.with_genres = genreStr;
    }
    if (language && !dubbed) {
      params.with_original_language = String(language);
    }
    if (year) {
      const yearStr = String(year);
      const endpointType = String(type) as 'movie' | 'tv';
      if (endpointType === 'movie') {
        params.primary_release_year = yearStr;
      } else {
        params.first_air_date_year = yearStr;
      }
    }

    if (dubbed) {
      const dubbedStr = String(dubbed);
      if (dubbedStr === 'en') {
        params.with_original_language = NON_ENGLISH_LANG_CODES;
        params.watch_region = 'US';
      } else {
        params.with_original_language = 'en';
        const region = DUBBED_REGION_MAP[dubbedStr];
        if (region) {
          params.watch_region = region;
        }
      }
      params.with_watch_monetization_types = 'flatrate|rent|buy';
    }

    if (adult === 'true') {
      params.include_adult = 'true';
    }

    const data = await fetchTMDB(`/discover/${type}`, params);
    res.json(data);
  } catch (err) {
    console.error('[Discover] TMDB error:', (err as Error).message);
    res.status(500).json({ error: 'Failed to discover content', message: (err as Error).message });
  }
});
