export interface InterviewEvaluation {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export interface InterviewMessage {
  role: 'user' | 'agent';
  message: string;
  source: string;
}