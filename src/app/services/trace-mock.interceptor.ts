import { HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { of, delay } from 'rxjs';
import { AIEvaluationTrace } from '../features/admin/ai-traces/models/ai-evaluation-trace.model';

const traces: AIEvaluationTrace[] = [];

export function traceMockInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const { url, method, body } = req;

  if (url.startsWith('/api/ai-traces')) {
    // POST /api/ai-traces (Save)
    if (method === 'POST' && !url.includes('/replay')) {
      const trace = body as AIEvaluationTrace;
      traces.unshift(trace);
      try {
        localStorage.setItem('mock_ai_traces', JSON.stringify(traces));
      } catch (e) {}
      return of(new HttpResponse({ status: 200, body: trace })).pipe(delay(300));
    }

    // GET /api/ai-traces (List)
    if (method === 'GET' && url === '/api/ai-traces') {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('mock_ai_traces') : null;
      const data = stored ? JSON.parse(stored) : traces;
      return of(new HttpResponse({ status: 200, body: data })).pipe(delay(500));
    }

    // GET /api/ai-traces/:id (Detail)
    const detailMatch = url.match(/\/api\/ai-traces\/([a-zA-Z0-9-]+)$/);
    if (method === 'GET' && detailMatch) {
      const id = detailMatch[1];
      const stored = typeof window !== 'undefined' ? localStorage.getItem('mock_ai_traces') : null;
      const currentTraces: AIEvaluationTrace[] = stored ? JSON.parse(stored) : traces;
      const trace = currentTraces.find(t => t.id === id);
      if (trace) {
        return of(new HttpResponse({ status: 200, body: trace })).pipe(delay(200));
      }
      return of(new HttpResponse({ status: 404, body: { error: 'Not found' } }));
    }

    // POST /api/ai-traces/:id/replay
    if (method === 'POST' && url.includes('/replay')) {
      const detailMatch = url.match(/\/api\/ai-traces\/([a-zA-Z0-9-]+)\/replay$/);
      if (detailMatch) {
        const id = detailMatch[1];
        const stored = typeof window !== 'undefined' ? localStorage.getItem('mock_ai_traces') : null;
        const currentTraces: AIEvaluationTrace[] = stored ? JSON.parse(stored) : traces;
        const parentTrace = currentTraces.find(t => t.id === id);
        
        if (parentTrace) {
          const newTrace: AIEvaluationTrace = {
            ...parentTrace,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            status: 'success', 
            cacheHit: false,
            parentTraceId: parentTrace.id,
            latencyMs: 1200 + Math.round(Math.random() * 500)
          };
          currentTraces.unshift(newTrace);
          localStorage.setItem('mock_ai_traces', JSON.stringify(currentTraces));
          return of(new HttpResponse({ status: 200, body: newTrace })).pipe(delay(1000));
        }
      }
      return of(new HttpResponse({ status: 404 }));
    }
  }

  return next(req);
}
