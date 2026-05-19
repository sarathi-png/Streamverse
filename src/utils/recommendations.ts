import type { Content } from '@/types';
import { getContinueWatching } from './storage';

export interface UserPreferences {
  preferredDecades: number[];
  preferredTypes: ('movie' | 'tv')[];
  completionRate: number;
}

export function analyzePreferences(): UserPreferences {
  const watching = getContinueWatching();
  const decades: Record<number, number> = {};
  const types: Record<string, number> = {};

  watching.forEach(item => {
    const decade = Math.floor((item.year || 2024) / 10) * 10;
    decades[decade] = (decades[decade] || 0) + 1;
    types[item.type] = (types[item.type] || 0) + 1;
  });

  return {
    preferredDecades: Object.entries(decades)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([d]) => parseInt(d)),
    preferredTypes: Object.entries(types)
      .sort(([, a], [, b]) => b - a)
      .map(([t]) => t as 'movie' | 'tv'),
    completionRate: 0,
  };
}

export function getSmartRecommendations(
  allItems: Content[],
  watchHistory: Content[],
  limit = 20
): Content[] {
  if (allItems.length === 0) return [];

  const historyIds = new Set(watchHistory.map(h => `${h.type}-${h.id}`));
  const seen = new Set<string>();
  const result: Content[] = [];

  for (const item of allItems) {
    const key = `${item.type}-${item.id}`;
    if (historyIds.has(key)) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
    if (result.length >= limit) break;
  }

  return result;
}

export function getForYouContent(trending: Content[], watchHistory: Content[]): Content[] {
  return getSmartRecommendations(trending, watchHistory, 16);
}

export function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
