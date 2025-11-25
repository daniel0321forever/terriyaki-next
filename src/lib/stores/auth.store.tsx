import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types/user.types";

export type UserStoreState = {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useUserStore = create<UserStoreState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user: User | null) => set({ user }),
    }),
    {
      name: "auth-storage", // unique name for localStorage key
    }
  )
);