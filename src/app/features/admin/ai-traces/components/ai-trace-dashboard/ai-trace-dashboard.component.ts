import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AITraceService } from '../../services/ai-trace.service';
import { ChatLogService } from '../../../../../services/chat-log.service';
import { RouterLink } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, map } from 'rxjs';

@Component({
  selector: 'app-ai-trace-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink, AsyncPipe],
  template: `
    <div class="p-4 md:p-8 bg-surface-50 min-h-screen">
      <header class="mb-8 md:mb-10">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div class="flex items-center gap-3">
            <a routerLink="/admin" class="w-10 h-10 bg-surface border border-border-main flex items-center justify-center text-text-muted hover:text-text-main hover:border-primary-300 transition-all shrink-0">
              <mat-icon>arrow_back</mat-icon>
            </a>
            <div>
              <h1 class="text-2xl md:text-3xl font-black text-text-main tracking-tight flex items-center gap-2">
                <mat-icon class="text-purple-600">dashboard</mat-icon>
                AI Performance Analytics
              </h1>
              <p class="text-text-muted text-sm">Métricas en tiempo real de la infraestructura de evaluación con IA.</p>
            </div>
          </div>
          <div class="flex gap-4">
            <!-- Buscador de Alumnos -->
            <div class="relative w-64 hidden md:block">
              <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">search</mat-icon>
              <input type="text" 
                     (input)="filterText.set($any($event.target).value)"
                     class="w-full pl-9 pr-4 py-2 bg-white border border-border-main outline-none focus:ring-2 focus:ring-primary-500 font-bold text-xs" 
                     placeholder="Filtrar alumno por nombre...">
            </div>
            <button routerLink="/admin/ai-traces/history" class="bg-surface-900 text-white px-5 py-2 font-bold flex items-center gap-2 hover:bg-surface-800 transition-all text-sm">
              <mat-icon>list</mat-icon>
              Historial
            </button>
          </div>
        </div>
      </header>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Score Distribution -->
        <div class="lg:col-span-2 bg-white p-8 border border-border-main shadow-premium">
          <h3 class="text-xl font-black text-text-main mb-8 flex items-center gap-3 uppercase tracking-tight">
            <mat-icon class="text-primary-600">analytics</mat-icon>
            Score Distribution & Quality
          </h3>
          <div class="space-y-8">
            @for (bucket of stats().scoreBuckets; track bucket.label) {
              <div>
                <div class="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                  <span class="text-text-muted">{{ bucket.label }}</span>
                  <span class="text-text-main">{{ bucket.count }} evaluaciones</span>
                </div>
                <div class="w-full bg-surface-100 h-6 overflow-hidden border border-border-main">
                  <div 
                    class="h-full transition-all duration-1000 bg-gradient-to-r flex items-center justify-end px-3" 
                    [class]="bucket.color"
                    [style.width.%]="(bucket.count / stats().total) * 100 || 0">
                    <span class="text-[9px] font-black text-white">{{ Math.round((bucket.count / stats().total) * 100) }}%</span>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Chatbot Conversation Monitor (New Section) -->
          <div class="mt-12 pt-8 border-t border-border-main">
            <h3 class="text-xl font-black text-text-main mb-6 flex items-center gap-3 uppercase tracking-tight">
              <mat-icon class="text-green-600">chat</mat-icon>
              Chatbot Live Monitor (Conversaciones Reales)
            </h3>
            <div class="bg-surface-50 border border-border-main p-6">
              <div class="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                @for (chat of filteredChats() | async; track chat.id) {
                  <div class="p-4 bg-white border border-border-main flex justify-between items-start group hover:border-primary-600 transition-all cursor-pointer"
                       (click)="expandedChat.set(expandedChat() === chat.id ? null : chat.id)">
                    <div class="flex items-start gap-4 w-full">
                      <div class="w-10 h-10 bg-primary-50 text-primary-700 flex items-center justify-center font-black text-xs border border-primary-100 shrink-0">
                        {{ chat.userName.charAt(0) }}
                      </div>
                      <div class="flex flex-col w-full">
                        <div class="flex justify-between items-center w-full">
                          <span class="text-[10px] font-black text-text-main uppercase tracking-widest">{{ chat.userName }}</span>
                          <span class="text-[9px] font-black text-primary-600 bg-primary-50 px-2 py-0.5 uppercase tracking-widest border border-primary-100">Hoy</span>
                        </div>
                        <p class="text-sm font-medium text-text-main mt-1 italic line-clamp-2" [class.line-clamp-none]="expandedChat() === chat.id">"{{ chat.message }}"</p>
                        
                        @if (expandedChat() === chat.id) {
                          <div class="mt-4 p-4 bg-surface-50 border-l-4 border-primary-500 animate-in slide-in-from-left-2">
                            <p class="text-[10px] font-black text-primary-700 uppercase tracking-widest mb-2 flex items-center gap-2">
                              <mat-icon class="text-xs">smart_toy</mat-icon> Respuesta IA
                            </p>
                            <p class="text-sm text-text-main leading-relaxed">{{ chat.response }}</p>
                          </div>
                        } @else {
                          <p class="text-xs text-text-muted mt-2 truncate max-w-md opacity-60">{{ chat.response }}</p>
                        }
                      </div>
                    </div>
                  </div>
                } @empty {
                  <div class="text-center py-12">
                    <mat-icon class="text-surface-300 text-5xl mb-3">chat_bubble_outline</mat-icon>
                    <p class="text-text-muted text-xs font-black uppercase tracking-widest">Esperando primeras conversaciones...</p>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- Infrastructure & Cost -->
        <div class="space-y-8">
          <div class="bg-white p-8 border border-border-main shadow-premium">
            <h3 class="text-lg font-black text-text-main mb-6 flex items-center gap-2 uppercase tracking-tight">
              <mat-icon class="text-text-muted">health_and_safety</mat-icon>
              Infra Health
            </h3>
            <div class="grid grid-cols-1 gap-4">
              <div class="p-6 bg-red-50 border border-red-100">
                <p class="text-[10px] font-black text-red-600 uppercase mb-2 tracking-widest">Failed Requests</p>
                <div class="text-3xl font-black text-red-700">{{ stats().failed }}</div>
                <p class="text-[9px] text-red-500 mt-2 font-bold">GEMINI_API_ERROR / TIMEOUT</p>
              </div>
              <div class="p-6 bg-surface-50 border border-border-main">
                <p class="text-[10px] font-black text-text-muted uppercase mb-2 tracking-widest">Canceled (Navigation)</p>
                <div class="text-3xl font-black text-text-main">{{ stats().cancelled }}</div>
                <p class="text-[9px] text-text-muted mt-2 font-bold italic">User exited before completion</p>
              </div>
            </div>
          </div>

          <div class="bg-primary-900 p-8 border border-primary-800 text-white shadow-premium">
            <h4 class="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
              <mat-icon class="text-primary-400">savings</mat-icon> Cost Analysis
            </h4>
            <div class="text-3xl font-black mb-2">{{ stats().cached }} <span class="text-sm font-normal text-primary-300">Calls Saved</span></div>
            <p class="text-xs text-primary-200 leading-relaxed font-medium">
              La optimización por caché ha reducido los costes operativos en un <strong>{{ stats().cacheRatio }}%</strong> este mes.
            </p>
            <div class="mt-6 pt-6 border-t border-primary-700">
              <div class="flex justify-between items-center">
                <span class="text-[10px] font-black uppercase tracking-widest">Projected Savings</span>
                <span class="text-green-400 font-black">$42.50 USD</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AITraceDashboardComponent {
  private traceService = inject(AITraceService);
  private chatLogService = inject(ChatLogService);

  filterText = signal('');
  expandedChat = signal<string | null | undefined>(null);
  recentChats = this.chatLogService.getRecentChats(100); 

  filteredChats = computed(() => {
    const term = this.filterText().toLowerCase();
    return this.recentChats.pipe(
      map(chats => chats.filter(c => 
        c.userName.toLowerCase().includes(term) || 
        c.message.toLowerCase().includes(term)
      ))
    );
  });

  stats = computed(() => {
    const traces = this.traceService.traces();
    const total = traces.length || 1;
    const success = traces.filter(t => t.status === 'success' || t.status === 'cached').length;
    const cached = traces.filter(t => t.status === 'cached').length;
    const failed = traces.filter(t => t.status === 'failed').length;
    const cancelled = traces.filter(t => t.status === 'cancelled').length;
    
    const latencies = traces.filter(t => !t.cacheHit && t.latencyMs > 0).map(t => t.latencyMs);
    const avgLatency = latencies.length > 0 
      ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) 
      : 0;

    // Buckets para distribución de scores
    const scores = traces.map(t => t.score);
    const scoreBuckets = [
      { label: 'Perfecto (10)', count: scores.filter(s => s === 1).length, color: 'from-green-400 to-green-600' },
      { label: 'Bueno (7-9)', count: scores.filter(s => s >= 0.7 && s < 1).length, color: 'from-blue-400 to-blue-600' },
      { label: 'Regular (4-6)', count: scores.filter(s => s >= 0.4 && s < 0.7).length, color: 'from-yellow-400 to-yellow-600' },
      { label: 'Insuficiente (0-3)', count: scores.filter(s => s < 0.4).length, color: 'from-red-400 to-red-600' }
    ];

    return {
      total: traces.length,
      success,
      cached,
      failed,
      cancelled,
      avgLatency,
      successRate: Math.round((success / total) * 100),
      cacheRatio: Math.round((cached / total) * 100),
      scoreBuckets
    };
  });

  protected Math = Math;
}
