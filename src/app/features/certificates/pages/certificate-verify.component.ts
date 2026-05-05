import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CertificateService } from '../../../services/certificate.service';
import { Certificate } from '../../../models/certificate.model';

@Component({
  selector: 'app-certificate-verify',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  template: `
    <div class="min-h-screen bg-surface-50 flex flex-col items-center justify-center p-4 md:p-8">
      
      <!-- Back to platform -->
      <a routerLink="/" class="absolute top-8 left-8 flex items-center gap-2 text-text-muted hover:text-primary-600 transition-colors font-bold text-sm">
        <mat-icon>arrow_back</mat-icon> Volver a NOVA Academy
      </a>

      <div class="w-full max-w-2xl bg-surface rounded-[2rem] shadow-premium p-8 md:p-12 relative overflow-hidden">
        
        <!-- Loading State -->
        @if (isLoading()) {
          <div class="flex flex-col items-center justify-center py-20 animate-in fade-in">
            <div class="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-6"></div>
            <h2 class="text-xl font-bold text-text-main">Verificando certificado...</h2>
            <p class="text-text-muted text-sm mt-2">Consultando registros criptográficos seguros</p>
          </div>
        } 
        
        <!-- Valid State -->
        @else if (isValid() && cert()) {
          <div class="animate-in fade-in zoom-in-95 duration-500 text-center">
            <div class="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-100">
              <mat-icon class="text-5xl">verified</mat-icon>
            </div>
            
            <h1 class="text-3xl font-black text-text-main mb-2">Certificado Auténtico</h1>
            <p class="text-green-600 font-bold tracking-widest text-sm uppercase mb-8">Validación Exitosa</p>

            <div class="bg-surface-50 border border-border-main rounded-3xl p-6 text-left space-y-4 mb-8">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p class="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Estudiante</p>
                  <p class="text-lg font-bold text-text-main">{{ cert()?.studentName }}</p>
                </div>
                <div>
                  <p class="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Fecha de Emisión</p>
                  <p class="text-lg font-bold text-text-main">{{ cert()?.issueDate | date:'longDate' }}</p>
                </div>
                <div class="md:col-span-2">
                  <p class="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Curso Completado</p>
                  <p class="text-lg font-bold text-text-main text-primary-700">{{ cert()?.courseTitle }}</p>
                </div>
              </div>
            </div>

            <div class="flex flex-col md:flex-row gap-4 items-center justify-between px-6 py-4 bg-surface-50 rounded-2xl border border-border-main">
              <div class="text-left">
                <p class="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Serial Number</p>
                <p class="text-sm font-mono text-text-main">{{ cert()?.serial }}</p>
              </div>
              <div class="text-left md:text-right">
                <p class="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Integrity Hash</p>
                <p class="text-xs font-mono text-text-muted max-w-[200px] truncate" [title]="cert()?.hash">{{ cert()?.hash }}</p>
              </div>
            </div>

            <button routerLink="/certificate/{{ cert()?.id }}" class="mt-8 bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-premium hover:shadow-premium-hover w-full md:w-auto">
              Ver Certificado Original
            </button>
          </div>
        } 
        
        <!-- Invalid State -->
        @else {
          <div class="animate-in fade-in zoom-in-95 duration-500 text-center py-10">
            <div class="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-100">
              <mat-icon class="text-5xl">gpp_bad</mat-icon>
            </div>
            
            <h1 class="text-3xl font-black text-text-main mb-2">Certificado Inválido</h1>
            <p class="text-red-600 font-bold tracking-widest text-sm uppercase mb-8">Fallo de Validación</p>

            <p class="text-text-muted text-lg mb-8 max-w-md mx-auto">
              El identificador proporcionado no coincide con ningún registro criptográfico válido en nuestra base de datos.
            </p>

            <div class="bg-surface-50 p-4 rounded-xl border border-border-main inline-block">
              <p class="text-xs font-bold text-text-muted uppercase">ID Buscado</p>
              <p class="font-mono text-sm mt-1 text-text-main">{{ searchedId() }}</p>
            </div>
            
            <div class="mt-8 pt-8 border-t border-border-main text-center">
              <h3 class="text-text-main font-black tracking-widest text-sm mb-1 uppercase">NOVA Academy</h3>
              <p class="text-text-muted text-xs">Sistema Oficial de Verificación de Credenciales</p>
            </div>
          </div>
        }
        
      </div>
    </div>
  `
})
export class CertificateVerifyComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private certService = inject(CertificateService);

  isLoading = signal(true);
  isValid = signal(false);
  cert = signal<Certificate | null>(null);
  searchedId = signal<string>('');

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.searchedId.set(id);
      try {
        const result = await this.certService.verifyCertificate(id);
        this.isValid.set(result.valid);
        if (result.valid && result.certificate) {
          this.cert.set(result.certificate);
        }
      } catch (e) {
        this.isValid.set(false);
      } finally {
        this.isLoading.set(false);
      }
    } else {
      this.isLoading.set(false);
      this.isValid.set(false);
    }
  }
}
