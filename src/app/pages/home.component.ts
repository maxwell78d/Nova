import { Component, inject, computed, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CourseService } from '../services/course.service';
import { AuthService } from '../services/auth.service';
import { AppSettingsService } from '../services/app-settings.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  template: `
    <!-- Hero Section -->
    <section class="relative bg-surface text-text-main overflow-hidden pt-16 md:pt-20 pb-24 md:pb-32 border-b border-border-main">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          <div class="w-full lg:w-1/2">
            <span class="inline-flex items-center gap-2 py-1.5 px-4 bg-primary-50 text-primary-700 text-xs font-black tracking-widest mb-6 md:mb-8 border border-primary-100 uppercase animate-fade-in">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
              </span>
              {{ courseService.courses().length }} cursos disponibles
            </span>
            <h1 class="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight mb-6 md:mb-8 leading-tight text-text-main animate-slide-up">
              Tu futuro, <br>
              <span class="text-primary-600">comienza aquí.</span>
            </h1>
            <p class="text-lg md:text-2xl text-text-muted mb-8 md:mb-12 leading-relaxed font-medium animate-slide-up-delay">
              Aprende a tu ritmo con programas diseñados por expertos. Obtén certificaciones y destaca en el mercado laboral con {{ settings.siteName() }}.
            </p>
            <div class="flex flex-col sm:flex-row gap-3 md:gap-4 animate-slide-up-delay-2">
              <a routerLink="/courses" class="bg-primary-600 hover:bg-primary-700 text-white px-6 md:px-8 py-3 md:py-4 font-bold text-base md:text-lg transition-all shadow-sm hover:shadow-lg flex items-center justify-center gap-2 hover:-translate-y-0.5">
                Explorar Cursos
                <mat-icon>arrow_forward</mat-icon>
              </a>
              <a routerLink="/register" class="bg-surface hover:bg-surface-50 text-text-main border-2 border-border-main px-6 md:px-8 py-3 md:py-4 font-bold text-base md:text-lg transition-all flex items-center justify-center gap-2 hover:border-primary-200 hover:-translate-y-0.5">
                Inscribirse Ahora
              </a>
            </div>
          </div>
          
          <div class="w-full lg:w-1/2 relative hidden lg:block">
            <div class="absolute inset-0 bg-primary-100 blur-[100px] opacity-60"></div>
            <div class="relative w-full aspect-square overflow-hidden shadow-2xl border border-border-main animate-scale-in">
              <img src="https://picsum.photos/seed/education/1000/1000" alt="Estudiantes" class="w-full h-full object-cover" referrerpolicy="no-referrer">
              <!-- Floating Badge Overlay -->
              <div class="absolute bottom-8 left-8 bg-white/90 backdrop-blur-md p-5 shadow-xl border border-white animate-float">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-green-100 text-green-600 flex items-center justify-center">
                    <mat-icon>workspace_premium</mat-icon>
                  </div>
                  <div>
                    <p class="text-xs font-black text-text-muted uppercase tracking-widest">Certificación Oficial</p>
                    <p class="text-lg font-black text-text-main">Incluida en todos los cursos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- System Metrics Section — REAL DATA -->
    <section class="py-16 md:py-24 bg-surface-50 border-y border-border-main">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-px bg-border-main border border-border-main">
          
          <div class="bg-surface p-6 md:p-10 flex flex-col items-center justify-center text-center group hover:bg-primary-50 transition-colors">
            <div class="w-14 h-14 md:w-20 md:h-20 bg-primary-50 group-hover:bg-primary-100 flex items-center justify-center text-primary-600 mb-4 md:mb-6 transition-colors">
              <mat-icon class="text-3xl md:text-4xl">groups</mat-icon>
            </div>
            <h3 class="text-3xl md:text-5xl font-black text-text-main mb-1 md:mb-2">{{ totalStudents() }}</h3>
            <p class="text-text-muted font-bold uppercase tracking-widest text-[10px] md:text-xs">Estudiantes Reales</p>
          </div>

          <div class="bg-surface p-6 md:p-10 flex flex-col items-center justify-center text-center group hover:bg-blue-50 transition-colors">
            <div class="w-14 h-14 md:w-20 md:h-20 bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center text-blue-600 mb-4 md:mb-6 transition-colors">
              <mat-icon class="text-3xl md:text-4xl">library_books</mat-icon>
            </div>
            <h3 class="text-3xl md:text-5xl font-black text-text-main mb-1 md:mb-2">{{ totalCourses() }}</h3>
            <p class="text-text-muted font-bold uppercase tracking-widest text-[10px] md:text-xs">Cursos Disponibles</p>
          </div>

          <div class="bg-surface p-6 md:p-10 flex flex-col items-center justify-center text-center group hover:bg-green-50 transition-colors">
            <div class="w-14 h-14 md:w-20 md:h-20 bg-green-50 group-hover:bg-green-100 flex items-center justify-center text-green-600 mb-4 md:mb-6 transition-colors">
              <mat-icon class="text-3xl md:text-4xl">play_lesson</mat-icon>
            </div>
            <h3 class="text-3xl md:text-5xl font-black text-text-main mb-1 md:mb-2">{{ totalLessons() }}</h3>
            <p class="text-text-muted font-bold uppercase tracking-widest text-[10px] md:text-xs">Lecciones Totales</p>
          </div>

          <div class="bg-surface p-6 md:p-10 flex flex-col items-center justify-center text-center col-span-2 md:col-span-1 group hover:bg-amber-50 transition-colors">
            <div class="w-14 h-14 md:w-20 md:h-20 bg-amber-50 group-hover:bg-amber-100 flex items-center justify-center text-amber-600 mb-4 md:mb-6 transition-colors">
              <mat-icon class="text-3xl md:text-4xl">workspace_premium</mat-icon>
            </div>
            <h3 class="text-3xl md:text-5xl font-black text-text-main mb-1 md:mb-2">{{ totalCertificates() }}</h3>
            <p class="text-text-muted font-bold uppercase tracking-widest text-[10px] md:text-xs">Certificados Emitidos</p>
          </div>

        </div>
      </div>
    </section>

    <!-- Featured Courses -->
    <section class="py-16 md:py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 md:mb-12 gap-4">
          <div>
            <h2 class="text-2xl md:text-3xl font-black text-text-main mb-2">Cursos Destacados</h2>
            <p class="text-text-muted font-medium">Descubre los programas técnicos más solicitados.</p>
          </div>
          <a routerLink="/courses" class="hidden md:flex items-center gap-1 text-primary-600 font-bold hover:text-primary-800 transition-colors">
            Ver todos los cursos <mat-icon>arrow_forward</mat-icon>
          </a>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          @for (course of featuredCourses(); track course.id) {
            <a [routerLink]="['/courses', course.id]" class="group flex flex-col bg-surface overflow-hidden border border-border-main shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div class="relative h-40 md:h-48 overflow-hidden">
                <img [src]="course.imageUrl" [alt]="course.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerpolicy="no-referrer">
                <div class="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-black text-primary-700 uppercase tracking-widest shadow-sm">
                  {{ course.level }}
                </div>
              </div>
              <div class="p-4 md:p-6 flex flex-col flex-grow">
                <h3 class="text-base md:text-lg font-black text-text-main mb-2 group-hover:text-primary-600 transition-colors leading-tight">{{ course.title }}</h3>
                <p class="text-sm font-medium text-text-muted mb-4 line-clamp-2 flex-grow">{{ course.shortDescription }}</p>
                <div class="flex items-center justify-between text-sm pt-3 md:pt-4 border-t border-border-main">
                  <div class="flex items-center gap-1 font-bold text-text-muted">
                    <mat-icon class="text-[18px] w-[18px] h-[18px]">schedule</mat-icon>
                    <span>{{ course.duration }}</span>
                  </div>
                  <mat-icon class="text-primary-600 group-hover:translate-x-1 transition-transform">arrow_forward</mat-icon>
                </div>
              </div>
            </a>
          }
        </div>
        
        <div class="mt-8 md:mt-10 text-center md:hidden">
          <a routerLink="/courses" class="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-6 py-3 font-bold">
            Ver todos los cursos <mat-icon>arrow_forward</mat-icon>
          </a>
        </div>
      </div>
    </section>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }
    .animate-fade-in { animation: fadeIn 0.6s ease-out both; }
    .animate-slide-up { animation: slideUp 0.7s ease-out both; }
    .animate-slide-up-delay { animation: slideUp 0.7s ease-out 0.15s both; }
    .animate-slide-up-delay-2 { animation: slideUp 0.7s ease-out 0.3s both; }
    .animate-scale-in { animation: scaleIn 0.8s ease-out 0.2s both; }
    .animate-float { animation: float 4s ease-in-out infinite; }
  `]
})
export class HomeComponent implements OnInit {
  courseService = inject(CourseService);
  authService = inject(AuthService);
  settings = inject(AppSettingsService);
  
  // Dynamic featured courses from real DB
  featuredCourses = computed(() => this.courseService.courses().slice(0, 4));

  // Real dynamic data
  totalCourses = computed(() => this.courseService.courses().length);
  
  totalLessons = computed(() => {
    let count = 0;
    this.courseService.courses().forEach(course => {
      course.modules?.forEach(module => {
        count += module.lessons?.length || 0;
      });
    });
    return count;
  });
  
  // Real student count from all registered users
  totalStudents = computed(() => {
    return this.authService.allUsers().filter(u => u.role === 'student').length || this.authService.allUsers().length;
  });

  // Real certificate count from all users in Firestore
  totalCertificates = computed(() => {
    let count = 0;
    this.authService.allUsers().forEach(user => {
      const completed = user.enrolledCourses?.filter(c => c.progress === 100).length || 0;
      count += completed;
    });
    return count;
  });

  ngOnInit() {
    // Las estadísticas ahora son reactivas vía Signals
  }
}
