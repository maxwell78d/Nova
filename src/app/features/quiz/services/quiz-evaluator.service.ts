import { Injectable, inject } from '@angular/core';
import { AiEvaluatorService, AIEvalContext } from './ai-evaluator.service';
import { EvaluationResult, QuizResult } from '../models/quiz-result.model';
import { NormalizedQuestion } from '../models/question.model';
import { QuizAnalyticsService } from './quiz-analytics.service';

@Injectable({ providedIn: 'root' })
export class QuizEvaluatorService {
  private aiEvaluator = inject(AiEvaluatorService);
  private analytics = inject(QuizAnalyticsService);

  async evaluateQuiz(
    quizId: string, 
    submissionId: string, 
    questions: NormalizedQuestion[], 
    answers: Record<string, any>,
    context?: AIEvalContext
  ): Promise<QuizResult> {
    const evaluations: Record<string, EvaluationResult> = {};
    let totalScore = 0;

    const evalPromises = questions.map(q => this.evaluateQuestion(q, answers[q.id], context));
    const evalResults = await Promise.all(evalPromises);

    for (const evalResult of evalResults) {
      evaluations[evalResult.questionId] = evalResult;
      totalScore += evalResult.score;
    }

    const finalScore = questions.length > 0 ? Math.round((totalScore / questions.length) * 100) : 0;

    return {
      quizId,
      submissionId,
      totalScore: finalScore,
      evaluations,
      timestamp: Date.now()
    };
  }

  private async evaluateQuestion(q: NormalizedQuestion, answer: any, context?: AIEvalContext): Promise<EvaluationResult> {
    if (answer === undefined || answer === null) {
      return { questionId: q.id, isCorrect: false, score: 0 };
    }

    if (q.type === 'mc') {
      const isCorrect = answer === q.correctAnswerIndex;
      return { questionId: q.id, isCorrect, score: isCorrect ? 1 : 0 };
    }

    if (q.type === 'order') {
      const isCorrect = JSON.stringify(answer) === JSON.stringify(q.correctOrder);
      return { questionId: q.id, isCorrect, score: isCorrect ? 1 : 0 };
    }

    if (q.type === 'short') {
      try {
        const aiScore = await this.aiEvaluator.evaluate(q.id, q.prompt, answer, q.explanation || '', context);
        return { questionId: q.id, isCorrect: aiScore >= 0.7, score: aiScore, aiEvaluated: true };
      } catch (e) {
        this.analytics.trackEvent('ai_failed', { questionId: q.id });
        return { questionId: q.id, isCorrect: false, score: 0, feedback: 'Error de red en evaluación IA.' };
      }
    }

    return { questionId: (q as any).id, isCorrect: false, score: 0 };
  }
}
