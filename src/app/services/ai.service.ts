import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private http = inject(HttpClient);

  evaluateExam(message: string): Observable<string> {
    return this.http.post<{ response: string }>('/api/evaluate', { message }).pipe(
      map(res => res.response || '0'),
      catchError(() => of('0'))
    );
  }

  askGroq(message: string, context?: string, history: ChatMessage[] = []): Observable<string> {
    return this.http.post<{ response: string }>('/api/chat', { message, context, history }).pipe(
      map(res => res.response || 'Lo siento, no pude procesar tu mensaje.'),
      catchError(() => of('Error de conexión con la IA.'))
    );
  }
}
