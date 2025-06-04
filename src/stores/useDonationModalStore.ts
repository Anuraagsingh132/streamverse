import { create } from 'zustand';

interface DonationModalState {
  isDonationModalOpen: boolean;
  openDonationModal: () => void;
  closeDonationModal: () => void;
}

export const useDonationModalStore = create<DonationModalState>((set) => ({
  isDonationModalOpen: false,
  openDonationModal: () => set({ isDonationModalOpen: true }),
  closeDonationModal: () => set({ isDonationModalOpen: false }),
}));
