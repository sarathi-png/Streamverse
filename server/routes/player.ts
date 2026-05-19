import { Router, Request, Response } from 'express';

export const playerRouter = Router();

const VIDKING_DOMAINS = [
  'www.vidking.net',
  'vidking1.net',
  'vidking2.net',
  'vidking3.net',
  'vidking.net',
];

const VIDSRC_DOMAINS = [
  'vidsrc-embed.ru',
  'vidsrc-embed.su',
  'vidsrcme.su',
  'vsrc.su',
];

playerRouter.get('/movie/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const color = (req.query.color as string) || '6d28d9';
    const autoplay = req.query.autoplay !== '0';

    const vidkingUrls = VIDKING_DOMAINS.map(d =>
      `https://${d}/embed/movie/${id}?autoplay=${autoplay ? '1' : '0'}&color=${color}`
    );

    const vidsrcUrls = VIDSRC_DOMAINS.map(d =>
      `https://${d}/embed/movie?tmdb=${id}&autoplay=${autoplay ? '1' : '0'}`
    );

    res.json({
      tmdbId: Number(id),
      type: 'movie',
      vidking: vidkingUrls[0],
      vidsrc: vidsrcUrls[0],
      providers: {
        vidking: vidkingUrls,
        vidsrc: vidsrcUrls,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate player URL', message: (err as Error).message });
  }
});

playerRouter.get('/tv/:id/:season/:episode', (req: Request, res: Response) => {
  try {
    const { id, season, episode } = req.params;
    const color = (req.query.color as string) || '6d28d9';
    const autoplay = req.query.autoplay !== '0';

    const vidkingUrls = VIDKING_DOMAINS.map(d =>
      `https://${d}/embed/tv/${id}/${season}/${episode}?autoplay=${autoplay ? '1' : '0'}&color=${color}&nextEpisode=true&episodeSelector=true`
    );

    const vidsrcUrls = VIDSRC_DOMAINS.map(d =>
      `https://${d}/embed/tv?tmdb=${id}&season=${season}&episode=${episode}&autoplay=${autoplay ? '1' : '0'}&autonext=1`
    );

    res.json({
      tmdbId: Number(id),
      type: 'tv',
      season: Number(season),
      episode: Number(episode),
      vidking: vidkingUrls[0],
      vidsrc: vidsrcUrls[0],
      providers: {
        vidking: vidkingUrls,
        vidsrc: vidsrcUrls,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate player URL', message: (err as Error).message });
  }
});
