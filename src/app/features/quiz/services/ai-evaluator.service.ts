import { Injectable, inject } from '@angular/core';
import { AiService } from '../../../services/ai.service';
import { firstValueFrom } from 'rxjs';
import { AITraceService } from '../../admin/ai-traces/services/ai-trace.service';
import { AIEvaluationTrace } from '../../admin/ai-traces/models/ai-evaluation-trace.model';

export interface AIEvalContext {
  studentId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  quizId: string;
  quizTitle: string;
  submissionId: string;
}

@Injectable({ providedIn: 'root' })
export class AiEvaluatorService {
  private ai = inject(AiService);
  private traceService = inject(AITraceService);
  private cache = new Map<string, number>();
  private abortControllers = new Map<string, AbortController>();

  async evaluate(
    questionId: string, 
    promptText: string, 
    studentAnswer: string, 
    criteria: string,
    context?: AIEvalContext
  ): Promise<number> {
    const startTime = performance.now();
    const hash = `${questionId}:${btoa(encodeURIComponent(studentAnswer))}`;
    
    if (this.cache.has(hash)) {
      const cachedScore = this.cache.get(hash)!;
      // Generar trace para cache hit
      if (context) {
        const prompt = `Evalúa la respuesta. Pregunta: ${promptText}. Respuesta: ${studentAnswer}. Criterio: ${criteria}. Responde solo un numero del 0 al 10.`;
        this.saveTrace(context, questionId, promptText, studentAnswer, criteria, cachedScore, 'cached', startTime, hash, true, prompt);
      }
      return cachedScore;
    }

    // Cancelar request previo para aislar y evitar race conditions
    if (this.abortControllers.has(questionId)) {
      this.abortControllers.get(questionId)?.abort();
    }

    const controller = new AbortController();
    this.abortControllers.set(questionId, controller);

    try {
      const prompt = `Evalúa la respuesta. Pregunta: ${promptText}. Respuesta: ${studentAnswer}. Criterio: ${criteria}. Responde solo un numero del 0 al 10.`;
      const result = await firstValueFrom(this.ai.evaluateExam(prompt));
      
      if (controller.signal.aborted) throw new Error('Aborted');

      const points = parseFloat((result as any) || '0');
      const normalizedScore = isNaN(points) ? 0 : Math.min(1, Math.max(0, points / 10));
      
      this.cache.set(hash, normalizedScore);
      this.abortControllers.delete(questionId);

      if (context) {
        this.saveTrace(context, questionId, promptText, studentAnswer, criteria, normalizedScore, 'success', startTime, hash, false, prompt, result as string);
      }

      return normalizedScore;
    } catch (e: any) {
      const status = e.message === 'Aborted' ? 'cancelled' : 'failed';
      if (context) {
        this.saveTrace(context, questionId, promptText, studentAnswer, criteria, 0, status, startTime, hash, false, `Pregunta: ${promptText}. Respuesta: ${studentAnswer}. Criterio: ${criteria}.`, '', e.message);
      }
      if (e.message !== 'Aborted') {
        // Error already captured in trace above
      }
      throw e; 
    }
  }

  private saveTrace(
    ctx: AIEvalContext, 
    questionId: string,
    promptText: string,
    studentAnswer: string,
    criteria: string,
    score: number,
    status: 'success' | 'cached' | 'failed' | 'cancelled',
    startTime: number,
    hash: string,
    cacheHit: boolean,
    fullPrompt: string = '',
    rawResponse: string = '',
    error?: string
  ) {
    const trace: AIEvaluationTrace = {
      id: crypto.randomUUID(),
      traceVersion: 1,
      timestamp: Date.now(),
      studentId: ctx.studentId,
      studentName: ctx.studentName,
      courseId: ctx.courseId,
      courseTitle: ctx.courseTitle,
      quizId: ctx.quizId,
      quizTitle: ctx.quizTitle,
      questionId: questionId,
      questionType: 'short',
      questionText: promptText,
      rubric: criteria,
      studentAnswer: studentAnswer,
      promptSystem: 'Evalúa la respuesta. Responde solo un numero del 0 al 10.',
      promptUser: `Pregunta: ${promptText}. Respuesta: ${studentAnswer}. Criterio: ${criteria}.`,
      fullPrompt: fullPrompt,
      rawModelResponse: rawResponse,
      parsedResponse: { score },
      score: score,
      feedback: '', // IA actual no genera feedback detallado, solo score
      model: 'gemini-pro',
      provider: 'google',
      latencyMs: Math.round(performance.now() - startTime),
      cacheHit: cacheHit,
      retryCount: 0,
      submissionId: ctx.submissionId,
      requestHash: hash,
      status: status,
      error: error
    };

    this.traceService.saveTrace(trace);
  }
}
