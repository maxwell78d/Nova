export type QuestionType = 'mc' | 'order' | 'short';

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  explanation?: string;
}

export interface MCQuestion extends BaseQuestion {
  type: 'mc';
  options: string[];
  correctAnswerIndex: number;
}

export interface OrderQuestion extends BaseQuestion {
  type: 'order';
  options: string[];
  correctOrder: string[];
}

export interface ShortQuestion extends BaseQuestion {
  type: 'short';
}

export type NormalizedQuestion = MCQuestion | OrderQuestion | ShortQuestion;
