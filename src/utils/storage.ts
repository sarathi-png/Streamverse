import { type MediaType, type Content, type WatchProgress, type IntroMarkers } from '@/types';

const PROGRESS_PREFIX = 'sv_progress_';
const CONTINUE_WATCHING_KEY = 'sv_continue_watching';
const MY_LIST_KEY = 'sv_my_list';
const INTRO_PREFIX = 'sv_intro_';

export function saveProgress(
  id: number,
  mediaType: MediaType,
  data: { currentTime: number; duration: number; progress: number; season?: number; episode?: number }
): void {
  try {
    const key = `${PROGRESS_PREFIX}${mediaType}_${id}`;
    const entry: WatchProgress = {
      id,
      mediaType,
      currentTime: data.currentTime,
      duration: data.duration,
      progress: data.progress,
      lastWatched: Date.now(),
      season: data.season,
      episode: data.episode,
    };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch { /* storage full */ }
}

export function getProgress(id: number, mediaType: MediaType): WatchProgress | null {
  try {
    const key = `${PROGRESS_PREFIX}${mediaType}_${id}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function getContinueWatching(): Content[] {
  try {
    const data = localStorage.getItem(CONTINUE_WATCHING_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addToContinueWatching(item: Content): void {
  try {
    let list = getContinueWatching();
    list = list.filter(i => !(i.id === item.id && i.type === item.type));
    list.unshift(item);
    if (list.length > 20) list = list.slice(0, 20);
    localStorage.setItem(CONTINUE_WATCHING_KEY, JSON.stringify(list));
  } catch { /* ignore */ }
}

export function getMyList(): Content[] {
  try {
    const data = localStorage.getItem(MY_LIST_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function isInMyList(id: number, type: MediaType): boolean {
  return getMyList().some(i => i.id === id && i.type === type);
}

export function toggleMyList(item: Content): boolean {
  const list = getMyList();
  const exists = list.some(i => i.id === item.id && i.type === item.type);
  if (exists) {
    const updated = list.filter(i => !(i.id === item.id && i.type === item.type));
    localStorage.setItem(MY_LIST_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('sv:list:changed'));
    return false;
  } else {
    const updated = [item, ...list].slice(0, 100);
    localStorage.setItem(MY_LIST_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('sv:list:changed'));
    return true;
  }
}

export function getIntroMarkers(tvId: number): IntroMarkers | null {
  try {
    const data = localStorage.getItem(`${INTRO_PREFIX}${tvId}`);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function saveIntroMarkers(tvId: number, markers: IntroMarkers): void {
  if (markers.end <= markers.start) return;
  localStorage.setItem(`${INTRO_PREFIX}${tvId}`, JSON.stringify(markers));
}
