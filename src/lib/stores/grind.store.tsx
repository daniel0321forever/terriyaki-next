import { Grind, ProgressRecord } from "@/types/grind.types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useGrindStore = create(
    persist(
        (set) => ({
            currentGrind: null,
            setCurrentGrind: (grind: Grind) => set({ currentGrind: grind }),
        }),
        {
            name: "grind-storage", // unique name for localStorage key
        }
    )
);