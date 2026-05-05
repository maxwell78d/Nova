import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Auth, applyActionCode } from '@angular/fire/auth';

@Component({
  selector: 'app-auth-action',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-surface-50 py-12 px-4">
      <div class="max-w-md w-full bg-surface p-10 border border-border-main shadow-premium animate-in fade-in zoom-in-95 duration-500">

        @if (loading()) {
          <div class="flex flex-col items-center py-12">
            <div class="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
            <p class="text-text-muted font-medium">Procesando tu solicitud...</p>
          </div>
        }

        @if (status() === 'verify-success') {
          <div class="text-center">
            <div class="w-20 h-20 bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-6 rounded-full">
              <mat-icon class="text-4xl w-10 h-10">verified</mat-icon>
            </div>
            <h2 class="text-2xl font-black text-text-main uppercase tracking-tight mb-2">¡Correo Verificado!</h2>
            <p class="text-text-muted mb-8">Tu dirección de correo ha sido verificada exitosamente. Ya puedes iniciar sesión.</p>
            <a routerLink="/login" class="inline-block w-full py-4 bg-primary-600 text-white font-black text-xs uppercase tracking-widest hover:bg-primary-700 transition-all text-center">
              Iniciar Sesión
            </a>
          </div>
        }

        @if (status() === 'recover-success') {
          <div class="text-center">
            <div class="w-20 h-20 bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-6 rounded-full">
              <mat-icon class="text-4xl w-10 h-10">email</mat-icon>
            </div>
            <h2 class="text-2xl font-black text-text-main uppercase tracking-tight mb-2">Correo Restaurado</h2>
            <p class="text-text-muted mb-8">Tu dirección de correo ha sido restaurada correctamente.</p>
            <a routerLink="/login" class="inline-block w-full py-4 bg-primary-600 text-white font-black text-xs uppercase tracking-widest hover:bg-primary-700 transition-all text-center">
              Iniciar Sesión
            </a>
          </div>
        }

        @if (status() === 'error') {
          <div class="text-center">
            <div class="w-20 h-20 bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-6 rounded-full">
              <mat-icon class="text-4xl w-10 h-10">error</mat-icon>
            </div>
            <h2 class="text-2xl font-black text-text-main uppercase tracking-tight mb-2">Enlace Inválido</h2>
            <p class="text-text-muted mb-6">{{ errorMessage() }}</p>
            <div class="space-y-3">
              <a routerLink="/forgot-password" class="block w-full py-4 bg-primary-600 text-white font-black text-xs uppercase tracking-widest hover:bg-primary-700 transition-all text-center">
                Solicitar Nuevo Enlace
              </a>
              <a routerLink="/login" class="block w-full py-3 border border-border-main text-text-main font-black text-xs uppercase tracking-widest hover:bg-surface-50 transition-all text-center">
                Volver al Login
              </a>
            </div>
          </div>
        }

      </div>
    </div>
  `
})
export class AuthActionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(Auth);

  loading = signal(true);
  status = signal<'idle' | 'verify-success' | 'recover-success' | 'error'>('idle');
  errorMessage = signal('');

  async ngOnInit() {
    const mode = this.route.snapshot.queryParamMap.get('mode');
    const oobCode = this.route.snapshot.queryParamMap.get('oobCode');

    if (!mode || !oobCode) {
      this.status.set('error');
      this.errorMessage.set('El enlace es inválido o está incompleto.');
      this.loading.set(false);
      return;
    }

    try {
      switch (mode) {
        case 'resetPassword':
          // Redirect to dedicated reset password page with the code
          this.router.navigate(['/reset-password'], {
            queryParams: { oobCode },
            replaceUrl: true
          });
          return;

        case 'verifyEmail':
          await applyActionCode(this.auth, oobCode);
          this.status.set('verify-success');
          break;

        case 'recoverEmail':
          await applyActionCode(this.auth, oobCode);
          this.status.set('recover-success');
          break;

        default:
          this.status.set('error');
          this.errorMessage.set('Acción no reconocida.');
      }
    } catch (e: any) {
      this.status.set('error');
      if (e.code === 'auth/expired-action-code') {
        this.errorMessage.set('Este enlace ha expirado. Por favor, solicita uno nuevo.');
      } else if (e.code === 'auth/invalid-action-code') {
        this.errorMessage.set('Este enlace es inválido o ya fue utilizado.');
      } else {
        this.errorMessage.set('Ocurrió un error al procesar tu solicitud. Inténtalo de nuevo.');
      }
    } finally {
      this.loading.set(false);
    }
  }
}
