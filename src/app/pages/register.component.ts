import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { CourseService } from '../services/course.service';
import { AppSettingsService } from '../services/app-settings.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, MatIconModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-surface-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-xl w-full bg-white p-10 border border-border-main shadow-premium">
        
        <div class="text-center mb-10">
           @if (settings.siteLogo()) {
             <img [src]="settings.siteLogo()" alt="Logo" class="mx-auto h-20 max-w-[200px] object-contain mb-4">
           }
          <h2 class="text-3xl font-black text-text-main uppercase tracking-tight">Crear Cuenta</h2>
          <p class="mt-2 text-[10px] text-text-muted font-black uppercase tracking-widest">
            Únete a {{ settings.siteName() }} y comienza tu formación
          </p>
        </div>

        @if (errorMsg) {
          <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
            <mat-icon class="text-[20px] w-[20px] h-[20px]">error_outline</mat-icon>
            {{ errorMsg }}
          </div>
        }

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-6">
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="name" class="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Nombre Completo</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <mat-icon class="text-text-muted text-[20px] w-[20px] h-[20px]">person</mat-icon>
                </div>
                <input type="text" id="name" formControlName="name" class="w-full pl-10 pr-4 py-4 border border-border-main bg-surface-50 focus:border-primary-600 outline-none transition-all font-medium" placeholder="Ej. Ana Martínez">
              </div>
            </div>

            <div>
              <label for="email" class="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Correo Electrónico</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <mat-icon class="text-text-muted text-[20px] w-[20px] h-[20px]">email</mat-icon>
                </div>
                <input type="email" id="email" formControlName="email" class="w-full pl-10 pr-4 py-4 border border-border-main bg-surface-50 focus:border-primary-600 outline-none transition-all font-medium" placeholder="ejemplo@correo.com">
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="password" class="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Contraseña</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <mat-icon class="text-text-muted text-[20px] w-[20px] h-[20px]">lock</mat-icon>
                </div>
                <input type="password" id="password" formControlName="password" class="w-full pl-10 pr-4 py-4 border border-border-main bg-surface-50 focus:border-primary-600 outline-none transition-all font-medium" placeholder="Mínimo 8 caracteres">
              </div>
            </div>

            <div>
              <label for="courseId" class="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Curso de Interés</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <mat-icon class="text-text-muted text-[20px] w-[20px] h-[20px]">school</mat-icon>
                </div>
                <select id="courseId" formControlName="courseId" class="w-full pl-10 pr-4 py-4 border border-border-main bg-surface-50 focus:border-primary-600 outline-none transition-all appearance-none font-medium">
                  <option value="">Selecciona un curso...</option>
                  @for (course of courses(); track course.id) {
                    <option [value]="course.id">{{ course.title }}</option>
                  }
                </select>
                <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <mat-icon class="text-text-muted">expand_more</mat-icon>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label for="educationalStatus" class="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Situación Académica</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <mat-icon class="text-text-muted text-[20px] w-[20px] h-[20px]">history_edu</mat-icon>
              </div>
              <select id="educationalStatus" formControlName="educationalStatus" class="w-full pl-10 pr-4 py-4 border border-border-main bg-surface-50 focus:border-primary-600 outline-none transition-all appearance-none font-medium">
                <option value="">Selecciona tu estado...</option>
                <option value="university">Estudiante Universitario</option>
                <option value="hs-1">1ro de Secundaria</option>
                <option value="hs-2">2do de Secundaria</option>
                <option value="hs-3">3ro de Secundaria</option>
                <option value="hs-4">4to de Secundaria</option>
                <option value="hs-5">5to de Secundaria</option>
                <option value="hs-6">6to de Secundaria</option>
                <option value="general">Público General (No estudiante)</option>
              </select>
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <mat-icon class="text-text-muted">expand_more</mat-icon>
              </div>
            </div>
          </div>

          <button type="submit" [disabled]="registerForm.invalid || isSubmitting()" class="w-full flex justify-center py-4 px-4 shadow-md text-xs font-black text-white bg-primary-600 hover:bg-primary-700 disabled:bg-surface-300 transition-all uppercase tracking-widest">
            @if (isSubmitting()) {
              <div class="w-4 h-4 border-2 border-white border-t-transparent animate-spin mr-2"></div>
              Creando cuenta...
            } @else {
              Registrarse ahora
            }
          </button>
        </form>

        <div class="mt-8 text-center text-[10px] font-black text-text-muted uppercase tracking-widest">
          ¿Ya tienes una cuenta? 
          <a routerLink="/login" class="text-primary-600 hover:text-primary-500">Inicia sesión aquí</a>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent implements OnInit {
  fb = inject(FormBuilder);
  auth = inject(AuthService);
  courseService = inject(CourseService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  settings = inject(AppSettingsService);

  courses = this.courseService.courses;
  errorMsg = '';

  registerForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    courseId: ['', Validators.required],
    educationalStatus: ['', Validators.required]
  });

  isSubmitting = signal(false);

  ngOnInit() {
    const preselectedCourse = this.route.snapshot.queryParamMap.get('courseId');
    if (preselectedCourse) {
      this.registerForm.patchValue({ courseId: preselectedCourse });
    }
  }

  async onSubmit() {
    if (this.registerForm.valid) {
      this.isSubmitting.set(true);
      this.errorMsg = '';
      
      const { name, email, password, courseId, educationalStatus } = this.registerForm.value;
      
      try {
        const success = await this.auth.register(name!, email!, password!, courseId || undefined, educationalStatus as any);
        
        if (success) {
          this.router.navigate(['/profile']);
        } else {
          this.errorMsg = 'No se pudo completar el registro. El correo podría estar en uso.';
        }
      } catch (error) {
        console.error('Registration Error:', error);
        this.errorMsg = 'Ocurrió un error inesperado durante el registro.';
      } finally {
        this.isSubmitting.set(false);
      }
    }
  }
}
