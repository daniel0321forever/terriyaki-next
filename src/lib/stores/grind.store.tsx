import { Grind } from "@/types/grind.types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type GrindStoreState = {
    currentGrind: Grind | null;
    setCurrentGrind: (grind: Grind | null) => void;
}

export const useGrindStore = create<GrindStoreState>()(
    persist(
        (set) => ({
            currentGrind: null,
            setCurrentGrind: (grind: Grind | null) => set({ currentGrind: grind }),
        }),
        {
            name: "grind-storage", // unique name for localStorage key
        }
    )
);