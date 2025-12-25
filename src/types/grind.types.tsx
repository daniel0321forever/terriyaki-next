import { Task } from "./task.types";

export interface Grind {
    id: string;
    startDate: string;
    duration: number; // in days
    taskToday: Task;
    budget: number;
    progress: ProgressRecord[];
    participants: Participant[];
    quitted: boolean; // true if the grind has been quitted
}

export interface ProgressRecord {
    id: string;
    status: 'completed' | 'missed' | 'pending';
    date: string;
}

export interface Participant {
    id: string;
    username: string;
    avatar: string;
    missedDays: number;
    totalPenalty: number;
}