import { create } from 'zustand';

export const useNavigation = create<{
  close: () => void;
  opened: boolean;
  toggle: () => void;
}>((set) => ({
  close: () => set({ opened: false }),
  opened: false,
  toggle: () => set((state) => ({ opened: !state.opened })),
}));
