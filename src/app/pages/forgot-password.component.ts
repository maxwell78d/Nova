import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { AppSettingsService } from '../services/app-settings.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, MatIconModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-surface-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full bg-surface p-10 border border-border-main shadow-premium animate-in fade-in zoom-in-95 duration-500">
        
        <div class="text-center mb-10">
           <div class="w-16 h-16 bg-primary-50 text-primary-600 flex items-center justify-center mx-auto mb-4 rounded-full border border-primary-100">
             <mat-icon class="text-3xl">lock_reset</mat-icon>
           </div>
          <h2 class="text-3xl font-black text-text-main tracking-tight uppercase">Recuperar Acceso</h2>
          <p class="mt-2 text-[10px] text-text-muted font-black uppercase tracking-widest leading-relaxed">
            Ingresa tu correo y te enviaremos un enlace <br> para restablecer tu contraseña.
          </p>
        </div>

        @if (status() === 'success') {
          <div class="bg-green-50 border border-green-200 p-8 text-center mb-8 animate-in slide-in-from-top-4">
            <mat-icon class="text-5xl text-green-500 mb-4">mark_email_read</mat-icon>
            <h3 class="font-black text-green-900 uppercase text-lg mb-2">¡Enlace Enviado!</h3>
            <p class="text-sm text-green-700 font-medium mb-6">Hemos enviado las instrucciones a tu correo electrónico.</p>
            
            <div class="bg-white/50 p-4 border border-green-100 text-left rounded-xl mb-6">
              <h4 class="text-[10px] font-black text-green-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                <mat-icon class="text-sm">info</mat-icon> ¿No recibes el correo?
              </h4>
              <ul class="text-[10px] text-green-700 space-y-1.5 font-bold uppercase tracking-tight">
                <li>• Revisa tu carpeta de <strong>Spam</strong> o Correo no deseado.</li>
                <li>• Asegúrate de que el correo sea el correcto.</li>
                <li>• Espera al menos 5 minutos antes de reintentar.</li>
              </ul>
            </div>

            <button routerLink="/login" class="w-full py-4 bg-green-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg shadow-green-200">
              Volver al Inicio de Sesión
            </button>
          </div>
        } @else {
          <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()" class="space-y-6">
            @if (errorMsg()) {
              <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                <mat-icon class="text-sm">error_outline</mat-icon>
                {{ errorMsg() }}
              </div>
            }

            <div>
              <label for="email" class="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Correo Electrónico</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <mat-icon class="text-text-muted text-[20px]">email</mat-icon>
                </div>
                <input type="email" id="email" formControlName="email" 
                       class="w-full pl-10 pr-4 py-4 border border-border-main bg-surface-50 focus:border-primary-600 outline-none transition-all font-medium" 
                       placeholder="ejemplo@correo.com">
              </div>
            </div>

            <button type="submit" [disabled]="forgotForm.invalid || isSubmitting()" 
                    class="w-full flex justify-center items-center gap-2 py-4 px-4 shadow-md text-xs font-black text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 transition-all uppercase tracking-widest group">
              @if (isSubmitting()) {
                <div class="w-4 h-4 border-2 border-white border-t-transparent animate-spin mr-2"></div>
                Procesando...
              } @else {
                Enviar Enlace de Recuperación
                <mat-icon class="group-hover:translate-x-1 transition-transform">arrow_forward</mat-icon>
              }
            </button>

            <div class="text-center">
              <a routerLink="/login" class="text-[10px] font-black text-text-muted uppercase tracking-widest hover:text-primary-600 transition-colors">
                ¿Recordaste tu contraseña? <span class="text-primary-600">Inicia sesión</span>
              </a>
            </div>
          </form>
        }
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  fb = inject(FormBuilder);
  auth = inject(AuthService);
  settings = inject(AppSettingsService);

  forgotForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  isSubmitting = signal(false);
  errorMsg = signal('');
  status = signal<'idle' | 'success'>('idle');

  async onSubmit() {
    if (this.forgotForm.invalid) return;
    
    this.isSubmitting.set(true);
    this.errorMsg.set('');

    try {
      const success = await this.auth.resetPassword(this.forgotForm.value.email!);
      if (success) {
        this.status.set('success');
      } else {
        this.errorMsg.set('No pudimos encontrar una cuenta con ese correo.');
      }
    } catch (e) {
      this.errorMsg.set('Ocurrió un error inesperado. Inténtalo más tarde.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
