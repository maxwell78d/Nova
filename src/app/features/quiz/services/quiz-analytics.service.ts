import { Injectable } from '@angular/core';

export type QuizEvent = 'quiz_started' | 'question_answered' | 'quiz_abandoned' | 'quiz_completed' | 'ai_failed';

@Injectable({ providedIn: 'root' })
export class QuizAnalyticsService {
  private sentEvents = new Set<string>();

  trackEvent(event: QuizEvent, payload?: any) {
    if (event === 'question_answered' && payload?.questionId && payload?.sessionId) {
      const key = `${payload.sessionId}_${payload.questionId}`;
      if (this.sentEvents.has(key)) return;
      this.sentEvents.add(key);
    }

    // In production: POST to /api/analytics
  }

  reset() {
    this.sentEvents.clear();
  }
}
