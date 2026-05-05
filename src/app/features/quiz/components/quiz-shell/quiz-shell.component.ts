import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { QuizStore } from '../../state/quiz.store';
import { QuizEngineService } from '../../services/quiz-engine.service';
import { QuestionRendererComponent } from '../question-renderer/question-renderer.component';
import { LegacyQuizAdapter } from '../../services/legacy-quiz-adapter.service';
import { QuizSessionLockService } from '../../services/quiz-session-lock.service';

@Component({
  selector: 'app-quiz-shell',
  standalone: true,
  imports: [CommonModule, MatIconModule, QuestionRendererComponent],
  template: `
    <!-- Manejo de sesión conflictiva -->
    @if (conflictDetected()) {
      <div class="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
        <div class="flex">
          <mat-icon class="text-red-500 mr-3">warning</mat-icon>
          <div>
            <h3 class="text-red-800 font-black">Sesión duplicada</h3>
            <p class="text-red-700">Has abierto este examen en otra pestaña. Por seguridad, esta sesión ha sido pausada.</p>
          </div>
        </div>
      </div>
    } @else {

      <!-- Recuperación de progreso guardado -->
      @if (showRecoveryModal()) {
        <div class="bg-blue-50 border-l-4 border-primary-600 p-4 mb-8">
          <div class="flex">
            <mat-icon class="text-primary-600 mr-3">restore</mat-icon>
            <div>
              <h3 class="text-primary-800 font-black">Examen en progreso encontrado</h3>
              <p class="text-primary-700 mb-3">Tienes un intento guardado localmente.</p>
              <div class="flex gap-3">
                <button (click)="resumeQuiz()" class="bg-primary-600 text-white px-4 py-1 shadow-sm text-sm font-black uppercase tracking-widest">Continuar examen</button>
                <button (click)="discardAndStart()" class="text-primary-800 underline text-sm font-black uppercase tracking-widest">Descartar y reiniciar</button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- UI del Examen Activo -->
      @if (store.status() === 'taking' || store.status() === 'review') {
        <div class="bg-white border border-border-main shadow-premium mb-8 p-8 animate-in fade-in zoom-in-95">
          <!-- Header -->
          <div class="flex justify-between items-center mb-8 border-b border-border-main pb-4">
            <h3 class="text-2xl font-black text-text-main flex items-center gap-3 uppercase tracking-tight">
              <mat-icon class="text-primary-600">
                {{ store.status() === 'review' ? 'visibility' : 'quiz' }}
              </mat-icon>
              @if (store.status() === 'review') { <span>Revisión: </span> }
              {{ quizTitle }}
            </h3>
            @if (store.status() === 'review') {
              <button (click)="closeReview()" class="text-text-muted hover:text-text-main transition-colors">
                <mat-icon>close</mat-icon>
              </button>
            }
          </div>

          <!-- Progress Bar -->
          <div class="flex justify-between items-center mb-8 text-[10px] text-text-muted font-black uppercase tracking-widest">
            <span>Pregunta {{ store.currentIndex() + 1 }} de {{ store.questions().length }}</span>
            <div class="w-1/2 bg-surface-100 h-2 overflow-hidden border border-border-main">
              <div class="bg-primary-600 h-full transition-all duration-500" [style.width.%]="progressPercent()"></div>
            </div>
          </div>

          <!-- Body -->
          @if (store.currentQuestion(); as q) {
            <div [id]="'q-container-' + store.currentIndex()" class="animate-in fade-in duration-300">
              <app-question-renderer
                [question]="q"
                [currentAnswer]="currentAnswer()"
                [isReviewMode]="store.status() === 'review'"
                (answerChange)="onAnswerChange($event)"
                (intentionalChange)="onIntentionalChange()">
              </app-question-renderer>
            </div>
          }

          <!-- Footer / Navegación -->
          <div class="mt-12 flex justify-between gap-4 border-t border-border-main pt-8">
            @if (store.currentIndex() > 0) {
              <button 
                (click)="goPrevious()"
                class="bg-surface border border-border-main hover:bg-surface-100 text-text-main px-8 py-3 font-black text-xs uppercase tracking-widest transition-all">
                Anterior
              </button>
            } @else { <div></div> }

            <div class="flex gap-3">
              @if (store.currentIndex() < store.questions().length - 1) {
                <button 
                  [disabled]="!canGoNext() && store.status() !== 'review'"
                  (click)="goNext()"
                  class="bg-primary-600 hover:bg-primary-700 disabled:bg-surface-300 disabled:cursor-not-allowed text-white px-8 py-3 font-black text-xs uppercase tracking-widest transition-all">
                  Siguiente
                </button>
              } @else if (store.status() === 'taking') {
                <button 
                  [disabled]="!canGoNext() || isSubmitting()"
                  (click)="submit()"
                  class="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-10 py-3 font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3">
                  @if (isSubmitting()) {
                    <div class="w-4 h-4 border-2 border-white border-t-transparent animate-spin"></div>
                    <span>Evaluando</span>
                  } @else {
                    <mat-icon class="text-[18px] w-[18px] h-[18px]">check_circle</mat-icon>
                    <span>Finalizar Examen</span>
                  }
                </button>
              } @else if (store.status() === 'review') {
                <button 
                  (click)="closeReview()"
                  class="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 font-black text-xs uppercase tracking-widest transition-all">
                  Cerrar Revisión
                </button>
              }
            </div>
          </div>
        </div>
      }

      <!-- Modal Queued / Error Offline -->
      @if (store.status() === 'queued') {
        <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-8">
          <div class="flex">
            <mat-icon class="text-yellow-500 mr-3">cloud_off</mat-icon>
            <div>
              <h3 class="text-yellow-800 font-bold">Modo sin conexión</h3>
              <p class="text-yellow-700 mb-3">{{ store.error() }}</p>
              <button (click)="submit()" class="bg-yellow-600 text-white px-4 py-1 rounded shadow-sm text-sm font-bold">Reintentar</button>
            </div>
          </div>
        </div>
      }
    }
  `
})
export class QuizShellComponent implements OnInit, OnDestroy, OnChanges {
  // Inputs compatibility for migration
  @Input({ required: true }) courseId!: string;
  @Input({ required: true }) quizId!: string;
  @Input({ required: true }) courseTitle!: string;
  @Input({ required: true }) quizTitle!: string;
  @Input({ required: true }) legacyQuestions: any[] = [];
  
  // Dependencies
  public store = inject(QuizStore);
  private engine = inject(QuizEngineService);
  private adapter = inject(LegacyQuizAdapter);
  private lockService = inject(QuizSessionLockService).conflictDetected;

  // Local state
  hasConflict = signal(false);
  conflictDetected = computed(() => this.hasConflict());
  hasSavedState = false;
  savedStatePayload: any = null;
  private lockSub?: Subscription;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['quizId'] || changes['legacyQuestions']) {
      const qId = changes['quizId']?.currentValue || this.quizId;
      if (qId) {
        console.log(`[QuizShell] Detectado cambio de Quiz a: ${qId}. Reiniciando motor...`);
        this.discardAndStart();
      }
    }
  }

  ngOnInit() {
    this.lockSub = this.lockService.subscribe(() => {
      this.hasConflict.set(true);
    });

    const saved = this.engine.checkSavedProgress();
    if (saved && saved.quizId === this.quizId && saved.status === 'taking') {
      this.hasSavedState = true;
      this.savedStatePayload = saved;
    } else {
      this.discardAndStart();
    }

  }

  ngOnDestroy() {
    this.engine.cleanup();
    if (this.lockSub) {
      this.lockSub.unsubscribe();
    }
  }

  showRecoveryModal() {
    return this.hasSavedState && this.store.status() === 'idle';
  }

  resumeQuiz() {
    this.hasSavedState = false;
    this.engine.resumeQuiz(this.savedStatePayload);
  }

  discardAndStart() {
    this.hasSavedState = false;
    this.engine.discardProgress();
    const normalized = this.adapter.normalizeQuestions(this.legacyQuestions, this.quizId);
    this.engine.startQuiz(this.quizId, normalized);
  }

  // Bindings para el template
  progressPercent = computed(() => {
    const total = this.store.questions().length || 1;
    return ((this.store.currentIndex() + 1) / total) * 100;
  });

  currentAnswer = computed(() => {
    const q = this.store.currentQuestion();
    return q ? this.store.answers()[q.id] : undefined;
  });

  canGoNext(): boolean {
    const q = this.store.currentQuestion();
    const a = this.currentAnswer();
    if (!q) return false;

    if (q.type === 'mc') return a !== undefined;
    if (q.type === 'order') return Array.isArray(a) && a.length === q.options.length;
    if (q.type === 'short') return typeof a === 'string' && a.trim().length > 10;
    
    return false;
  }

  isSubmitting = computed(() => this.store.status() === 'evaluating');

  // Acciones
  onAnswerChange(answer: any) {
    this.engine.saveCurrentAnswer(answer);
  }

  onIntentionalChange() {
    const q = this.store.currentQuestion();
    if (q) {
      this.engine.trackQuestionAnswered(q.id);
    }
  }

  goNext() { 
    this.onIntentionalChange(); // Track before moving
    this.engine.goNext();
  }
  
  goPrevious() { this.engine.goPrevious(); }
  
  submit() {
    this.onIntentionalChange(); // Track the last question before submitting
    this.engine.submitQuiz(this.courseId, this.courseTitle, this.quizTitle);
  }

  closeReview() {
    // Si queremos cerrar, simplemente desmontamos el shell o reseteamos.
    // Como el CourseDetail maneja si se muestra el shell, aquí podemos limpiar
    // y emitir un evento, o simplemente reiniciar.
    this.store.patchState({ status: 'idle' });
  }
}
