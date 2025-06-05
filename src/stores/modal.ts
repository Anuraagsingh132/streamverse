import type { Show } from '@/types';
import { create } from 'zustand';

interface ModalState {
  open: boolean;
  setOpen: (open: boolean) => void;
  firstLoad: boolean;
  show: Show | null;
  setShow: (show: Show | null) => void;
  openModal: (show: Show) => void;
  play: boolean;
  setPlay: (play: boolean) => void;
  currentlyPlayingEpisodeId: number | null;
  setCurrentlyPlayingEpisodeId: (episodeId: number | null) => void;
  reset: () => void;
}

export const useModalStore = create<ModalState>()((set) => ({
  open: false,
  setOpen: (open: boolean) => set(() => ({ open })),
  firstLoad: false,
  setFirstLoad: (firstLoad: boolean) => set(() => ({ firstLoad })),
  show: null,
  setShow: (show: Show | null) => set(() => ({ show })),
  openModal: (show: Show) => set(() => ({ show, open: true, firstLoad: true })),
  play: false,
  setPlay: (play: boolean) => set(() => ({ play })),
  currentlyPlayingEpisodeId: null,
  setCurrentlyPlayingEpisodeId: (episodeId) => set(() => ({ currentlyPlayingEpisodeId: episodeId })),
  reset: () =>
    set(() => ({
      show: null,
      open: false,
      play: false,
      firstLoad: false,
      currentlyPlayingEpisodeId: null,
    })),
}));
