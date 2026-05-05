import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CourseService } from '../services/course.service';
import { AppSettingsService } from '../services/app-settings.service';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule, FormsModule],
  template: `
    <nav class="bg-black text-white shadow-lg sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center gap-6">
            <a routerLink="/" class="flex items-center gap-2 text-xl font-bold tracking-tight shrink-0">
               @if (settings.siteLogo()) {
                <img [src]="settings.siteLogo()" alt="Logo" class="h-8 max-w-[120px] object-contain">
               } @else {
                  <mat-icon class="text-blue-400">school</mat-icon>
               }
              <span>{{ settings.siteName() }}</span>
            </a>
            
            <!-- Global Search Bar -->
            <div class="hidden lg:block relative w-64 xl:w-80">
              <input type="text" [(ngModel)]="searchQuery" (keyup.enter)="onSearch()" placeholder="Buscar cursos..." class="w-full bg-zinc-900 border border-zinc-800 text-sm text-zinc-300 rounded-full pl-10 pr-4 py-1.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors">
              <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-[18px] w-[18px] h-[18px]">search</mat-icon>
            </div>
          </div>
          
          <!-- Desktop Menu -->
          <div class="hidden md:flex items-center space-x-6 xl:space-x-8">
            <a routerLink="/" routerLinkActive="text-blue-400" [routerLinkActiveOptions]="{exact: true}" class="hover:text-blue-300 transition-colors font-medium text-sm">Inicio</a>
            <a routerLink="/about" routerLinkActive="text-blue-400" class="hover:text-blue-300 transition-colors font-medium text-sm whitespace-nowrap">Sobre Nosotros</a>
            <a routerLink="/courses" routerLinkActive="text-blue-400" class="hover:text-blue-300 transition-colors font-medium text-sm whitespace-nowrap">Cursos Técnicos</a>
            <a routerLink="/contact" routerLinkActive="text-blue-400" class="hover:text-blue-300 transition-colors font-medium text-sm">Contacto</a>
            
            @if (auth.currentUser()) {
              <div class="relative ml-4 pl-4 border-l border-zinc-800">
                <button (click)="dropdownOpen.set(!dropdownOpen())" class="flex items-center gap-2 hover:text-blue-300 transition-colors focus:outline-none">
                  <img [src]="auth.currentUser()?.avatarUrl" alt="Avatar" class="w-8 h-8 rounded-full border-2 border-blue-400 object-cover">
                  <span class="font-medium truncate max-w-[100px] text-sm">{{ auth.currentUser()?.name?.split(' ')?.[0] }}</span>
                  <mat-icon class="text-[18px] w-[18px] h-[18px] transition-transform" [class.rotate-180]="dropdownOpen()">expand_more</mat-icon>
                </button>

                <!-- Dropdown Menu -->
                @if (dropdownOpen()) {
                  <div class="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-2xl py-2 border border-zinc-100 z-50 animate-in fade-in slide-in-from-top-2">
                    <a routerLink="/profile" (click)="dropdownOpen.set(false)" class="flex items-center gap-3 px-4 py-3 text-zinc-700 hover:bg-zinc-50 hover:text-purple-600 transition-colors">
                      <mat-icon class="text-[20px] w-[20px] h-[20px]">person</mat-icon>
                      <span class="font-medium text-sm">Mi Perfil</span>
                    </a>
                    
                    @if (auth.currentUser()?.role === 'admin') {
                      <a routerLink="/admin" (click)="dropdownOpen.set(false)" class="flex items-center gap-3 px-4 py-3 text-zinc-700 hover:bg-zinc-50 hover:text-purple-600 transition-colors">
                        <mat-icon class="text-[20px] w-[20px] h-[20px]">dashboard_customize</mat-icon>
                        <span class="font-medium text-sm">Panel de Control</span>
                      </a>
                    }

                    <button (click)="showUserInfo.set(true); dropdownOpen.set(false)" class="w-full flex items-center gap-3 px-4 py-3 text-zinc-700 hover:bg-zinc-50 hover:text-purple-600 transition-colors text-left">
                      <mat-icon class="text-[20px] w-[20px] h-[20px]">info</mat-icon>
                      <span class="font-medium text-sm">Información de Sesión</span>
                    </button>

                    @if (auth.currentUser()?.role === 'admin') {
                      <button (click)="goToSettings(); dropdownOpen.set(false)" class="w-full flex items-center gap-3 px-4 py-3 text-zinc-700 hover:bg-zinc-50 hover:text-purple-600 transition-colors text-left">
                        <mat-icon class="text-[20px] w-[20px] h-[20px]">settings</mat-icon>
                        <span class="font-medium text-sm">Ajustes del Sitio</span>
                      </button>
                    }
                    <div class="h-px bg-zinc-100 my-1"></div>
                    <button (click)="confirmLogout(); dropdownOpen.set(false)" class="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors text-left">
                      <mat-icon class="text-[20px] w-[20px] h-[20px]">logout</mat-icon>
                      <span class="font-medium text-sm">Cerrar sesión</span>
                    </button>
                  </div>
                }
              </div>
            } @else {
              <a routerLink="/login" class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg font-semibold transition-colors shadow-sm flex items-center gap-2 text-sm whitespace-nowrap">
                <mat-icon class="text-[18px] w-[18px] h-[18px]">login</mat-icon>
                Acceder
              </a>
              <a routerLink="/register" class="bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 rounded-lg font-semibold transition-colors shadow-sm text-sm whitespace-nowrap">
                Registro
              </a>
            }
          </div>

          <!-- Mobile menu button -->
          <div class="flex items-center md:hidden">
            <button (click)="mobileMenuOpen = !mobileMenuOpen" class="text-gray-300 hover:text-white focus:outline-none">
              <mat-icon>{{ mobileMenuOpen ? 'close' : 'menu' }}</mat-icon>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Menu -->
      @if (mobileMenuOpen) {
        <div class="md:hidden bg-zinc-900 pb-4 px-4 shadow-inner">
          <div class="flex flex-col space-y-3 pt-4">
            <div class="relative w-full mb-2">
              <input type="text" [(ngModel)]="searchQuery" (keyup.enter)="onSearch(); mobileMenuOpen = false" placeholder="Buscar cursos..." class="w-full bg-zinc-800 border border-zinc-700 text-sm text-zinc-300 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-blue-500">
              <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-[18px] w-[18px] h-[18px]">search</mat-icon>
            </div>
            
            <a routerLink="/" (click)="mobileMenuOpen = false" class="block px-3 py-2 rounded-md text-base font-medium hover:bg-zinc-800">Inicio</a>
            <a routerLink="/about" (click)="mobileMenuOpen = false" class="block px-3 py-2 rounded-md text-base font-medium hover:bg-zinc-800">Sobre Nosotros</a>
            <a routerLink="/courses" (click)="mobileMenuOpen = false" class="block px-3 py-2 rounded-md text-base font-medium hover:bg-zinc-800">Cursos Técnicos</a>
            <a routerLink="/contact" (click)="mobileMenuOpen = false" class="block px-3 py-2 rounded-md text-base font-medium hover:bg-zinc-800">Contacto</a>
            
            <div class="border-t border-zinc-800 pt-3 mt-2">
              @if (auth.currentUser()) {
                <a [routerLink]="auth.currentUser()?.role === 'admin' ? '/admin' : '/profile'" (click)="mobileMenuOpen = false" class="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-zinc-800">
                  <img [src]="auth.currentUser()?.avatarUrl" alt="Avatar" class="w-8 h-8 rounded-full object-cover">
                  <span class="font-medium">Mi Perfil</span>
                </a>
                <button (click)="showUserInfo.set(true); mobileMenuOpen = false" class="w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-zinc-800 flex items-center gap-2">
                  <mat-icon>info</mat-icon> Información del usuario
                </button>
                <button (click)="goToSettings(); mobileMenuOpen = false" class="w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-zinc-800 flex items-center gap-2">
                  <mat-icon>settings</mat-icon> Configuraciones
                </button>
                <button (click)="confirmLogout(); mobileMenuOpen = false" class="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-300 hover:bg-zinc-800 flex items-center gap-2">
                  <mat-icon>logout</mat-icon> Cerrar Sesión
                </button>
              } @else {
                <a routerLink="/login" (click)="mobileMenuOpen = false" class="block px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white text-center mt-2">Acceder</a>
                <a routerLink="/register" (click)="mobileMenuOpen = false" class="block px-3 py-2 rounded-md text-base font-medium bg-zinc-800 text-white text-center mt-2">Registro</a>
              }
            </div>
          </div>
        </div>
      }
    </nav>

    <!-- Logout Confirmation Modal -->
    @if (showLogoutConfirm()) {
      <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div class="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
          <div class="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <mat-icon class="text-3xl w-8 h-8">logout</mat-icon>
          </div>
          <h3 class="text-2xl font-bold text-center text-zinc-900 mb-2">¿Cerrar sesión?</h3>
          <p class="text-center text-zinc-500 mb-8">¿Estás seguro de que deseas salir de tu cuenta? Tendrás que volver a ingresar tus credenciales.</p>
          <div class="flex gap-4">
            <button (click)="showLogoutConfirm.set(false)" class="flex-1 px-4 py-3 rounded-xl font-bold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-colors">
              Cancelar
            </button>
            <button (click)="executeLogout()" class="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20">
              Confirmar
            </button>
          </div>
        </div>
      </div>
    }

    <!-- User Info Modal -->
    @if (showUserInfo()) {
      <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div class="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200 relative">
          <button (click)="showUserInfo.set(false)" class="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 transition-colors">
            <mat-icon>close</mat-icon>
          </button>
          
          <div class="flex flex-col items-center mb-6">
            <img [src]="auth.currentUser()?.avatarUrl" alt="Avatar" class="w-24 h-24 rounded-full border-4 border-purple-100 object-cover mb-4">
            <h3 class="text-2xl font-bold text-zinc-900">{{ auth.currentUser()?.name }}</h3>
            <p class="text-zinc-500">{{ auth.currentUser()?.email }}</p>
            <span class="mt-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
              {{ auth.currentUser()?.role === 'admin' ? 'Administrador' : 'Estudiante' }}
            </span>
          </div>

          <div class="bg-zinc-50 rounded-2xl p-5 border border-zinc-100">
            <h4 class="font-bold text-zinc-900 mb-3 flex items-center gap-2">
              <mat-icon class="text-purple-500 text-[20px] w-[20px] h-[20px]">menu_book</mat-icon>
              Cursos Inscritos ({{ auth.currentUser()?.enrolledCourses?.length || 0 }})
            </h4>
            
            @if (auth.currentUser()?.enrolledCourses?.length) {
              <ul class="space-y-3">
                @for (enrollment of auth.currentUser()?.enrolledCourses; track enrollment.courseId) {
                  <li class="flex justify-between items-center text-sm">
                    <span class="text-zinc-700 font-medium">{{ getCourseName(enrollment.courseId) }}</span>
                    <span class="text-purple-600 font-bold">{{ enrollment.progress }}%</span>
                  </li>
                }
              </ul>
            } @else {
              <p class="text-sm text-zinc-500 italic">No estás inscrito en ningún curso aún.</p>
            }
          </div>
        </div>
      </div>
    }
  `
})
export class NavbarComponent {
  auth = inject(AuthService);
  courseService = inject(CourseService);
  router = inject(Router);
  settings = inject(AppSettingsService);
  
  mobileMenuOpen = false;
  dropdownOpen = signal(false);
  showLogoutConfirm = signal(false);
  showUserInfo = signal(false);
  
  searchQuery = '';

  confirmLogout() {
    this.showLogoutConfirm.set(true);
  }

  executeLogout() {
    this.auth.logout();
    this.showLogoutConfirm.set(false);
    this.router.navigate(['/']);
  }

  goToSettings() {
    this.router.navigate(['/settings']);
  }

  getCourseName(courseId: string): string {
    const course = this.courseService.getCourseSync(courseId);
    return course ? course.title : 'Curso Desconocido';
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/courses'], { queryParams: { q: this.searchQuery.trim() } });
      this.searchQuery = ''; // Clear after search
    }
  }
}
