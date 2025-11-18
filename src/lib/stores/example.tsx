import { create } from "zustand";

type CartState = {
  items: any[];
  add: (item: any) => void;
  remove: (id: string) => void;
};

export const useCart = create<CartState>((set) => ({
  items: [],
  add: (item) => set((s) => ({ items: [...s.items, item] })),
  remove: (id) =>
    set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
}));