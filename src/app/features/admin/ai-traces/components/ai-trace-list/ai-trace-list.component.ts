import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AITraceService } from '../../services/ai-trace.service';
import { AIEvaluationTrace } from '../../models/ai-evaluation-trace.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-ai-trace-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  template: `
    <div class="p-4 md:p-8 bg-surface-50 min-h-screen">
      <header class="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div class="flex items-center gap-3">
          <a routerLink="/admin/ai-traces" class="w-10 h-10 bg-surface border border-border-main flex items-center justify-center text-text-muted hover:text-text-main hover:border-primary-300 transition-all shrink-0">
            <mat-icon>arrow_back</mat-icon>
          </a>
          <div>
            <h1 class="text-2xl md:text-3xl font-black text-text-main tracking-tight flex items-center gap-2">
              <mat-icon class="text-purple-600">history</mat-icon>
              AI Evaluation History
            </h1>
            <p class="text-text-muted text-sm">Listado cronológico de todas las evaluaciones procesadas.</p>
          </div>
        </div>
      </header>

      <!-- Filtros -->
      <div class="bg-surface p-6 border border-border-main mb-8 flex flex-wrap gap-4 items-end">
        <div class="flex-1 min-w-[200px]">
          <label class="text-xs font-bold text-text-muted uppercase mb-2 block">Buscar por Alumno/Quiz</label>
          <input 
            type="text" 
            (input)="searchTerm.set($any($event.target).value)"
            placeholder="Nombre, ID o Quiz..." 
            class="w-full px-4 py-2 bg-surface-50 border border-border-main focus:ring-2 focus:ring-primary-500 outline-none transition-all">
        </div>
        <div class="w-40">
          <label class="text-xs font-bold text-text-muted uppercase mb-2 block">Estado</label>
          <select 
            (change)="statusFilter.set($any($event.target).value)"
            class="w-full px-4 py-2 bg-surface-50 border border-border-main focus:ring-2 focus:ring-primary-500 outline-none transition-all text-sm font-bold">
            <option value="all">Todos</option>
            <option value="success">Éxitos</option>
            <option value="cached">Caché</option>
            <option value="failed">Fallidos</option>
            <option value="cancelled">Cancelados</option>
          </select>
        </div>
        <button (click)="refresh()" class="bg-primary-600 text-white px-6 py-2 font-bold flex items-center gap-2 hover:bg-primary-700 transition-all">
          <mat-icon class="text-sm">refresh</mat-icon>
          Actualizar
        </button>
      </div>

      <!-- Tabla -->
      <div class="bg-surface border border-border-main overflow-hidden shadow-sm">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-surface-50 border-b border-border-main">
              <th class="p-4 text-xs font-bold text-zinc-500 uppercase">Timestamp</th>
              <th class="p-4 text-xs font-bold text-zinc-500 uppercase">Alumno</th>
              <th class="p-4 text-xs font-bold text-zinc-500 uppercase">Quiz / Pregunta</th>
              <th class="p-4 text-xs font-bold text-zinc-500 uppercase">Score</th>
              <th class="p-4 text-xs font-bold text-zinc-500 uppercase">Latencia</th>
              <th class="p-4 text-xs font-bold text-zinc-500 uppercase text-center">Status</th>
              <th class="p-4 text-xs font-bold text-zinc-500 uppercase text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-100">
            @for (trace of filteredTraces(); track trace.id) {
              <tr class="hover:bg-zinc-50 transition-colors">
                <td class="p-4">
                  <div class="text-sm font-medium text-zinc-900">{{ trace.timestamp | date:'short' }}</div>
                  <div class="text-xs text-zinc-400">{{ trace.id.slice(0,8) }}...</div>
                </td>
                <td class="p-4">
                  <div class="text-sm font-bold text-zinc-800">{{ trace.studentName }}</div>
                  <div class="text-xs text-zinc-500">ID: {{ trace.studentId }}</div>
                </td>
                <td class="p-4">
                  <div class="text-sm text-zinc-700 truncate max-w-[200px]" [title]="trace.quizTitle">{{ trace.quizTitle }}</div>
                  <div class="text-xs text-zinc-400">QID: {{ trace.questionId }}</div>
                </td>
                <td class="p-4">
                  <div class="text-lg font-black" [class.text-green-600]="trace.score >= 0.7" [class.text-red-600]="trace.score < 0.7">
                    {{ (trace.score * 10).toFixed(1) }}
                  </div>
                </td>
                <td class="p-4 text-sm text-zinc-500">
                  {{ trace.latencyMs }}ms 
                  @if (trace.cacheHit) { <span class="ml-1 px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold">CACHE</span> }
                </td>
                <td class="p-4 text-center">
                  <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase"
                    [class.bg-green-100]="trace.status === 'success'" [class.text-green-700]="trace.status === 'success'"
                    [class.bg-blue-100]="trace.status === 'cached'" [class.text-blue-700]="trace.status === 'cached'"
                    [class.bg-red-100]="trace.status === 'failed'" [class.text-red-700]="trace.status === 'failed'"
                    [class.bg-zinc-100]="trace.status === 'cancelled'" [class.text-zinc-600]="trace.status === 'cancelled'">
                    {{ trace.status }}
                  </span>
                </td>
                <td class="p-4 text-right">
                  <button [routerLink]="['/admin/ai-traces', trace.id]" class="text-purple-600 hover:text-purple-800 font-bold text-sm">
                    Ver detalle
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7" class="p-20 text-center text-zinc-400">
                  <mat-icon class="text-5xl mb-4 opacity-20">search_off</mat-icon>
                  <p>No se encontraron trazas de evaluación.</p>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class AITraceListComponent {
  private traceService = inject(AITraceService);
  
  searchTerm = signal('');
  statusFilter = signal('all');

  filteredTraces = computed(() => {
    const all = this.traceService.traces();
    const search = this.searchTerm().toLowerCase();
    const status = this.statusFilter();

    return all.filter(t => {
      const matchSearch = !search || 
        t.studentName?.toLowerCase().includes(search) || 
        t.quizTitle?.toLowerCase().includes(search) || 
        t.questionId.includes(search);
      
      const matchStatus = status === 'all' || t.status === status;

      return matchSearch && matchStatus;
    });
  });

  refresh() {
    this.traceService.search({});
  }
}
