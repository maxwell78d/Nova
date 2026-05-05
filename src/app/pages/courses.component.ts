import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CourseService } from '../services/course.service';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [RouterLink, MatIconModule, FormsModule],
  template: `
    <div class="bg-surface-50 min-h-screen py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div class="mb-16 text-center max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p class="text-sm font-black text-primary-600 tracking-widest uppercase mb-4">Catálogo Oficial</p>
          <h1 class="text-4xl md:text-5xl font-black text-text-main mb-6 tracking-tight">Cursos y Programas Especializados</h1>
          <p class="text-lg text-text-muted mb-10 leading-relaxed">
            Impulsa tu carrera con certificaciones reconocidas por la industria. Aprende a tu ritmo, desde cualquier lugar.
          </p>

          <!-- Search Bar Locally -->
          <div class="relative max-w-2xl mx-auto group">
            <input type="text" [(ngModel)]="localSearchQuery" (input)="updateSearch()" placeholder="¿Qué quieres aprender hoy?" class="w-full bg-surface border-2 border-border-main text-text-main rounded-2xl pl-14 pr-6 py-4 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100 shadow-sm transition-all text-lg font-medium placeholder:text-text-muted">
            <mat-icon class="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted text-[28px] w-[28px] h-[28px] group-focus-within:text-primary-600 transition-colors">search</mat-icon>
          </div>
        </div>

        @if (filteredCourses().length === 0) {
          <div class="text-center py-20 bg-white rounded-3xl border border-zinc-200">
            <mat-icon class="text-6xl text-zinc-300 mb-4">search_off</mat-icon>
            <h2 class="text-2xl font-bold text-zinc-700">No encontramos resultados</h2>
            <p class="text-zinc-500 mt-2">Intenta buscar con otras palabras o revisar la ortografía.</p>
          </div>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            @for (course of filteredCourses(); track course.id) {
              <div class="bg-surface rounded-[1.5rem] overflow-hidden border border-border-main shadow-premium hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-300 flex flex-col group cursor-pointer" [routerLink]="['/courses', course.id]">
                <div class="relative h-64 overflow-hidden">
                  <img [src]="course.imageUrl" [alt]="course.title" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" referrerpolicy="no-referrer">
                  <div class="absolute bottom-4 left-4 right-4">
                    <span class="inline-block px-3 py-1 bg-white/90 backdrop-blur-md text-primary-700 rounded-full text-xs font-black uppercase tracking-widest shadow-sm">
                      {{ course.level }}
                    </span>
                  </div>
                </div>
                
                <div class="p-6 flex flex-col flex-grow">
                  <h3 class="text-xl font-black text-text-main leading-tight mb-2 group-hover:text-primary-600 transition-colors">{{ course.title }}</h3>
                  
                  <div class="flex items-center gap-1 text-sm mb-4">
                    <mat-icon class="text-yellow-400 text-[16px] w-[16px] h-[16px]">star</mat-icon>
                    <span class="font-bold text-text-main">5.0</span>
                    <span class="text-text-muted ml-1">(1.2K reseñas)</span>
                  </div>

                  <p class="text-sm font-medium text-text-muted mb-6 flex-grow line-clamp-3">
                    Certifícate en: {{ course.title }}
                  </p>
                  
                  <div class="flex items-center justify-between border-t border-border-main pt-4">
                    <div class="flex items-center gap-2 text-sm text-text-muted font-bold">
                      <mat-icon class="text-[18px] w-[18px] h-[18px]">schedule</mat-icon>
                      <span>{{ course.duration }}</span>
                    </div>
                    <span class="text-primary-600 font-bold group-hover:underline flex items-center gap-1">
                      Ver curso <mat-icon class="text-[16px] w-[16px] h-[16px]">arrow_forward</mat-icon>
                    </span>
                  </div>
                </div>
              </div>
            }
          </div>
        }

      </div>
    </div>
  `
})
export class CoursesComponent implements OnInit {
  courseService = inject(CourseService);
  route = inject(ActivatedRoute);
  
  allCourses = this.courseService.courses;
  localSearchQuery = '';
  searchQuerySignal = signal('');

  filteredCourses = computed(() => {
    const q = this.searchQuerySignal().toLowerCase();
    if (!q) return this.allCourses();

    return this.allCourses().filter(c => 
      c.title.toLowerCase().includes(q) || 
      c.shortDescription.toLowerCase().includes(q)
    );
  });

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.localSearchQuery = params['q'];
        this.searchQuerySignal.set(params['q']);
      }
    });
  }

  updateSearch() {
    this.searchQuerySignal.set(this.localSearchQuery);
  }
}
