import { Show, MediaType } from '@/types';

export interface WatchedItem extends Show {
  currentTime?: number;
  duration?: number;
  lastWatchedTimestamp: number;
  // For TV shows
  seasonNumber?: number;
  episodeNumber?: number;
  durationOfEpisode?: number;
}

const RECENTS_KEY = 'streamverse-recents';
const MAX_RECENTS = 20;

export const getRecents = (): WatchedItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const recentsJson = localStorage.getItem(RECENTS_KEY);
    return recentsJson ? JSON.parse(recentsJson) : [];
  } catch (error) {
    console.error('Error fetching recents from localStorage:', error);
    return [];
  }
};

export const saveRecent = (item: Show, progress?: { currentTime: number; duration: number; seasonNumber?: number; episodeNumber?: number; durationOfEpisode?: number }) => {
  if (typeof window === 'undefined') return;
  try {
    let recents = getRecents();
    const now = Date.now();

    const newItem: WatchedItem = {
      ...item,
      lastWatchedTimestamp: now,
      currentTime: progress?.currentTime,
      duration: progress?.duration,
      ...(item.media_type === MediaType.TV && {
        seasonNumber: progress?.seasonNumber ?? item.number_of_seasons ?? undefined,
        episodeNumber: progress?.episodeNumber ?? item.number_of_episodes ?? undefined,
        durationOfEpisode: progress?.durationOfEpisode,
      }),
    };

    // Remove if item already exists to add it to the top (most recent)
    recents = recents.filter(recent => {
      if (item.media_type === MediaType.TV) {
        return !(recent.id === item.id && recent.seasonNumber === newItem.seasonNumber && recent.episodeNumber === newItem.episodeNumber);
      }
      return recent.id !== item.id;
    });

    recents.unshift(newItem); // Add to the beginning

    if (recents.length > MAX_RECENTS) {
      recents = recents.slice(0, MAX_RECENTS);
    }

    localStorage.setItem(RECENTS_KEY, JSON.stringify(recents));
  } catch (error) {
    console.error('Error saving recent to localStorage:', error);
  }
};
