import { Injectable } from '@angular/core';
import { NormalizedQuestion } from '../models/question.model';

@Injectable({ providedIn: 'root' })
export class LegacyQuizAdapter {
  
  /**
   * Transforma el JSON legacy a la estructura normalizada estricta
   * Asigna IDs sintéticos y adapta el schema.
   */
  normalizeQuestions(legacyQuestions: any[], quizId: string): NormalizedQuestion[] {
    if (!legacyQuestions || !Array.isArray(legacyQuestions)) {
      return [];
    }

    return legacyQuestions.map((lq, index) => {
      const syntheticId = lq.id || `${quizId}_q_${index.toString().padStart(3, '0')}`;
      const type = lq.type || 'mc';
      const prompt = lq.question || lq.prompt || 'Sin pregunta';

      const base = {
        id: syntheticId,
        type,
        prompt,
        explanation: lq.explanation
      };

      if (type === 'mc') {
        return {
          ...base,
          type: 'mc',
          options: lq.options || [],
          correctAnswerIndex: lq.correctAnswerIndex ?? -1
        } as NormalizedQuestion;
      }

      if (type === 'order') {
        return {
          ...base,
          type: 'order',
          options: lq.options || [],
          correctOrder: lq.correctOrder || []
        } as NormalizedQuestion;
      }

      // Default short
      return {
        ...base,
        type: 'short'
      } as NormalizedQuestion;
    });
  }
}
