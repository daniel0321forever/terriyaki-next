import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types/user.types";

export const useUserStore = create(
  persist(
    (set) => ({
      user: null as User | null,
      setUser: (user: User) => set({ user }),
    }),
    {
      name: "auth-storage", // unique name for localStorage key
    }
  )
);