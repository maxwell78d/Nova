import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AppSettingsService } from '../services/app-settings.service';
import { CourseService } from '../services/course.service';
import { UiService } from '../services/ui.service';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray, FormGroup } from '@angular/forms';
import { UpperCasePipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [MatIconModule, UpperCasePipe, ReactiveFormsModule, CommonModule, RouterLink],
  template: `
    <div class="bg-surface-50 min-h-screen py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Header with Back Button -->
        <div class="flex justify-between items-center mb-8">
          <div class="flex items-center gap-4">
            <button routerLink="/" class="w-10 h-10 bg-surface border border-border-main flex items-center justify-center text-text-muted hover:text-text-main hover:border-primary-300 transition-all">
              <mat-icon>arrow_back</mat-icon>
            </button>
            <div>
              <h1 class="text-3xl font-black text-text-main tracking-tight">Panel de Administración</h1>
              <p class="text-text-muted font-medium text-sm">{{ settings.siteName() }} · Gestión centralizada</p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div class="text-right hidden sm:block">
              <p class="text-[10px] font-black text-text-muted uppercase tracking-widest">Estado Sistema</p>
              <div class="flex items-center gap-1.5 justify-end mt-1">
                <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span class="text-[10px] font-bold text-text-main uppercase">Online</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats Row -->
        <div class="grid grid-cols-2 md:grid-cols-5 gap-px bg-border-main border border-border-main mb-8">
          <div class="bg-surface p-5 flex items-center gap-3">
            <div class="w-10 h-10 bg-primary-100 text-primary-600 flex items-center justify-center">
              <mat-icon>people</mat-icon>
            </div>
            <div>
              <p class="text-2xl font-black text-text-main">{{ users().length }}</p>
              <p class="text-[10px] text-text-muted font-bold uppercase tracking-widest">Usuarios</p>
            </div>
          </div>
          <div class="bg-surface p-5 flex items-center gap-3">
            <div class="w-10 h-10 bg-blue-100 text-blue-600 flex items-center justify-center">
              <mat-icon>school</mat-icon>
            </div>
            <div>
              <p class="text-2xl font-black text-text-main">{{ courseService.courses().length }}</p>
              <p class="text-[10px] text-text-muted font-bold uppercase tracking-widest">Cursos</p>
            </div>
          </div>
          <a routerLink="/admin/activity" class="bg-surface p-5 flex items-center gap-3 cursor-pointer hover:bg-green-50 transition-colors group">
            <div class="w-10 h-10 bg-green-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
              <mat-icon>timeline</mat-icon>
            </div>
            <div>
              <p class="text-sm font-black text-text-main flex items-center gap-2">
                Actividad
                <span class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
              </p>
              <p class="text-[10px] text-text-muted font-bold uppercase tracking-widest">En vivo</p>
            </div>
          </a>
          <a routerLink="/admin/audit" class="bg-surface p-5 flex items-center gap-3 cursor-pointer hover:bg-blue-50 transition-colors group">
            <div class="w-10 h-10 bg-blue-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
              <mat-icon>security</mat-icon>
            </div>
            <div>
              <p class="text-sm font-black text-text-main">Auditoría</p>
              <p class="text-[10px] text-text-muted font-bold uppercase tracking-widest">Seguridad</p>
            </div>
          </a>
          <a routerLink="/admin/ai-traces" class="bg-surface p-5 flex items-center gap-3 cursor-pointer hover:bg-purple-50 transition-colors group">
            <div class="w-10 h-10 bg-purple-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
              <mat-icon>psychology</mat-icon>
            </div>
            <div>
              <p class="text-sm font-black text-text-main">IA Traces</p>
              <p class="text-[10px] text-text-muted font-bold uppercase tracking-widest">Evaluaciones</p>
            </div>
          </a>
        </div>

        <!-- Users Table -->
        <div class="bg-white border border-border-main overflow-hidden">
          <div class="p-6 border-b border-border-main flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface">
            <div>
              <h2 class="text-xl font-black text-text-main">Usuarios Registrados</h2>
              <p class="text-xs text-text-muted font-bold uppercase tracking-widest mt-1">Gestión de cuentas y roles</p>
            </div>
            <div class="relative w-full sm:w-auto">
              <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[18px]">search</mat-icon>
              <input type="text" placeholder="Buscar por nombre o email..." class="w-full sm:w-80 pl-10 pr-4 py-2 bg-surface-50 border border-border-main text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
            </div>
          </div>
          
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-surface-50 text-text-muted text-[10px] font-black uppercase tracking-widest border-b border-border-main">
                  <th class="p-4">Estudiante / Miembro</th>
                  <th class="p-4">Email</th>
                  <th class="p-4">Rol</th>
                  <th class="p-4 text-center">Cursos</th>
                  <th class="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border-main">
                @for (user of users(); track user.id) {
                  <tr class="hover:bg-surface-50 transition-colors cursor-pointer group" (click)="expandedUser = expandedUser === user.id ? null : user.id; editingUser = null">
                    <td class="p-4">
                      <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-primary-100 text-primary-700 flex items-center justify-center font-black text-xs border border-primary-200 group-hover:bg-primary-600 group-hover:text-white transition-all">
                          {{ (user.name || user.email || 'U').charAt(0) | uppercase }}
                        </div>
                        <span class="font-bold text-text-main">{{ user.name || 'Usuario sin nombre' }}</span>
                      </div>
                    </td>
                    <td class="p-4 text-text-muted text-sm font-medium">{{ user.email || 'N/A' }}</td>
                    <td class="p-4">
                      <span class="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider inline-block"
                            [class.bg-primary-100]="user.role === 'admin'"
                            [class.text-primary-700]="user.role === 'admin'"
                            [class.bg-blue-100]="user.role === 'student'"
                            [class.text-blue-700]="user.role === 'student'">
                        {{ user.role }}
                      </span>
                    </td>
                    <td class="p-4 text-center">
                      <span class="font-black text-text-main">{{ user.enrolledCourses.length }}</span>
                    </td>
                    <td class="p-4 text-right">
                      <button (click)="$event.stopPropagation(); startEditUser(user)" class="text-text-muted hover:text-primary-600 p-1 transition-colors">
                        <mat-icon class="text-[20px] w-[20px] h-[20px]">edit</mat-icon>
                      </button>
                      <button (click)="$event.stopPropagation(); deleteUser(user.id)" class="text-text-muted hover:text-red-600 p-1 transition-colors ml-2">
                        <mat-icon class="text-[20px] w-[20px] h-[20px]">delete</mat-icon>
                      </button>
                    </td>
                  </tr>
                  
                  <!-- Expanded Info & Edit Form -->
                  @if (expandedUser === user.id) {
                    <tr class="bg-surface-50 border-b border-border-main">
                      <td colspan="5" class="p-6">
                        @if (editingUser === user.id) {
                          <div class="bg-white p-6 border border-border-main animate-in fade-in zoom-in-95">
                            <h3 class="font-black text-lg mb-1 uppercase tracking-tight">Cambiar Rol de Usuario</h3>
                            <p class="text-text-muted text-xs mb-6 font-medium">Modifica los permisos de acceso para {{ user.name }}</p>
                            <form [formGroup]="editUserForm" (ngSubmit)="saveEditUser(user.id)" class="flex flex-col md:flex-row gap-4 items-end">
                              <div class="flex-1 w-full">
                                <label class="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Rol del Sistema</label>
                                <select formControlName="role" class="w-full p-3 border border-border-main outline-none focus:ring-2 focus:ring-primary-500 bg-surface-50 font-bold">
                                  <option value="student">Estudiante</option>
                                  <option value="admin">Administrador (Acceso total)</option>
                                </select>
                              </div>
                              <div class="flex gap-2 w-full md:w-auto">
                                <button type="button" (click)="editingUser = null" class="flex-1 px-4 py-3 text-text-muted hover:text-text-main font-bold uppercase text-xs tracking-widest transition-colors">Cancelar</button>
                                <button type="submit" [disabled]="editUserForm.invalid" class="flex-1 bg-primary-600 text-white px-8 py-3 font-bold disabled:bg-surface-300 uppercase text-xs tracking-widest transition-all">Actualizar</button>
                              </div>
                            </form>
                          </div>
                        } @else {
                          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in">
                            <div>
                              <p class="text-[10px] text-text-muted font-black uppercase tracking-widest mb-2">Información de Contacto</p>
                              <p class="text-text-main font-bold flex items-center gap-2"><mat-icon class="text-[16px] w-[16px] h-[16px] text-primary-600">email</mat-icon> {{ user.email }}</p>
                              <p class="text-text-main font-bold mt-2 flex items-center gap-2"><mat-icon class="text-[16px] w-[16px] h-[16px] text-primary-600">school</mat-icon> {{ formatEduStatus(user.educationalStatus) }}</p>
                            </div>
                            <div>
                              <p class="text-[10px] text-text-muted font-black uppercase tracking-widest mb-2">Actividad Académica</p>
                              <p class="text-text-main font-bold">Cursos inscritos: <span class="text-primary-600 text-lg ml-1">{{ user.enrolledCourses.length }}</span></p>
                            </div>
                            <div class="flex items-center justify-end">
                              <button (click)="startEditUser(user)" class="bg-surface border border-border-main text-text-main hover:bg-surface-100 px-5 py-2 font-black text-[10px] uppercase tracking-widest transition-all">
                                Editar Detalles
                              </button>
                            </div>
                          </div>
                        }
                      </td>
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- La sección de gestión de cursos antigua ha sido eliminada por solicitud del usuario para evitar redundancia -->
      </div>
      <!-- Herramientas de Mantenimiento -->
      <div class="mt-12 pt-8 border-t border-zinc-200">
        <h3 class="text-sm font-black text-zinc-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
          <mat-icon class="text-sm">maintance</mat-icon> Mantenimiento de Datos
        </h3>
        <div class="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-200">
              <mat-icon>sync</mat-icon>
            </div>
            <div>
              <h4 class="font-black text-blue-900 uppercase text-sm">Sincronización Global</h4>
              <p class="text-xs text-blue-700 font-medium max-w-md">Si los exámenes muestran preguntas repetidas o los cursos están incompletos, usa este botón para re-sincronizar Firestore con el JSON maestro de la academia.</p>
            </div>
          </div>
          <button (click)="syncData()" 
                  [disabled]="isSyncing()"
                  class="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-8 py-3 font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-blue-200 flex items-center gap-3">
            @if (isSyncing()) {
              <div class="w-3 h-3 border-2 border-white border-t-transparent animate-spin"></div>
              <span>Sincronizando...</span>
            } @else {
              <mat-icon class="text-sm">refresh</mat-icon>
              <span>Sincronizar ahora</span>
            }
          </button>
        </div>
      </div>
    </div>
  `
})
export class AdminComponent {
  auth = inject(AuthService);
  settings = inject(AppSettingsService);
  courseService = inject(CourseService);
  ui = inject(UiService);
  fb = inject(FormBuilder);
  
  isSyncing = signal(false);
  
  constructor() {
    this.auth.allUsers.set(this.auth.allUsers().filter(u => u && u.name && u.email && u.id));
  }

  async syncData() {
    this.isSyncing.set(true);
    try {
      console.log('Iniciando sincronización forzada...');
      await this.courseService.initializeWithDefaults();
      this.ui.success('Sincronización completada. Se han sobrescrito todos los cursos y exámenes con la versión maestra.');
    } catch (e) {
      console.error('Sync Error:', e);
      this.ui.error('Error al sincronizar. Revisa la consola para detalles técnicos.');
    } finally {
      this.isSyncing.set(false);
    }
  }

  users = this.auth.allUsers;
  showUserForm = false;
  showCourseForm = false;
  isInitializing = false;

  async initializeDatabase() {
    this.isInitializing = true;
    try {
      await this.courseService.initializeWithDefaults();
      this.ui.success('Base de datos inicializada correctamente. Los cursos ya aparecen en el catálogo.');
    } catch (error) {
      this.ui.error('Error al inicializar: ' + error);
    } finally {
      this.isInitializing = false;
    }
  }

  async deleteCourse(id: string) {
    try {
      await this.courseService.deleteCourse(id);
      this.ui.success('Curso eliminado correctamente.');
    } catch (error) {
      this.ui.error('Error al eliminar curso.');
    }
  }

  editCourse(course: any) {
    this.showCourseForm = true;
    this.courseForm.patchValue({
      title: course.title,
      duration: course.duration,
      level: course.level,
      shortDescription: course.shortDescription,
      fullDescription: course.fullDescription,
      imageUrl: course.imageUrl
    });
  }

  userForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['student', Validators.required]
  });

  editUserForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['student', Validators.required],
    educationalStatus: ['general', Validators.required]
  });

  expandedUser: string | null = null;
  editingUser: string | null = null;

  courseForm = this.fb.group({
    title: ['', Validators.required],
    duration: ['', Validators.required],
    level: ['Básico', Validators.required],
    shortDescription: ['', Validators.required],
    fullDescription: [''],
    imageUrl: ['https://picsum.photos/seed/new/600/400'],
    modules: this.fb.array([])
  });

  get modulesFormArray() {
    return this.courseForm.get('modules') as FormArray;
  }

  getLessonsFormArray(moduleIndex: number) {
    return this.modulesFormArray.at(moduleIndex).get('lessons') as FormArray;
  }

  addModule() {
    const moduleForm = this.fb.group({
      id: ['m-' + Date.now()],
      title: ['', Validators.required],
      lessons: this.fb.array([])
    });
    this.modulesFormArray.push(moduleForm);
  }

  removeModule(index: number) {
    this.modulesFormArray.removeAt(index);
  }

  addLesson(moduleIndex: number) {
    const lessonForm = this.fb.group({
      id: ['l-' + Date.now()],
      title: ['', Validators.required],
      type: ['video', Validators.required],
      duration: ['15 min'],
      url: [''],
      content: ['']
    });
    this.getLessonsFormArray(moduleIndex).push(lessonForm);
  }

  removeLesson(moduleIndex: number, lessonIndex: number) {
    this.getLessonsFormArray(moduleIndex).removeAt(lessonIndex);
  }

  formatEduStatus(status: string | undefined): string {
    const map: Record<string, string> = {
      'university': 'Estudiante Universitario',
      'general': 'Público General',
      'hs-1': '1ro de Secundaria',
      'hs-2': '2do de Secundaria',
      'hs-3': '3ro de Secundaria',
      'hs-4': '4to de Secundaria',
      'hs-5': '5to de Secundaria',
      'hs-6': '6to de Secundaria'
    };
    return status ? (map[status] || 'Desconocido') : 'No definido';
  }

  createUser() {
    if (this.userForm.valid) {
      const { name, email, role } = this.userForm.value;
      this.auth.addUser({
        id: 'user-' + Date.now(),
        name: name!,
        email: email!,
        role: role as any,
        avatarUrl: `https://picsum.photos/seed/${email}/200/200`,
        enrolledCourses: [],
        educationalStatus: 'general'
      });
      this.userForm.reset({ role: 'student' });
      this.showUserForm = false;
    }
  }

  async deleteUser(userId: string) {
    try {
      await this.auth.deleteUser(userId);
      this.ui.success('Usuario eliminado correctamente.');
    } catch (error) {
      this.ui.error('Error al eliminar usuario.');
    }
  }

  startEditUser(user: any) {
    this.expandedUser = user.id;
    this.editingUser = user.id;
    this.editUserForm.patchValue({
      name: user.name,
      email: user.email,
      role: user.role,
      educationalStatus: user.educationalStatus || 'general'
    });
  }

  saveEditUser(id: string) {
    if (this.editUserForm.valid) {
      // Solo actualizamos el rol como se solicitó
      const { role } = this.editUserForm.value;
      this.auth.updateUserById(id, { role: role as any });
      this.editingUser = null;
    }
  }

  createCourse() {
    if (this.courseForm.valid) {
      const formValue = this.courseForm.value;
      
      // Limpiar datos de las lecciones según el tipo
      const cleanedModules = formValue.modules?.map((m: any) => ({
        id: m.id,
        title: m.title,
        lessons: m.lessons.map((l: any) => {
          const baseLesson: any = { id: l.id, title: l.title, type: l.type, duration: l.duration };
          if (l.type === 'video') baseLesson.url = l.url;
          if (l.type === 'reading') baseLesson.content = l.content;
          return baseLesson;
        })
      })) || [];

      this.courseService.addCourse({
        id: 'c-' + Date.now(),
        title: formValue.title!,
        shortDescription: formValue.shortDescription!,
        fullDescription: formValue.fullDescription || formValue.shortDescription!,
        imageUrl: formValue.imageUrl!,
        duration: formValue.duration!,
        level: formValue.level!,
        learningObjectives: ['Aprender los conceptos principales de ' + formValue.title],
        modules: cleanedModules
      });
      
      // Reiniciar formulario completamente
      this.courseForm.reset({ 
        level: 'Básico', 
        imageUrl: 'https://picsum.photos/seed/new/600/400' 
      });
      this.modulesFormArray.clear();
      
      this.showCourseForm = false;
    }
  }

  logout() {
    this.auth.logout();
  }
}
