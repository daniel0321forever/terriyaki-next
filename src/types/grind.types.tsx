import { Task } from "./task.types";

export interface Grind {
    id: number;
    startDate: string;
    duration: number; // in days
    taskToday: Task;
    budget: number;
    progress: ProgressRecord[];
    participants: Participant[];
    quit: boolean;
}

export interface ProgressRecord {
    id: number;
    status: 'completed' | 'missed' | 'upcoming';
    date: string;
}

export interface Participant {
    id: string;
    username: string;
    avatar: string;
    missedDays: number;
    totalPenalty: number;
}