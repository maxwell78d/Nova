import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../services/auth.service';
import { UiService } from '../services/ui.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatIconModule],
  template: `
    <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div class="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <!-- Logo -->
        <div class="flex flex-col items-center mb-8">
          <div class="w-16 h-16 bg-primary-600 text-white rounded-2xl flex items-center justify-center shadow-lg mb-4 transform -rotate-3">
            <mat-icon class="text-3xl">lock_reset</mat-icon>
          </div>
          <h1 class="text-2xl font-black text-slate-900 uppercase tracking-tight">Nueva Contraseña</h1>
          <p class="text-slate-500 text-center mt-2">Introduce tu nueva clave de acceso para Nova Academy</p>
        </div>

        @if (isVerifying()) {
          <div class="flex flex-col items-center py-12">
            <div class="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
            <p class="text-slate-600 font-medium">Verificando código de seguridad...</p>
          </div>
        } @else if (error(); as err) {
          <div class="text-center py-8">
            <div class="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <mat-icon class="text-3xl w-8 h-8">error</mat-icon>
            </div>
            <h3 class="font-black text-lg text-slate-900 mb-2 uppercase tracking-tight">Enlace Inválido</h3>
            <p class="text-red-600 font-medium mb-6">{{ err }}</p>
            <div class="space-y-3">
              <a routerLink="/forgot-password" class="block w-full py-4 bg-primary-600 text-white font-black text-xs uppercase tracking-widest hover:bg-primary-700 transition-all text-center rounded-xl">
                Solicitar Nuevo Enlace
              </a>
              <a routerLink="/login" class="block w-full py-3 border border-slate-200 text-slate-700 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all text-center rounded-xl">
                Volver al Login
              </a>
            </div>
          </div>
        } @else if (resetSuccess()) {
          <div class="text-center py-8">
            <div class="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <mat-icon class="text-4xl w-10 h-10">check_circle</mat-icon>
            </div>
            <h3 class="font-black text-xl text-slate-900 mb-2 uppercase tracking-tight">¡Contraseña Actualizada!</h3>
            <p class="text-slate-500 mb-8">Tu contraseña ha sido cambiada exitosamente. Ya puedes iniciar sesión con tu nueva clave.</p>
            <a routerLink="/login" class="block w-full py-4 bg-green-600 text-white font-black text-xs uppercase tracking-widest hover:bg-green-700 transition-all text-center rounded-xl shadow-lg shadow-green-200">
              Iniciar Sesión
            </a>
          </div>
        } @else {
          @if (verifiedEmail()) {
            <div class="bg-blue-50 border border-blue-100 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
              <mat-icon class="text-blue-500 text-[18px]">email</mat-icon>
              <span class="text-sm text-blue-700 font-medium">Restablecer contraseña para: <strong>{{ verifiedEmail() }}</strong></span>
            </div>
          }

          <form [formGroup]="resetForm" (ngSubmit)="onSubmit()" class="space-y-6" novalidate>
            <!-- Password -->
            <div>
              <label class="block text-sm font-black text-slate-700 uppercase tracking-wider mb-2">Contraseña Nueva</label>
              <div class="relative group">
                <mat-icon class="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-primary-500 transition-colors">lock</mat-icon>
                <input 
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="password"
                  placeholder="Mínimo 8 caracteres"
                  class="w-full pl-12 pr-12 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-primary-500 focus:bg-white outline-none transition-all font-medium"
                >
                <button 
                  type="button"
                  (click)="showPassword.set(!showPassword())"
                  class="absolute right-4 top-3.5 text-slate-400 hover:text-primary-500 transition-colors"
                >
                  <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
              </div>
              @if (resetForm.get('password')?.touched && resetForm.get('password')?.invalid) {
                <p class="text-xs text-red-500 mt-2 font-bold px-1 italic">La contraseña debe tener al menos 8 caracteres</p>
              }
            </div>

            <!-- Confirm Password -->
            <div>
              <label class="block text-sm font-black text-slate-700 uppercase tracking-wider mb-2">Confirmar Contraseña</label>
              <div class="relative group">
                <mat-icon class="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-primary-500 transition-colors">verified_user</mat-icon>
                <input 
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="confirmPassword"
                  placeholder="Repite tu contraseña"
                  class="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-primary-500 focus:bg-white outline-none transition-all font-medium"
                >
              </div>
              @if (resetForm.get('confirmPassword')?.touched && resetForm.errors?.['mismatch']) {
                <p class="text-xs text-red-500 mt-2 font-bold px-1 italic">Las contraseñas no coinciden</p>
              }
            </div>

            <!-- Submit Button -->
            <button 
              type="submit" 
              [disabled]="resetForm.invalid || isLoading()"
              class="w-full bg-primary-600 hover:bg-primary-700 text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-primary-200 hover:shadow-primary-300 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-3"
            >
              @if (isLoading()) {
                <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Procesando...
              } @else {
                <mat-icon>check_circle</mat-icon>
                Actualizar Contraseña
              }
            </button>
          </form>
        }
      </div>
    </div>
  `
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);
  private ui = inject(UiService);

  resetForm = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  oobCode: string | null = null;
  isLoading = signal(false);
  isVerifying = signal(true);
  error = signal<string | null>(null);
  showPassword = signal(false);
  resetSuccess = signal(false);
  verifiedEmail = signal<string | null>(null);

  passwordMatchValidator(g: any) {
    return g.get('password').value === g.get('confirmPassword').value ? null : { mismatch: true };
  }

  async ngOnInit() {
    this.oobCode = this.route.snapshot.queryParamMap.get('oobCode');
    
    if (!this.oobCode) {
      this.error.set('El código de seguridad no es válido o ha expirado. Solicita un nuevo enlace de recuperación.');
      this.isVerifying.set(false);
      return;
    }

    try {
      // Verify the code is valid before showing the form
      const email = await this.auth.verifyResetCode(this.oobCode);
      this.verifiedEmail.set(email);
      this.isVerifying.set(false);
    } catch (e: any) {
      if (e.code === 'auth/expired-action-code') {
        this.error.set('Este enlace de recuperación ha expirado. Por favor, solicita uno nuevo.');
      } else if (e.code === 'auth/invalid-action-code') {
        this.error.set('Este enlace de recuperación es inválido o ya fue utilizado.');
      } else {
        this.error.set('No se pudo verificar el código de seguridad. Solicita un nuevo enlace.');
      }
      this.isVerifying.set(false);
    }
  }

  async onSubmit() {
    if (this.resetForm.invalid || !this.oobCode) return;

    this.isLoading.set(true);
    try {
      await this.auth.confirmPasswordReset(this.oobCode, this.resetForm.get('password')?.value!);
      this.resetSuccess.set(true);
    } catch (e: any) {
      if (e.code === 'auth/expired-action-code') {
        this.error.set('El enlace ha expirado mientras completabas el formulario. Solicita uno nuevo.');
      } else if (e.code === 'auth/weak-password') {
        this.ui.error('La contraseña es demasiado débil. Usa al menos 8 caracteres con letras y números.');
      } else {
        this.ui.error('Error al actualizar la contraseña. Es posible que el enlace haya expirado.');
      }
    } finally {
      this.isLoading.set(false);
    }
  }
}
