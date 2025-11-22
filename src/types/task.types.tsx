export interface Task {
    id: number;
    type: 'LeetCode' | 'GRE';
    title: string;
    description: string;
    code: string | null;
    language: string | null;
}