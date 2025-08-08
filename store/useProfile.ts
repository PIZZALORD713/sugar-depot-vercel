import { create } from "zustand";
import { persist } from "zustand/middleware";

type State = {
  address?: string;
  ens?: string;
  favorites: Record<string, true>;
  setAddress: (a?: string) => void;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
};

export const useProfile = create<State>()(
  persist(
    (set, get) => ({
      address: undefined,
      ens: undefined,
      favorites: {},
      setAddress: (a) => set({ address: a }),
      toggleFavorite: (id) =>
        set((s) => {
          const copy = { ...s.favorites };
          if (copy[id]) delete copy[id];
          else copy[id] = true;
          return { favorites: copy };
        }),
      isFavorite: (id) => !!get().favorites[id],
    }),
    { name: "profile" }
  )
);
