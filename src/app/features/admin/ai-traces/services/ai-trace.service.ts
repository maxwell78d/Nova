import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AIEvaluationTrace } from '../models/ai-evaluation-trace.model';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AITraceService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/ai-traces';

  // State management for admin panel
  private _traces = signal<AIEvaluationTrace[]>([]);
  readonly traces = this._traces.asReadonly();

  async saveTrace(trace: AIEvaluationTrace): Promise<void> {
    try {
      await firstValueFrom(this.http.post(this.API_URL, trace));
      this._traces.update(t => [trace, ...t]);
    } catch (e) {
      // Fallback: save locally when API unavailable
      this._traces.update(t => [trace, ...t]);
    }
  }

  async getTraceById(id: string): Promise<AIEvaluationTrace> {
    return firstValueFrom(this.http.get<AIEvaluationTrace>(`${this.API_URL}/${id}`));
  }

  async search(filters: any): Promise<AIEvaluationTrace[]> {
    const params = new URLSearchParams(filters).toString();
    const results = await firstValueFrom(this.http.get<AIEvaluationTrace[]>(`${this.API_URL}?${params}`));
    this._traces.set(results);
    return results;
  }

  async reEvaluate(traceId: string): Promise<AIEvaluationTrace> {
    return firstValueFrom(this.http.post<AIEvaluationTrace>(`${this.API_URL}/${traceId}/replay`, {}));
  }

  // Helpers
  getFailedTraces() {
    return this.traces().filter(t => t.status === 'failed');
  }
}
