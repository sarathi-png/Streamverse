import { Request, Response } from 'express';
import NodeCache from 'node-cache';

const responseCache = new NodeCache({ stdTTL: 60, maxKeys: 100 });

export function cacheMiddleware(req: Request, res: Response, next: () => void) {
  if (req.method !== 'GET') {
    next();
    return;
  }

  const key = req.originalUrl;
  const cached = responseCache.get(key);
  if (cached) {
    res.json(cached);
    return;
  }

  const originalJson = res.json.bind(res);
  res.json = (body: unknown) => {
    responseCache.set(key, body);
    return originalJson(body);
  };
  next();
}
