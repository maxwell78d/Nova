import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AITraceService } from '../../services/ai-trace.service';
import { UiService } from '../../../../../services/ui.service';
import { AIEvaluationTrace } from '../../models/ai-evaluation-trace.model';

@Component({
  selector: 'app-ai-trace-detail',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  template: `
    <div class="p-4 md:p-8 bg-surface-50 min-h-screen">
      <header class="mb-8 md:mb-10">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div class="flex items-center gap-3">
            <a routerLink="/admin/ai-traces/history" class="w-10 h-10 bg-surface border border-border-main flex items-center justify-center text-text-muted hover:text-text-main hover:border-primary-300 transition-all shrink-0">
              <mat-icon>arrow_back</mat-icon>
            </a>
            <div>
              <h1 class="text-2xl md:text-3xl font-black text-text-main tracking-tight flex items-center gap-2">
                <mat-icon class="text-purple-600">history</mat-icon>
                Detalle de Evaluación IA
              </h1>
              <p class="text-text-muted text-sm">Análisis exhaustivo del proceso de calificación realizado por la IA.</p>
            </div>
          </div>
        </div>
      </header>

      @if (trace(); as t) {
        <div class="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
          
          <!-- Header Card -->
          <div class="bg-white border border-border-main p-6 md:p-8 flex flex-col md:flex-row justify-between items-start gap-6">
            <div>
              <div class="flex items-center gap-3 mb-2">
                <span class="px-3 py-1 text-[10px] font-black uppercase tracking-widest"
                  [class.bg-green-100]="t.status === 'success'" [class.text-green-700]="t.status === 'success'"
                  [class.bg-blue-100]="t.status === 'cached'" [class.text-blue-700]="t.status === 'cached'"
                  [class.bg-red-100]="t.status === 'failed'" [class.text-red-700]="t.status === 'failed'">
                  {{ t.status }}
                </span>
                <span class="text-xs text-text-muted font-mono">UUID: {{ t.id }}</span>
              </div>
              <h2 class="text-3xl font-black text-text-main leading-tight">
                Evaluación de {{ t.studentName }}
              </h2>
              <p class="text-text-muted mt-1">{{ t.timestamp | date:'full' }}</p>
            </div>
            
            <div class="text-left md:text-right w-full md:w-auto">
              <div class="text-xs font-bold text-text-muted uppercase mb-1">Resultado de Calificación</div>
              <div class="text-5xl font-black" [class.text-green-600]="t.score >= 0.7" [class.text-red-600]="t.score < 0.7">
                {{ (t.score * 10).toFixed(1) }}<span class="text-lg text-text-muted/30">/10</span>
              </div>
              <button 
                (click)="replay()" 
                [disabled]="isReplaying()"
                class="mt-4 w-full md:w-auto bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white px-6 py-2 font-bold flex items-center justify-center gap-2 transition-all">
                @if (isReplaying()) {
                  <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                } @else {
                  <mat-icon class="text-sm">replay</mat-icon>
                }
                Re-evaluar Traza
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-zinc-900">
            <!-- Left: Metadata & Context -->
            <div class="space-y-8">
              <section class="bg-white p-6 border border-border-main">
                <h3 class="text-xs font-black text-text-muted uppercase mb-4 tracking-widest">Metadata Context</h3>
                <div class="space-y-4">
                  <div>
                    <p class="text-[10px] font-bold text-text-muted uppercase">Estudiante</p>
                    <p class="text-sm font-bold">{{ t.studentName }}</p>
                    <p class="text-[10px] text-text-muted font-mono">{{ t.studentId }}</p>
                  </div>
                  <div>
                    <p class="text-[10px] font-bold text-text-muted uppercase">Curso</p>
                    <p class="text-sm font-bold">{{ t.courseTitle }}</p>
                  </div>
                  <div>
                    <p class="text-[10px] font-bold text-text-muted uppercase">Quiz</p>
                    <p class="text-sm font-bold">{{ t.quizTitle }}</p>
                  </div>
                </div>
              </section>

              <section class="bg-white p-6 border border-border-main">
                <h3 class="text-xs font-black text-text-muted uppercase mb-4 tracking-widest">Technical details</h3>
                <div class="space-y-3 text-xs">
                  <div class="flex justify-between">
                    <span class="text-text-muted">Provider</span>
                    <span class="font-bold">{{ t.provider }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-text-muted">Model</span>
                    <span class="font-bold">{{ t.model }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-text-muted">Latency</span>
                    <span class="font-bold">{{ t.latencyMs }}ms</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-text-muted">Cache Hit</span>
                    <span class="font-bold" [class.text-blue-600]="t.cacheHit">{{ t.cacheHit }}</span>
                  </div>
                </div>
              </section>
            </div>

            <!-- Center & Right: Content -->
            <div class="md:col-span-2 space-y-8">
              <!-- Question & Answer -->
              <section class="bg-white border border-border-main overflow-hidden">
                <div class="p-6 border-b border-border-main bg-surface-50/50">
                  <h3 class="text-sm font-black text-text-main uppercase">Evaluation Content</h3>
                </div>
                <div class="p-8 space-y-6">
                  <div>
                    <p class="text-[10px] font-bold text-text-muted uppercase mb-2">Pregunta Original</p>
                    <div class="p-4 bg-surface-50 border border-border-main text-text-muted italic">
                      {{ t.questionText }}
                    </div>
                  </div>
                  <div>
                    <p class="text-[10px] font-bold text-text-muted uppercase mb-2">Respuesta del Alumno</p>
                    <div class="p-4 bg-primary-50 border border-primary-100 text-primary-900 font-medium">
                      {{ t.studentAnswer }}
                    </div>
                  </div>
                  <div>
                    <p class="text-[10px] font-bold text-text-muted uppercase mb-2">Rúbrica / Criterio</p>
                    <div class="p-4 bg-surface-50 border border-border-main text-text-muted text-sm">
                      {{ t.rubric }}
                    </div>
                  </div>
                </div>
              </section>

              <!-- Prompt Debugging -->
              <section class="bg-surface-900 overflow-hidden">
                <div class="p-4 border-b border-white/10 flex justify-between items-center">
                  <h3 class="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <div class="w-2 h-2 bg-blue-500"></div>
                    System Prompt
                  </h3>
                  <span class="text-[10px] text-zinc-500 font-mono">v{{ t.traceVersion }}</span>
                </div>
                <div class="p-6">
                  <pre class="text-blue-400 text-xs whitespace-pre-wrap font-mono leading-relaxed">{{ t.fullPrompt }}</pre>
                </div>
              </section>

              <!-- Model Response -->
              <section class="bg-surface-900 overflow-hidden">
                <div class="p-4 border-b border-white/10 flex justify-between items-center">
                  <h3 class="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <div class="w-2 h-2 bg-green-500"></div>
                    AI Model Response
                  </h3>
                </div>
                <div class="p-6">
                  <pre class="text-green-400 text-xs whitespace-pre-wrap font-mono leading-relaxed">{{ t.rawModelResponse }}</pre>
                </div>
              </section>

              @if (t.error) {
                <section class="bg-red-50 p-6 border-2 border-red-200">
                  <h3 class="text-red-800 font-bold flex items-center gap-2 mb-2">
                    <mat-icon>error</mat-icon> Trace Error
                  </h3>
                  <p class="text-red-700 font-mono text-sm">{{ t.error }}</p>
                </section>
              }
            </div>
          </div>
        </div>
      } @else {
        <div class="flex items-center justify-center py-20">
          <div class="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    </div>
  `
})
export class AITraceDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private traceService = inject(AITraceService);
  private ui = inject(UiService);
  
  trace = signal<AIEvaluationTrace | null>(null);
  isReplaying = signal(false);

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      try {
        const data = await this.traceService.getTraceById(id);
        this.trace.set(data);
      } catch (e) {
        // Trace not found — handled by template
      }
    }
  }

  async replay() {
    if (!this.trace()) return;
    this.isReplaying.set(true);
    try {
      await this.traceService.reEvaluate(this.trace()!.id);
      this.ui.success('Re-evaluación enviada correctamente. Se generará una nueva traza.');
    } catch (e) {
      this.ui.error('Error al re-evaluar. Intente de nuevo.');
    } finally {
      this.isReplaying.set(false);
    }
  }
}
