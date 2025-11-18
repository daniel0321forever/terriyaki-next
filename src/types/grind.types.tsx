import { Task } from "./task.types";

export interface Grind {
    id: number;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    duration: number; // in days
    taskToday: Task;
    punishment: {
        dailyRate: number;
        initialPrice: number;
    };
    autoRenew: boolean;
    weeklyTest: boolean;
    progress: DayProgress[];
    participants: Participant[];
    currentUser: {
        missedDays: number;
        totalPenalty: number;
        avatar: string;
    };
}

export interface DayProgress {
    day: number;
    status: 'completed' | 'missed' | 'upcoming';
    date: string;
}

export interface Participant {
    id: number;
    name: string;
    avatar: string;
    missedDays: number;
    totalPenalty: number;
}