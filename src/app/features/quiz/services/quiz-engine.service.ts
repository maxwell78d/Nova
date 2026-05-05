import { Injectable, inject } from '@angular/core';
import { QuizStore } from '../state/quiz.store';
import { QuizStorageService } from './quiz-storage.service';
import { QuizSessionLockService } from './quiz-session-lock.service';
import { QuizAnalyticsService } from './quiz-analytics.service';
import { QuizEvaluatorService } from './quiz-evaluator.service';
import { NormalizedQuestion } from '../models/question.model';
import { AuthService } from '../../../services/auth.service';

@Injectable({ providedIn: 'root' })
export class QuizEngineService {
  private store = inject(QuizStore);
  private storage = inject(QuizStorageService);
  private lock = inject(QuizSessionLockService);
  private analytics = inject(QuizAnalyticsService);
  private evaluator = inject(QuizEvaluatorService);
  private auth = inject(AuthService);

  private currentSubmissionId: string | null = null;

  startQuiz(quizId: string, questions: NormalizedQuestion[]) {
    this.lock.acquireLock(quizId);
    this.store.reset();
    this.store.patchState({
      quizId,
      status: 'taking',
      questions,
      currentIndex: 0,
      sessionId: crypto.randomUUID()
    });
    this.analytics.reset();
    this.analytics.trackEvent('quiz_started', { quizId });
    this.persistTick();
  }

  resumeQuiz(state: any) {
    this.store.patchState(state);
    this.lock.acquireLock(state.quizId);
  }

  checkSavedProgress() {
    return this.storage.loadState();
  }

  discardProgress() {
    this.storage.clear();
  }

  saveCurrentAnswer(answer: any) {
    if (this.store.isReviewing()) return;
    const q = this.store.currentQuestion();
    if (q) {
      this.store.setAnswer(q.id, answer);
      this.persistTick();
    }
  }

  trackQuestionAnswered(questionId: string) {
    const sessionId = this.store.sessionId();
    if (sessionId) {
      this.analytics.trackEvent('question_answered', { questionId, sessionId });
    }
  }

  goNext() {
    const idx = this.store.currentIndex();
    if (idx < this.store.questions().length - 1) {
      this.store.patchState({ currentIndex: idx + 1 });
      this.persistTick();
    }
  }

  goPrevious() {
    const idx = this.store.currentIndex();
    if (idx > 0) {
      this.store.patchState({ currentIndex: idx - 1 });
      this.persistTick();
    }
  }

  async submitQuiz(courseId: string, courseTitle: string, quizTitle: string) {
    const state = this.store.state();
    if (state.status === 'evaluating' || state.status === 'saving' || state.status === 'completed') return;

    this.currentSubmissionId = crypto.randomUUID();
    this.store.patchState({ status: 'evaluating' });

    const user = this.auth.currentUser();
    const context = {
      studentId: user?.id || 'anonymous',
      studentName: user?.name || 'Anónimo',
      courseId,
      courseTitle,
      quizId: state.quizId!,
      quizTitle,
      submissionId: this.currentSubmissionId
    };

    try {
      const result = await this.evaluator.evaluateQuiz(
        state.quizId!, 
        this.currentSubmissionId, 
        state.questions, 
        state.answers,
        context
      );

      // Server-side validation persistence
      this.auth.saveQuizGrade(courseId, state.quizId!, result.totalScore);
      
      this.store.patchState({ status: 'completed', score: result.totalScore });
      this.storage.clear(); // Limpiamos persistencia si terminó
      this.analytics.trackEvent('quiz_completed', { quizId: state.quizId, score: result.totalScore });
    } catch (e) {
      this.store.patchState({ status: 'queued', error: 'Fallo de conexión. Intentando de nuevo...' });
      this.persistTick();
    }
  }

  enterReviewMode() {
    this.store.patchState({ status: 'review' });
  }

  private persistTick() {
    if (this.store.status() !== 'completed' && this.store.status() !== 'review') {
      this.storage.saveState(this.store.state());
    }
  }

  cleanup() {
    this.lock.releaseLock();
    this.store.reset();
  }
}
