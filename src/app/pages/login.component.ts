import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { AppSettingsService } from '../services/app-settings.service';
import { AuditService } from '../services/audit.service';
import { SessionService } from '../services/session.service';
import { ActivityTrackerService } from '../services/activity-tracker.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, MatIconModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-surface-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full bg-surface p-10 border border-border-main shadow-premium">
        
        <div class="text-center mb-10">
           @if (settings.siteLogo()) {
             <img [src]="settings.siteLogo()" alt="Logo" class="mx-auto h-20 max-w-[200px] object-contain mb-4">
           } @else {
             <div class="w-16 h-16 bg-primary-100 text-primary-600 flex items-center justify-center mx-auto mb-4 border border-primary-200">
               <mat-icon class="text-4xl w-10 h-10">school</mat-icon>
             </div>
           }
          <h2 class="text-3xl font-black text-text-main tracking-tight uppercase">Bienvenido de nuevo</h2>
          <p class="mt-2 text-[10px] text-text-muted font-black uppercase tracking-widest">
            Aula virtual de {{ settings.siteName() }}
          </p>
        </div>

        <!-- Mensaje de sesión expirada -->
        @if (timeoutMsg()) {
          <div class="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
            <mat-icon class="text-[20px] w-[20px] h-[20px]">timer_off</mat-icon>
            Sesión expirada por inactividad
          </div>
        }

        @if (errorMsg()) {
          <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
            <mat-icon class="text-[20px] w-[20px] h-[20px]">error_outline</mat-icon>
            {{ errorMsg() }}
          </div>
        }

        <!-- Bloqueo por intentos -->
        @if (isLocked()) {
          <div class="bg-red-50 border border-red-300 text-red-800 p-6 mb-6 text-center">
            <mat-icon class="text-4xl text-red-500 mb-2">lock</mat-icon>
            <h3 class="font-black text-lg mb-2 uppercase tracking-tight">Acceso Bloqueado</h3>
            <p class="text-[10px] font-black uppercase tracking-widest">Intenta nuevamente en {{ lockoutMinutes() }} minutos</p>
          </div>
        }

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" novalidate class="space-y-6">
          <div>
            <label for="email" class="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Correo Electrónico</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <mat-icon class="text-text-muted text-[20px] w-[20px] h-[20px]">email</mat-icon>
              </div>
              <input type="email" id="email" formControlName="email" class="w-full pl-10 pr-4 py-4 border border-border-main bg-surface-50 focus:border-primary-600 outline-none transition-all font-medium" placeholder="ejemplo@correo.com">
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between mb-2">
              <label for="password" class="block text-[10px] font-black text-text-muted uppercase tracking-widest">Contraseña</label>
              <a routerLink="/forgot-password" class="text-[10px] font-black text-primary-600 uppercase tracking-widest hover:text-primary-500">¿Olvidaste tu contraseña?</a>
            </div>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <mat-icon class="text-text-muted text-[20px] w-[20px] h-[20px]">lock</mat-icon>
              </div>
              <input [type]="showPassword() ? 'text' : 'password'" id="password" formControlName="password" class="w-full pl-10 pr-12 py-4 border border-border-main bg-surface-50 focus:border-primary-600 outline-none transition-all font-medium" placeholder="••••••••">
              <button type="button" (click)="showPassword.set(!showPassword())" class="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text-main transition-colors">
                <mat-icon class="text-[20px] w-[20px] h-[20px]">{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
            </div>
          </div>

          <button type="submit" [disabled]="loginForm.invalid || isLocked() || isSubmitting()" class="w-full flex justify-center items-center gap-2 py-4 px-4 shadow-md text-xs font-black text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-widest">
            @if (isSubmitting()) {
              <div class="w-4 h-4 border-2 border-white border-t-transparent animate-spin mr-2"></div>
              Verificando...
            } @else {
              Iniciar Sesión
            }
          </button>
        </form>

        <div class="mt-8 text-center text-[10px] font-black text-text-muted uppercase tracking-widest">
          ¿No tienes una cuenta? 
          <a routerLink="/register" class="text-primary-600 hover:text-primary-500">Regístrate aquí</a>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit {
  fb = inject(FormBuilder);
  auth = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  settings = inject(AppSettingsService);
  audit = inject(AuditService);
  session = inject(SessionService);
  tracker = inject(ActivityTrackerService);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(3)]]
  });

  errorMsg = signal('');
  timeoutMsg = signal(false);
  showPassword = signal(false);
  isSubmitting = signal(false);
  isLocked = signal(false);
  lockoutMinutes = signal(0);

  // Claves ofuscadas para dificultar manipulación
  private readonly RATE_KEY = btoa('nova_secure_limit_att');
  private readonly LOCKOUT_KEY = btoa('nova_secure_limit_loc');

  ngOnInit() {
    // Check if redirected from session timeout
    const reason = this.route.snapshot.queryParamMap.get('reason');
    if (reason === 'timeout') {
      this.timeoutMsg.set(true);
    }
    this.checkLockout();
  }

  async onSubmit() {
    if (this.loginForm.invalid || this.isLocked()) return;

    this.isSubmitting.set(true);
    this.errorMsg.set('');

    const { email, password } = this.loginForm.value;

    try {
      const success = await this.auth.login(email!, password!);

      if (success) {
        this.resetAttempts();
        this.session.initialize();

        const user = this.auth.currentUser();
        this.audit.log({
          userId: user?.id,
          userName: user?.name,
          role: user?.role,
          action: 'login',
          entityType: 'session',
          status: 'success'
        });

        this.tracker.track('login', 'Inicio de sesión exitoso', 'session', user?.id || '');

        if (user?.role === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/profile']);
        }
      } else {
        const attempts = await this.incrementAttempts();

        this.audit.log({
          action: 'failed_login',
          entityType: 'auth',
          entityId: email || '',
          status: 'failure',
          error: 'Invalid credentials'
        });

        this.tracker.track('failed_login', 'Intento de login fallido para: ' + email, 'auth', email || '');

        this.errorMsg.set('Las credenciales ingresadas no son válidas.');

        if (attempts >= 10) {
          this.lockout(30);
        } else if (attempts >= 5) {
          this.lockout(5);
        }
      }
    } catch (error) {
      console.error('Login Error:', error);
      this.errorMsg.set('Ocurrió un error al intentar iniciar sesión.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private async incrementAttempts(): Promise<number> {
    try {
      const raw = localStorage.getItem(this.RATE_KEY) || btoa('0');
      const current = parseInt(atob(raw), 10);
      const next = current + 1;
      localStorage.setItem(this.RATE_KEY, btoa(String(next)));
      
      // Tarpitting: Delay artificial progresivo
      if (next > 2) {
        await new Promise(resolve => setTimeout(resolve, next * 1000));
      }
      return next;
    } catch {
      return 0;
    }
  }

  private resetAttempts() {
    try {
      localStorage.removeItem(this.RATE_KEY);
      localStorage.removeItem(this.LOCKOUT_KEY);
    } catch {}
  }

  private lockout(minutes: number) {
    const until = Date.now() + minutes * 60 * 1000;
    localStorage.setItem(this.LOCKOUT_KEY, String(until));
    this.isLocked.set(true);
    this.lockoutMinutes.set(minutes);
  }

  private checkLockout() {
    try {
      const until = parseInt(localStorage.getItem(this.LOCKOUT_KEY) || '0', 10);
      if (until > Date.now()) {
        this.isLocked.set(true);
        this.lockoutMinutes.set(Math.ceil((until - Date.now()) / 60000));
      } else if (until > 0) {
        // Lockout expired — clear
        localStorage.removeItem(this.LOCKOUT_KEY);
        localStorage.removeItem(this.RATE_KEY);
      }
    } catch {}
  }
}
