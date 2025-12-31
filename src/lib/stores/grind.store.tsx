import { Grind } from "@/types/grind.types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type GrindStoreState = {
    grinds: { [key: string]: Grind };
    setGrinds: (grinds: { [key: string]: Grind }) => void;
    addGrind: (grind: Grind) => void;
}

export const useGrindStore = create<GrindStoreState>()(
    persist(
        (set) => ({
            grinds: {},
            setGrinds: (grinds: { [key: string]: Grind }) => set({ grinds }),
            addGrind: (grind: Grind) =>
                set((state) => ({
                    grinds: {
                        ...state.grinds,
                        [grind.id]: grind,
                    },
                })),
        }),
        {
            name: "grind-storage", // unique name for localStorage key
        }
    )
);