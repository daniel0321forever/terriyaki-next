export interface Task {
    id: string;
    type: 'LeetCode' | 'GRE';
    title: string;
    description: string;
    url: string;
    code: string | null;
    language: string | null;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    topicTags: string[];
}