import { Injectable, signal, computed } from '@angular/core';
import { NormalizedQuestion } from '../models/question.model';
import { QuizAnswers } from '../models/answer.model';

export type QuizStatus = 'idle' | 'loading' | 'taking' | 'saving' | 'queued' | 'evaluating' | 'completed' | 'review' | 'error';

export interface QuizState {
  quizId: string | null;
  status: QuizStatus;
  questions: NormalizedQuestion[];
  answers: QuizAnswers;
  currentIndex: number;
  sessionId: string | null;
  score: number | null;
  error: string | null;
}

const initialState: QuizState = {
  quizId: null,
  status: 'idle',
  questions: [],
  answers: {},
  currentIndex: 0,
  sessionId: null,
  score: null,
  error: null
};

@Injectable({ providedIn: 'root' })
export class QuizStore {
  // Estado privado inmutable
  private readonly _state = signal<QuizState>(initialState);

  // Selectores computados públicos (Solo lectura)
  readonly state = this._state.asReadonly();
  
  readonly quizId = computed(() => this._state().quizId);
  readonly status = computed(() => this._state().status);
  readonly questions = computed(() => this._state().questions);
  readonly answers = computed(() => this._state().answers);
  readonly currentIndex = computed(() => this._state().currentIndex);
  readonly sessionId = computed(() => this._state().sessionId);
  readonly score = computed(() => this._state().score);
  readonly error = computed(() => this._state().error);

  // Selectores derivados
  readonly currentQuestion = computed(() => {
    const qs = this.questions();
    const idx = this.currentIndex();
    return qs.length > idx ? qs[idx] : null;
  });

  readonly isTaking = computed(() => this.status() === 'taking');
  readonly isReviewing = computed(() => this.status() === 'review');
  readonly isCompleted = computed(() => this.status() === 'completed');
  readonly isEvaluating = computed(() => this.status() === 'evaluating');

  // Mutaciones estrictas (Actions)
  patchState(partial: Partial<QuizState>) {
    this._state.update(state => ({ ...state, ...partial }));
  }

  setAnswer(questionId: string, answer: any) {
    this._state.update(state => ({
      ...state,
      answers: {
        ...state.answers,
        [questionId]: answer
      }
    }));
  }

  reset() {
    this._state.set(initialState);
  }
}
