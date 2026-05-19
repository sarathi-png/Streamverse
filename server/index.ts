import 'dotenv/config';
import path from 'path';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { trendingRouter } from './routes/trending.js';
import { movieRouter } from './routes/movie.js';
import { tvRouter } from './routes/tv.js';
import { searchRouter } from './routes/search.js';
import { playerRouter } from './routes/player.js';
import { recommendationsRouter } from './routes/recommendations.js';
import { discoverRouter } from './routes/discover.js';
import { cacheMiddleware } from './middleware/cache.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json());
app.use(cacheMiddleware);

app.use('/api/trending', trendingRouter);
app.use('/api/movie', movieRouter);
app.use('/api/tv', tvRouter);
app.use('/api/search', searchRouter);
app.use('/api/player', playerRouter);
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/discover', discoverRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Serve built frontend in production
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
});
