export interface EvaluationResult {
  questionId: string;
  isCorrect: boolean;
  score: number; // Normalizado 0 a 1
  feedback?: string;
  aiEvaluated?: boolean;
}

export interface QuizResult {
  quizId: string;
  submissionId: string;
  totalScore: number;
  evaluations: Record<string, EvaluationResult>;
  timestamp: number;
}
