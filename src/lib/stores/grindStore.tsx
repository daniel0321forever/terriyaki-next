import { create } from "zustand";
import { Grind, DayProgress } from "@/types/grind.types";
import { Task } from "@/types/task.types";
import { MOCK_GRINDS } from "@/data/mockData";

type GrindState = {
  grinds: Grind[];
  addGrind: (grind: Omit<Grind, "id" | "progress" | "participants" | "currentUser" | "startDate" | "endDate">) => Grind;
  getGrindById: (id: number) => Grind | undefined;
  initialize: () => void;
};

// Helper function to generate date strings
const formatDate = (date: Date): string => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[date.getMonth()]} ${date.getDate()}`;
};

// Helper function to generate progress array
const generateProgress = (duration: number, startDate: Date): DayProgress[] => {
  return Array.from({ length: duration }, (_, i): DayProgress => {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    return {
      day: i + 1,
      status: 'upcoming',
      date: formatDate(currentDate),
    };
  });
};

export const useGrindStore = create<GrindState>((set, get) => ({
  grinds: [],
  
  initialize: () => {
    const state = get();
    // Only initialize if store is empty
    if (state.grinds.length === 0) {
      set({ grinds: MOCK_GRINDS });
    }
  },

  addGrind: (grindData) => {
    const state = get();
    const newId = state.grinds.length > 0 
      ? Math.max(...state.grinds.map(g => g.id)) + 1 
      : 1;
    
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + grindData.duration);
    
    const newGrind: Grind = {
      id: newId,
      title: grindData.title,
      description: `${grindData.duration} days | NT ${grindData.duration * grindData.punishment.initialPrice}`,
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      duration: grindData.duration,
      taskToday: grindData.taskToday,
      punishment: grindData.punishment,
      autoRenew: grindData.autoRenew,
      weeklyTest: grindData.weeklyTest,
      progress: generateProgress(grindData.duration, startDate),
      participants: [],
      currentUser: {
        missedDays: 0,
        totalPenalty: 0,
        avatar: "/api/placeholder/48/48"
      },
    };

    set((state) => ({
      grinds: [...state.grinds, newGrind],
    }));

    return newGrind;
  },

  getGrindById: (id: number) => {
    const state = get();
    return state.grinds.find(grind => grind.id === id);
  },
}));

