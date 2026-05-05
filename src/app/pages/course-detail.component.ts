import { Component, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseService } from '../services/course.service';
import { AuthService } from '../services/auth.service';
import { AiService } from '../services/ai.service';
import { UiStateService } from '../services/ui-state.service';
import { Course, Lesson } from '../models/types';
import { MatIconModule } from '@angular/material/icon';
import { SafePipe } from '../pipes/safe.pipe';
import { QuizShellComponent } from '../features/quiz/components/quiz-shell/quiz-shell.component';
import { ActivityTrackerService } from '../services/activity-tracker.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, SafePipe, FormsModule, QuizShellComponent],
  template: `
    @if (course()) {
      <div class="bg-surface-50 min-h-screen">
        <!-- Academic Premium Header -->
        <div class="bg-surface border-b border-border-main pt-12 pb-24 relative overflow-hidden">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div class="flex flex-col md:flex-row gap-12 items-center">
              
              <div class="w-full md:w-3/5">
                <!-- Botón para volver atrás dinámicamente -->
                <button (click)="goBack()" class="inline-flex items-center gap-2 text-text-muted hover:text-primary-600 mb-8 transition-colors text-sm font-bold cursor-pointer">
                  <mat-icon class="text-[18px] w-[18px] h-[18px]">arrow_back</mat-icon> Volver al catálogo
                </button>
                
                <div class="flex gap-3 mb-6">
                  <span class="px-4 py-1.5 bg-primary-50 text-primary-700 rounded-full text-xs font-black uppercase tracking-widest border border-primary-100">
                    {{ course()?.level }}
                  </span>
                  <span class="px-4 py-1.5 bg-surface-100 text-text-muted rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1 border border-border-main">
                    <mat-icon class="text-[14px] w-[14px] h-[14px]">schedule</mat-icon> {{ course()?.duration }}
                  </span>
                </div>
                
                <h1 class="text-4xl md:text-6xl font-black text-text-main tracking-tight mb-6 leading-tight">
                  {{ course()?.title }}
                </h1>
                
                <p class="text-xl text-text-muted leading-relaxed font-medium mb-8 max-w-2xl">
                  {{ course()?.shortDescription }}
                </p>

                <div class="flex items-center gap-6">
                  <div class="flex -space-x-4">
                    <img class="w-12 h-12 rounded-full border-2 border-surface shadow-sm" src="https://i.pravatar.cc/100?img=1" alt="Student">
                    <img class="w-12 h-12 rounded-full border-2 border-surface shadow-sm" src="https://i.pravatar.cc/100?img=2" alt="Student">
                    <img class="w-12 h-12 rounded-full border-2 border-surface shadow-sm" src="https://i.pravatar.cc/100?img=3" alt="Student">
                    <div class="w-12 h-12 rounded-full border-2 border-surface bg-surface-100 flex items-center justify-center text-xs font-bold text-text-muted shadow-sm">+2k</div>
                  </div>
                  <div class="text-sm">
                    <p class="font-bold text-text-main flex items-center gap-1">
                      <mat-icon class="text-yellow-400 text-[18px] w-[18px] h-[18px]">star</mat-icon>
                      <mat-icon class="text-yellow-400 text-[18px] w-[18px] h-[18px]">star</mat-icon>
                      <mat-icon class="text-yellow-400 text-[18px] w-[18px] h-[18px]">star</mat-icon>
                      <mat-icon class="text-yellow-400 text-[18px] w-[18px] h-[18px]">star</mat-icon>
                      <mat-icon class="text-yellow-400 text-[18px] w-[18px] h-[18px]">star_half</mat-icon>
                      <span class="ml-1">4.8</span>
                    </p>
                    <p class="text-text-muted">Valoración promedio</p>
                  </div>
                </div>
              </div>
              
              <div class="w-full md:w-2/5">
                <!-- Espacio reservado para balance visual en el header -->
              </div>

            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10 md:-mt-12">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
            
            <div class="md:col-span-2">
              @if (!isEnrolled()) {
                <!-- Tabs Header -->
                <div class="flex gap-8 border-b border-border-main mb-8">
                  <button 
                    (click)="activeTab.set('overview')"
                    [class.border-primary-600]="activeTab() === 'overview'"
                    [class.text-primary-600]="activeTab() === 'overview'"
                    [class.border-transparent]="activeTab() !== 'overview'"
                    [class.text-text-muted]="activeTab() !== 'overview'"
                    class="pb-4 font-bold text-lg border-b-2 hover:text-primary-600 transition-colors">
                    Descripción general
                  </button>
                  <button 
                    (click)="activeTab.set('curriculum')"
                    [class.border-primary-600]="activeTab() === 'curriculum'"
                    [class.text-primary-600]="activeTab() === 'curriculum'"
                    [class.border-transparent]="activeTab() !== 'curriculum'"
                    [class.text-text-muted]="activeTab() !== 'curriculum'"
                    class="pb-4 font-bold text-lg border-b-2 hover:text-primary-600 transition-colors">
                    Plan de estudios
                  </button>
                </div>
              }

              <!-- Tab Content: Overview -->
              @if (activeTab() === 'overview' || isEnrolled()) {
                <div class="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 mb-12">
                  <section>
                    <h2 class="text-2xl font-black text-text-main mb-4 uppercase tracking-tight">Acerca de este curso</h2>
                    <p class="text-text-muted leading-relaxed text-lg font-medium">{{ course()?.fullDescription }}</p>
                  </section>

                  @if (course()?.learningObjectives?.length) {
                    <section class="bg-surface p-8 border border-border-main">
                      <h2 class="text-2xl font-black text-text-main mb-6 uppercase tracking-tight">Lo que aprenderás</h2>
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        @for (objective of course()?.learningObjectives; track $index) {
                          <div class="flex items-start gap-3">
                            <mat-icon class="text-green-500 shrink-0">check</mat-icon>
                            <span class="text-text-main font-medium">{{ objective }}</span>
                          </div>
                        }
                      </div>
                    </section>
                  }
                </div>
              }

              <!-- Tab Content: Curriculum -->
              @if (activeTab() === 'curriculum' || isEnrolled()) {
                <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  
                  <!-- Selected Lesson Content -->
                  @if (selectedLesson()) {
                    <div id="lesson-viewer" class="scroll-mt-24">
                    @if (selectedLesson()?.type === 'video') {
                      <div class="bg-black border border-border-main overflow-hidden shadow-xl mb-8">
                        <div class="p-4 bg-surface-900 flex justify-between items-center">
                          <h3 class="text-white font-bold flex items-center gap-2">
                            <mat-icon class="text-primary-400">play_circle</mat-icon>
                            {{ selectedLesson()?.title }}
                          </h3>
                          <button (click)="selectedLesson.set(null)" class="text-zinc-400 hover:text-white transition-colors">
                            <mat-icon>close</mat-icon>
                          </button>
                        </div>
                        <div class="aspect-video w-full relative">
                          @if (isYouTubeUrl(selectedLesson()?.url)) {
                            <iframe 
                              class="w-full h-full absolute top-0 left-0" 
                              [src]="selectedLesson()?.url | safe" 
                              title="YouTube video player" 
                              frameborder="0" 
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                              referrerpolicy="strict-origin-when-cross-origin" 
                              allowfullscreen>
                            </iframe>
                          } @else {
                            <video controls class="w-full h-full object-cover" autoplay [src]="selectedLesson()?.url">
                              Tu navegador no soporta la reproducción de videos.
                            </video>
                          }
                        </div>
                      </div>
                    } @else if (selectedLesson()?.type === 'reading') {
                      <div class="bg-white border border-border-main shadow-sm mb-8 overflow-hidden animate-in fade-in slide-in-from-top-4">
                        <div class="p-4 bg-surface-50 border-b border-border-main flex justify-between items-center">
                          <h3 class="text-text-main font-bold flex items-center gap-2">
                            <mat-icon class="text-primary-600">article</mat-icon>
                            {{ selectedLesson()?.title }}
                          </h3>
                          <button (click)="selectedLesson.set(null)" class="text-text-muted hover:text-text-main transition-colors">
                            <mat-icon>close</mat-icon>
                          </button>
                        </div>
                        <div class="p-8 prose prose-zinc max-w-none">
                          <div class="text-text-main leading-relaxed text-lg font-medium">
                            @if (selectedLesson()?.content) {
                              <div [innerHTML]="selectedLesson()?.content"></div>
                            } @else {
                              <div class="flex flex-col items-center justify-center py-12 text-text-muted">
                                <mat-icon class="text-6xl mb-4">description</mat-icon>
                                <p>Contenido de lectura próximamente disponible.</p>
                                <p class="text-xs uppercase font-black tracking-widest mt-2">Material en proceso</p>
                              </div>
                            }
                          </div>
                        </div>
                        <div class="p-4 bg-surface-50 border-t border-border-main flex justify-end">
                          <button 
                            (click)="toggleLessonCompletion($event, selectedLesson()!.id)"
                            class="flex items-center gap-2 px-6 py-2 font-black text-xs uppercase tracking-widest transition-all"
                            [class.bg-green-600]="isLessonCompleted(selectedLesson()!.id)"
                            [class.text-white]="isLessonCompleted(selectedLesson()!.id)"
                            [class.bg-surface-200]="!isLessonCompleted(selectedLesson()!.id)"
                            [class.text-text-muted]="!isLessonCompleted(selectedLesson()!.id)">
                            <mat-icon class="text-[18px] w-[18px] h-[18px]">@if (isLessonCompleted(selectedLesson()!.id)) { check_circle } @else { radio_button_unchecked }</mat-icon>
                            {{ isLessonCompleted(selectedLesson()!.id) ? 'Completado' : 'Marcar como completado' }}
                          </button>
                        </div>
                      </div>
                    } @else if (selectedLesson()?.type === 'quiz') {
                      <app-quiz-shell
                        [courseId]="course()!.id"
                        [courseTitle]="course()!.title"
                        [quizId]="selectedLesson()!.id"
                        [quizTitle]="selectedLesson()!.title"
                        [legacyQuestions]="selectedLesson()!.questions || []">
                      </app-quiz-shell>
                    }
                    </div>
                  }

                  <div class="space-y-4">
                    @for (module of course()?.modules; track module.id; let i = $index) {
                      <div class="bg-white border border-border-main overflow-hidden shadow-sm transition-all">
                        <!-- Module Header -->
                        <button 
                          (click)="toggleModule(module.id)"
                          class="w-full flex items-center justify-between p-5 hover:bg-surface-50 transition-colors text-left">
                          <div class="flex items-center gap-4">
                            <div class="w-10 h-10 bg-primary-50 text-primary-700 flex items-center justify-center font-black shrink-0 border border-primary-100">
                              {{ i + 1 }}
                            </div>
                            <div>
                              <h3 class="font-black text-text-main text-lg uppercase tracking-tight">{{ module.title }}</h3>
                              <p class="text-text-muted text-[10px] font-black uppercase tracking-widest">{{ module.lessons.length }} lecciones</p>
                            </div>
                          </div>
                          <mat-icon class="text-text-muted transition-transform duration-300" 
                                    [class.rotate-180]="expandedModules().has(module.id)">
                            expand_more
                          </mat-icon>
                        </button>

                        <!-- Module Lessons -->
                        @if (expandedModules().has(module.id)) {
                          <div class="border-t border-border-main bg-surface-50/50">
                            @for (lesson of module.lessons; track lesson.id) {
                              <div 
                                (click)="playLesson(lesson)"
                                (keydown.enter)="playLesson(lesson)"
                                tabindex="0"
                                class="flex items-center justify-between p-4 pl-16 border-b border-border-main last:border-0 hover:bg-surface-100 transition-colors cursor-pointer group">
                                <div class="flex items-center gap-4">
                                  <!-- Completion Checkbox -->
                                  <button 
                                    (click)="toggleLessonCompletion($event, lesson.id)"
                                    class="w-6 h-6 border-2 flex items-center justify-center transition-colors"
                                    [class.border-green-500]="isLessonCompleted(lesson.id)"
                                    [class.bg-green-500]="isLessonCompleted(lesson.id)"
                                    [class.border-surface-300]="!isLessonCompleted(lesson.id)"
                                    [class.hover:border-green-400]="!isLessonCompleted(lesson.id)">
                                    @if (isLessonCompleted(lesson.id)) {
                                      <mat-icon class="text-white text-[16px] w-[16px] h-[16px]">check</mat-icon>
                                    }
                                  </button>
                                  
                                  <!-- Lesson Info -->
                                  <div>
                                    <p class="font-bold text-text-main group-hover:text-primary-700 transition-colors">
                                      {{ lesson.title }}
                                    </p>
                                    <div class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted mt-1">
                                      @if (lesson.type === 'video') {
                                        <mat-icon class="text-[14px] w-[14px] h-[14px]">play_circle</mat-icon> Video
                                      } @else if (lesson.type === 'reading') {
                                        <mat-icon class="text-[14px] w-[14px] h-[14px]">article</mat-icon> Lectura
                                      } @else {
                                        <mat-icon class="text-[14px] w-[14px] h-[14px]">quiz</mat-icon> Examen
                                      }
                                      <span>•</span>
                                      <span>{{ lesson.duration }}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                @if (lesson.type === 'video' && isEnrolled()) {
                                  <mat-icon class="text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity">play_arrow</mat-icon>
                                } @else if (!isEnrolled()) {
                                  <mat-icon class="text-surface-300">lock</mat-icon>
                                }
                              </div>
                            }
                          </div>
                        }
                      </div>
                    }
                  </div>
                </div>
              }
            </div>

              <div class="md:col-span-1">
                <div class="sticky top-24 space-y-8">
                  
                  <!-- Tarjeta de Inscripción (Movida aquí para evitar solapamientos) -->
                  <div class="bg-surface p-6 border border-border-main shadow-premium">
                    <div class="aspect-video w-full overflow-hidden mb-6 border border-border-main">
                      <img [src]="course()?.imageUrl" [alt]="course()?.title" class="w-full h-full object-cover transition-transform duration-700 hover:scale-105" referrerpolicy="no-referrer">
                    </div>
                    
                    @if (!isEnrolled()) {
                      <div class="mb-6 pb-6 border-b border-border-main">
                        <p class="text-4xl font-black text-text-main mb-2">Gratis</p>
                        <p class="text-[10px] font-black text-green-600 uppercase tracking-widest flex items-center gap-2">
                          <mat-icon class="text-[16px] w-[16px] h-[16px]">verified</mat-icon> Certificado oficial disponible
                        </p>
                      </div>

                      <button (click)="enroll()" class="w-full bg-primary-600 hover:bg-primary-700 text-white px-6 py-4 font-black text-sm uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2">
                        {{ authService.currentUser() ? 'Comenzar a aprender' : 'Inscribirme Gratis' }}
                      </button>
                      
                      <p class="text-[10px] text-center text-text-muted mt-4 font-bold uppercase tracking-widest">Acceso de por vida incluido</p>
                    } @else {
                      <div class="w-full bg-green-50 text-green-700 px-6 py-4 font-black text-sm uppercase tracking-widest text-center flex items-center justify-center gap-2 border border-green-200">
                        <mat-icon>check_circle</mat-icon> Inscrito y Activo
                      </div>
                    }
                  </div>

                  @if (isEnrolled()) {
                    <div class="bg-white p-6 border border-border-main shadow-sm">
                      <h3 class="text-lg font-black text-text-main mb-4 flex items-center gap-2 uppercase tracking-tight">
                        <mat-icon class="text-primary-600">analytics</mat-icon> Evaluación
                      </h3>
                      
                      @if (evaluationState(); as eval) {
                        <div class="space-y-6">
                          <!-- Progreso del Curso -->
                          <div>
                            <div class="flex justify-between items-end mb-2">
                              <p class="text-[10px] font-black text-text-muted uppercase tracking-widest">Progreso del Curso</p>
                              <span class="text-2xl font-black text-primary-600">{{ eval.completionScore }}%</span>
                            </div>
                            <div class="w-full bg-surface-100 h-3 overflow-hidden border border-border-main">
                              <div class="bg-primary-600 h-full transition-all duration-500" [style.width.%]="eval.completionScore"></div>
                            </div>
                          </div>

                          <!-- Promedio Final -->
                           <div class="text-center p-4 border-2" 
                               [class.bg-green-50]="eval.isApproved" 
                               [class.border-green-200]="eval.isApproved"
                               [class.bg-red-50]="!eval.isApproved && eval.isCompleted"
                               [class.border-red-200]="!eval.isApproved && eval.isCompleted"
                               [class.bg-surface-50]="!eval.isCompleted"
                               [class.border-border-main]="!eval.isCompleted">
                            <p class="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Calificación Académica</p>
                            <div class="text-4xl font-black mb-1"
                                 [class.text-green-600]="eval.isApproved"
                                 [class.text-red-600]="!eval.isApproved && eval.isCompleted"
                                 [class.text-text-main]="!eval.isCompleted">
                              {{ eval.finalAverage }}/100
                            </div>
                            <p class="font-black text-[10px] uppercase tracking-widest"
                               [class.text-green-600]="eval.isApproved"
                               [class.text-red-600]="!eval.isApproved && eval.isCompleted"
                               [class.text-text-muted]="!eval.isCompleted">
                              {{ !eval.isCompleted ? eval.pendingMessage : (eval.isApproved ? 'Aprobado con Excelencia' : 'Reprobado') }}
                            </p>
                          </div>

                          <!-- Desglose -->
                          <div class="space-y-3 pt-2">
                            <div class="flex justify-between text-[10px] font-black uppercase tracking-widest">
                              <span class="text-text-muted">Lecciones (30%)</span>
                              <span class="text-text-main">{{ eval.completionScore }}%</span>
                            </div>
                            <div class="flex justify-between text-[10px] font-black uppercase tracking-widest">
                              <span class="text-text-muted">Promedio exámenes (70%)</span>
                              <span class="text-text-main">{{ eval.examScore }}/100</span>
                            </div>
                          </div>

                          <!-- Lista de Exámenes -->
                          @if (eval.totalQuizzes > 0) {
                            <div class="border-t border-border-main pt-4">
                              <h4 class="text-[10px] font-black text-text-main mb-3 uppercase tracking-widest">Calificaciones de Exámenes</h4>
                              <ul class="space-y-2">
                                @for (exam of eval.examDetails; track exam.title) {
                                  <li class="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                    <span class="text-text-muted truncate pr-2" [title]="exam.title">{{ exam.title }}</span>
                                    @if (exam.grade !== null) {
                                      <span class="font-black px-2 py-0.5 border"
                                            [class.bg-green-50]="exam.grade >= 70" [class.text-green-700]="exam.grade >= 70" [class.border-green-200]="exam.grade >= 70"
                                            [class.bg-red-50]="exam.grade < 70" [class.text-red-700]="exam.grade < 70" [class.border-red-200]="exam.grade < 70">
                                        {{ exam.grade }}
                                      </span>
                                    } @else {
                                      <span class="text-text-muted bg-surface-100 px-2 py-0.5 border border-border-main">Pendiente</span>
                                    }
                                  </li>
                                }
                              </ul>
                            </div>
                          }
                        </div>
                      }
                    </div>
                  }

                  <div class="bg-surface-50 p-6 border border-border-main shadow-sm">
                    <h3 class="text-lg font-black text-text-main mb-6 uppercase tracking-tight">Detalles Técnicos</h3>
                    
                    <ul class="space-y-4">
                      <li class="flex items-center gap-3 text-text-main">
                        <div class="w-10 h-10 bg-white border border-border-main flex items-center justify-center text-primary-600 shadow-sm">
                          <mat-icon>schedule</mat-icon>
                        </div>
                        <div>
                          <p class="text-[10px] text-text-muted font-black uppercase tracking-widest">Duración</p>
                          <p class="font-bold">{{ course()?.duration }}</p>
                        </div>
                      </li>
                      <li class="flex items-center gap-3 text-text-main">
                        <div class="w-10 h-10 bg-white border border-border-main flex items-center justify-center text-primary-600 shadow-sm">
                          <mat-icon>trending_up</mat-icon>
                        </div>
                        <div>
                          <p class="text-[10px] text-text-muted font-black uppercase tracking-widest">Nivel</p>
                          <p class="font-bold">{{ course()?.level }}</p>
                        </div>
                      </li>
                      <li class="flex items-center gap-3 text-text-main">
                        <div class="w-10 h-10 bg-white border border-border-main flex items-center justify-center text-primary-600 shadow-sm">
                          <mat-icon>workspace_premium</mat-icon>
                        </div>
                        <div>
                          <p class="text-[10px] text-text-muted font-black uppercase tracking-widest">Certificación</p>
                          <p class="font-bold">Incluida al finalizar</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

          </div>
        </div>
      </div>
    } @else {
      <div class="min-h-screen flex items-center justify-center bg-surface">
        <div class="text-center p-12 border border-border-main bg-white shadow-premium max-w-md w-full">
          <mat-icon class="text-8xl text-surface-200 mb-6">error_outline</mat-icon>
          <h2 class="text-3xl font-black text-text-main uppercase tracking-tight mb-4">Curso no encontrado</h2>
          <p class="text-text-muted font-medium mb-8">El curso que buscas no existe o ha sido movido permanentemente.</p>
          <a routerLink="/courses" class="inline-block bg-primary-600 text-white px-8 py-4 font-black text-xs uppercase tracking-widest hover:bg-primary-700 transition-all shadow-md">
            Volver al catálogo
          </a>
        </div>
      </div>
    }
  `
})
export class CourseDetailComponent implements OnInit, OnDestroy {
  // Inyección de dependencias (Servicios de Angular)
  route = inject(ActivatedRoute); // Para obtener parámetros de la URL
  router = inject(Router); // Para navegar entre páginas
  location = inject(Location); // Para navegar hacia atrás en el historial
  courseService = inject(CourseService); // Para obtener datos de los cursos
  authService = inject(AuthService); // Para manejar la sesión del usuario
  tracker = inject(ActivityTrackerService);
  
  // Estado del componente usando Signals (Reactividad de Angular)
  course = signal<Course | undefined>(undefined);
  isEnrolled = signal<boolean>(false);
  activeTab = signal<'overview' | 'curriculum' | 'reviews'>('overview');
  expandedModules = signal<Set<string>>(new Set());
  selectedLesson = signal<Lesson | null>(null);
  
  isTakingQuiz = signal<boolean>(false);
  isReviewingQuiz = signal<boolean>(false);
  isSubmittingQuiz = signal<boolean>(false);
  currentQuestionIndex = signal<number>(0);
  quizQuestions = signal<any[]>([]);
  userAnswers = signal<any[]>([]);
  
  // Computed signals for robust reactivity
  currentQuestion = computed(() => {
    const qs = this.quizQuestions();
    const idx = this.currentQuestionIndex();
    return qs && qs.length > idx ? qs[idx] : null;
  });
  
  currentUserAnswer = computed(() => {
    const ans = this.userAnswers();
    const idx = this.currentQuestionIndex();
    return ans ? ans[idx] : undefined;
  });
  
  // Local state for specific question types
  shortAnswerText = '';
  userOrder = signal<string[]>([]);

  aiService = inject(AiService);
  uiState = inject(UiStateService);

  ngOnDestroy() {
    this.uiState.isExamMode.set(false);
  }

  isQuestionAnswered(): boolean {
    const currentQ = this.currentQuestion();
    if (!currentQ) return false;

    if (currentQ.type === 'mc' || !currentQ.type) {
      return this.currentUserAnswer() !== undefined;
    }
    if (currentQ.type === 'order') {
      return this.userOrder().length === (currentQ.options?.length || 0);
    }
    if (currentQ.type === 'short') {
      return this.shortAnswerText.trim().length > 10;
    }
    return false;
  }

  toggleOrderOption(option: string) {
    const current = [...this.userOrder()];
    const index = current.indexOf(option);
    if (index === -1) {
      current.push(option);
    } else {
      current.splice(index, 1);
    }
    this.userOrder.set(current);
    
    // Save to userAnswers
    const answers = [...this.userAnswers()];
    answers[this.currentQuestionIndex()] = current;
    this.userAnswers.set(answers);
  }

  isOptionInOrder(option: string): boolean {
    return this.userOrder().includes(option);
  }

  getOptionOrderIndex(option: string): number {
    return this.userOrder().indexOf(option);
  }

  resetOrder() {
    this.userOrder.set([]);
    const answers = [...this.userAnswers()];
    answers[this.currentQuestionIndex()] = [];
    this.userAnswers.set(answers);
  }

  isYouTubeUrl(url: string | undefined): boolean {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
  }
  // Método que se ejecuta al iniciar el componente
  async ngOnInit() {
    // Obtener el ID del curso desde la URL (ej. /courses/c1 -> id = 'c1')
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      // Buscar el curso en el servicio
      const found = await this.courseService.getCourseById(id);
      this.course.set(found);
      // Verificar si el usuario actual está inscrito en este curso
      this.checkEnrollment();
      
      // Expandir el primer módulo por defecto si existen
      if (found?.modules?.length) {
        this.expandedModules.set(new Set([found.modules[0].id]));
      }
    }
  }

  // Navegar a la página anterior
  goBack() {
    this.location.back();
  }

  // Verifica si el usuario logueado tiene este curso en su lista de inscritos
  checkEnrollment() {
    const user = this.authService.currentUser();
    const currentCourse = this.course();
    if (user && currentCourse) {
      if (user.role === 'admin') {
        this.isEnrolled.set(true); // Admin always has access
        return;
      }
      const enrolled = user.enrolledCourses.some(c => c.courseId === currentCourse.id);
      this.isEnrolled.set(enrolled);
    } else {
      this.isEnrolled.set(false);
    }
  }

  // Lógica para inscribirse en el curso
  enroll() {
    // Si no hay usuario logueado, redirigir al registro/login
    if (!this.authService.currentUser()) {
      this.router.navigate(['/register'], { queryParams: { courseId: this.course()?.id } });
      return;
    }
    
    // Si el curso existe, inscribir al usuario usando el servicio de autenticación
    if (this.course()) {
      this.authService.enroll(this.course()!.id);
      this.checkEnrollment(); // Actualizar el estado para mostrar los videos
      this.tracker.track('enroll', 'Se inscribió en: ' + this.course()!.title, 'course', this.course()!.id);
    }
  }

  // Alternar la expansión de un módulo en el acordeón
  toggleModule(moduleId: string) {
    const current = new Set(this.expandedModules());
    if (current.has(moduleId)) {
      current.delete(moduleId);
    } else {
      current.add(moduleId);
    }
    this.expandedModules.set(current);
  }

  // Reproducir una lección (si es video o lectura y el usuario está inscrito)
  playLesson(lesson: Lesson) {
    if (!this.isEnrolled()) {
      return;
    }
    
    // Al cambiar de lección, salir de modo quiz si estaba en uno
    this.isTakingQuiz.set(false);
    this.isReviewingQuiz.set(false);
    this.uiState.isExamMode.set(false);

    if (lesson.type === 'video' || lesson.type === 'reading' || lesson.type === 'quiz') {
      this.selectedLesson.set(lesson);
      setTimeout(() => {
        document.getElementById('lesson-viewer')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  }

  // Verificar si una lección está completada
  isLessonCompleted(lessonId: string): boolean {
    const user = this.authService.currentUser();
    if (!user || !this.course()) return false;
    
    const enrollment = user.enrolledCourses.find(c => c.courseId === this.course()!.id);
    if (!enrollment || !enrollment.completedLessons) return false;
    
    return enrollment.completedLessons.includes(lessonId);
  }

  // Marcar/desmarcar una lección como completada
  toggleLessonCompletion(event: Event, lessonId: string) {
    event.stopPropagation(); // Evitar que se dispare playLesson al hacer clic en el checkbox
    if (!this.isEnrolled()) return;
    
    this.authService.toggleLessonCompletion(this.course()!.id, lessonId);
    this.updateCourseProgress();
  }

  getEnrollment() {
    const user = this.authService.currentUser();
    if (!user || !this.course()) return null;
    return user.enrolledCourses.find(c => c.courseId === this.course()!.id);
  }

  getQuizGrade(lessonId: string): number | undefined {
    const enrollment = this.getEnrollment();
    return enrollment?.quizGrades?.[lessonId];
  }

  takeQuiz() {
    this.startQuiz();
  }

  startQuiz() {
    const lesson = this.selectedLesson();
    // Snapshot the questions into their own signal so Angular tracks them reactively
    const questions = lesson?.questions ? [...lesson.questions] : [];
    this.quizQuestions.set(questions);
    this.isTakingQuiz.set(true);
    this.isReviewingQuiz.set(false);
    this.uiState.isExamMode.set(true);
    this.currentQuestionIndex.set(0);
    this.userAnswers.set([]);
    this.userOrder.set([]);
    this.shortAnswerText = '';
    this.tracker.track('quiz_started', 'Inició examen: ' + (lesson?.title || ''), 'quiz', lesson?.id || '');
  }

  startReview() {
    const lesson = this.selectedLesson();
    if (!lesson || !lesson.questions) return;
    
    // Load questions and answers for review
    this.quizQuestions.set([...lesson.questions]);
    
    // Need to load the answers from enrollment
    const enrollment = this.getEnrollment();
    // For now we don't persist answers in enrollment, but we can keep them in memory
    // if the user just finished the quiz. 
    // If they refresh, userAnswers will be empty.
    // IMPROVEMENT: Answers should be saved in enrollment.
    
    this.isReviewingQuiz.set(true);
    this.currentQuestionIndex.set(0);
    this.uiState.isExamMode.set(true);
  }

  exitReview() {
    this.isReviewingQuiz.set(false);
    this.uiState.isExamMode.set(false);
  }

  isUserAnswerCorrect(): boolean {
    const q = this.currentQuestion();
    const answer = this.currentUserAnswer();
    if (!q) return false;

    if (q.type === 'mc' || !q.type) {
      return answer === q.correctAnswerIndex;
    }
    if (q.type === 'order') {
      return JSON.stringify(answer) === JSON.stringify(q.correctOrder);
    }
    return true; // For short answer, it depends on AI evaluation
  }

  prevQuestion() {
    if (this.currentQuestionIndex() > 0) {
      const prevIdx = this.currentQuestionIndex() - 1;
      
      const q = this.quizQuestions()[prevIdx];
      if (q.type === 'order') {
        this.userOrder.set(this.userAnswers()[prevIdx] || []);
      } else if (q.type === 'short') {
        this.shortAnswerText = this.userAnswers()[prevIdx] || '';
      }

      this.currentQuestionIndex.set(prevIdx);
    }
  }

  selectAnswer(index: number) {
    const answers = [...this.userAnswers()];
    answers[this.currentQuestionIndex()] = index;
    this.userAnswers.set(answers);
  }

  nextQuestion() {
    const currentQ = this.currentQuestion();
    if (currentQ?.type === 'short') {
      const answers = [...this.userAnswers()];
      answers[this.currentQuestionIndex()] = this.shortAnswerText;
      this.userAnswers.set(answers);
    }

    const nextIdx = this.currentQuestionIndex() + 1;
    const nextQ = this.quizQuestions()[nextIdx];
    
    if (nextQ?.type === 'order') {
      this.userOrder.set(this.userAnswers()[nextIdx] || []);
    } else if (nextQ?.type === 'short') {
      this.shortAnswerText = this.userAnswers()[nextIdx] || '';
    }

    this.currentQuestionIndex.set(nextIdx);
  }

  async submitQuiz() {
    const lesson = this.selectedLesson();
    if (!lesson || !lesson.questions) return;
    
    // Save last question if it's a short answer
    if (lesson.questions[this.currentQuestionIndex()].type === 'short') {
      const answers = [...this.userAnswers()];
      answers[this.currentQuestionIndex()] = this.shortAnswerText;
      this.userAnswers.set(answers);
    }

    this.isSubmittingQuiz.set(true);
    
    let score = 0;
    const totalPoints = 100;
    const pointsPerQuestion = totalPoints / lesson.questions.length;

    for (let i = 0; i < lesson.questions.length; i++) {
      const q = lesson.questions[i];
      const answer = this.userAnswers()[i];

      if (q.type === 'mc' || !q.type) {
        if (answer === q.correctAnswerIndex) {
          score += pointsPerQuestion;
        }
      } 
      else if (q.type === 'order') {
        const isCorrect = JSON.stringify(answer) === JSON.stringify(q.correctOrder);
        if (isCorrect) score += pointsPerQuestion;
      }
      else if (q.type === 'short') {
        // Call Gemini to evaluate
        const evaluationPrompt = `Evalúa la siguiente respuesta de un estudiante. 
        Pregunta: ${q.question}
        Respuesta: ${answer}
        Criterios esperados: ${q.explanation}
        
        Responde ÚNICAMENTE con un número del 0 al 10 (donde 10 es perfecto).`;
        
        try {
          const result = await firstValueFrom(this.aiService.evaluateExam(evaluationPrompt));
          const points = parseFloat(result || '0');
          score += (points / 10) * pointsPerQuestion;
        } catch (e) {
          // Fallback if AI fails: give 5 points if they wrote something
          if (answer && answer.length > 20) score += pointsPerQuestion * 0.5;
        }
      }
    }

    const finalGrade = Math.round(score);
    this.authService.saveQuizGrade(this.course()!.id, lesson.id, finalGrade);
    this.updateCourseProgress();
    this.tracker.track('quiz_completed', `Completó examen "${lesson.title}" con nota ${finalGrade}/100`, 'quiz', lesson.id);
    this.isSubmittingQuiz.set(false);
    this.isTakingQuiz.set(false);
    this.uiState.isExamMode.set(false);
  }

  updateCourseProgress() {
    const course = this.course();
    const user = this.authService.currentUser();
    if (!course || !user) return;

    const enrollment = user.enrolledCourses.find(c => c.courseId === course.id);
    if (!enrollment) return;

    let totalLessons = 0;
    let totalQuizzes = 0;
    const quizIds: string[] = [];

    course.modules.forEach(m => {
      m.lessons.forEach(l => {
        totalLessons++;
        if (l.type === 'quiz') {
          totalQuizzes++;
          quizIds.push(l.id);
        }
      });
    });

    const completedCount = enrollment.completedLessons?.length || 0;
    const completionScore = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

    const quizGrades = enrollment.quizGrades || {};
    let sumGrades = 0;
    let examsTaken = 0;

    quizIds.forEach(qId => {
      if (quizGrades[qId] !== undefined) {
        examsTaken++;
        sumGrades += quizGrades[qId];
      }
    });

    const examScore = examsTaken > 0 ? sumGrades / examsTaken : 0;
    
    let finalAverage = 0;
    if (totalQuizzes > 0) {
      // El progreso real del curso (barra de progreso) es solo lecciones
      // Pero la calificación académica es el promedio ponderado
      finalAverage = (examScore * 0.7) + (completionScore * 0.3);
    } else {
      finalAverage = completionScore;
    }

    // Guardamos el progreso real (lecciones) y la nota académica por separado
    // Usamos el campo 'progress' para lecciones y 'grade' para la nota ponderada
    this.authService.updateProgress(course.id, Math.round(completionScore), Math.round(finalAverage));
  }

  evaluationState = computed(() => {
    const course = this.course();
    const user = this.authService.currentUser();
    if (!course || !user) return null;

    const enrollment = user.enrolledCourses.find(c => c.courseId === course.id);
    if (!enrollment) return null;

    const completedSet = new Set(enrollment.completedLessons || []);
    let totalLessons = 0;
    let totalQuizzes = 0;
    let missingVideos = 0;
    let missingReadings = 0;
    let missingQuizzes = 0;
    const quizIds: string[] = [];

    course.modules.forEach(m => {
      m.lessons.forEach(l => {
        totalLessons++;
        if (l.type === 'quiz') {
          totalQuizzes++;
          quizIds.push(l.id);
        }
        
        if (!completedSet.has(l.id)) {
          if (l.type === 'video') missingVideos++;
          else if (l.type === 'reading') missingReadings++;
          else if (l.type === 'quiz') missingQuizzes++;
        }
      });
    });

    const completionScore = totalLessons > 0 ? (completedSet.size / totalLessons) * 100 : 0;

    const quizGrades = enrollment.quizGrades || {};
    let sumGrades = 0;
    let examsTaken = 0;
    const examDetails: {title: string, grade: number | null}[] = [];

    course.modules.forEach(m => {
      m.lessons.forEach(l => {
        if (l.type === 'quiz') {
          const grade = quizGrades[l.id];
          if (grade !== undefined) {
            examsTaken++;
            sumGrades += grade;
            examDetails.push({ title: l.title, grade });
          } else {
            examDetails.push({ title: l.title, grade: null });
          }
        }
      });
    });

    const examScore = examsTaken > 0 ? sumGrades / examsTaken : 0;
    
    let finalAverage = 0;
    if (totalQuizzes > 0) {
      finalAverage = (examScore * 0.7) + (completionScore * 0.3);
    } else {
      finalAverage = completionScore;
    }

    const isCompleted = missingVideos === 0 && missingReadings === 0 && missingQuizzes === 0;
    const isApproved = finalAverage >= 70 && isCompleted;

    let pendingMessage = 'En curso';
    if (!isCompleted) {
      const missingParts = [];
      if (missingVideos > 0) missingParts.push('videos');
      if (missingReadings > 0) missingParts.push('lecturas');
      if (missingQuizzes > 0) missingParts.push('exámenes');
      if (missingParts.length > 0) {
        pendingMessage = 'Faltan ' + missingParts.join(', ').replace(/, ([^,]*)$/, ' y $1');
      }
    }

    return {
      completionScore: Math.round(completionScore),
      examScore: Math.round(examScore),
      finalAverage: Math.round(finalAverage),
      isApproved,
      isCompleted,
      pendingMessage,
      examsTaken,
      totalQuizzes,
      examDetails
    };
  });
}
