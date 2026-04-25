import { create } from 'zustand';

interface ModalState {
  play: boolean;
  setPlay: (play: boolean) => void;
  currentlyPlayingEpisodeId: number | null;
  setCurrentlyPlayingEpisodeId: (episodeId: number | null) => void;
  reset: () => void;
}

export const useModalStore = create<ModalState>()((set) => ({
  play: false,
  setPlay: (play: boolean) => set(() => ({ play })),
  currentlyPlayingEpisodeId: null,
  setCurrentlyPlayingEpisodeId: (episodeId) => set(() => ({ currentlyPlayingEpisodeId: episodeId })),
  reset: () =>
    set(() => ({
      play: false,
      currentlyPlayingEpisodeId: null,
    })),
}));
