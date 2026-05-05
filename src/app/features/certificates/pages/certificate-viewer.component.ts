import { Component, inject, OnInit, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CertificateService } from '../../../services/certificate.service';
import { UiService } from '../../../services/ui.service';
import { Certificate } from '../../../models/certificate.model';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-certificate-viewer',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterLink],
  template: `
    <div class="min-h-screen bg-[#f1f5f9] flex flex-col items-center py-8 px-4">
      
      <!-- Toolbar -->
      <div class="w-full max-w-6xl flex justify-between items-center mb-8 bg-white p-4 shadow-sm border border-[#e2e8f0]">
        <button (click)="goBack()" class="text-[#64748b] hover:text-primary-600 font-bold flex items-center gap-2 transition-colors">
          <mat-icon>arrow_back</mat-icon> Volver al Dashboard
        </button>
        <div class="flex gap-4">
          <button (click)="downloadPDF()" [disabled]="isGenerating()" class="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50">
            @if(isGenerating()) {
              <mat-icon class="animate-spin">autorenew</mat-icon> Generando PDF Seguro...
            } @else {
              <mat-icon>picture_as_pdf</mat-icon> Descargar PDF Oficial
            }
          </button>
        </div>
      </div>

      @if (isLoading()) {
        <div class="flex items-center justify-center py-40">
          <div class="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      } @else if (cert(); as c) {
        
        <!-- Vista Previa Contenedor Responsive -->
        <div class="w-full max-w-6xl overflow-auto custom-scrollbar pb-8">
            <!-- Contenedor Real para Captura (Tamaño A4 Apaisado 1123x794 px a 96DPI) -->
            <div #certificateNode id="certificate-node" class="relative bg-white shadow-2xl mx-auto overflow-hidden" style="width: 1123px; height: 794px; flex-shrink: 0;">
            
              <!-- Marcos Elegantes (Cuadrados, sin redondeo) -->
              <div class="absolute inset-3 border border-[#e2e8f0] pointer-events-none z-10"></div>
              <div class="absolute inset-4 border-2 border-[#0f172a] pointer-events-none z-10"></div>
              <div class="absolute inset-5 border border-[#e2e8f0] pointer-events-none z-10"></div>

              <!-- Decoraciones en Esquinas -->
              <div class="absolute top-4 left-4 w-20 h-20 border-t-[3px] border-l-[3px] border-primary-600 pointer-events-none z-10"></div>
              <div class="absolute top-4 right-4 w-20 h-20 border-t-[3px] border-r-[3px] border-primary-600 pointer-events-none z-10"></div>
              <div class="absolute bottom-4 left-4 w-20 h-20 border-b-[3px] border-l-[3px] border-primary-600 pointer-events-none z-10"></div>
              <div class="absolute bottom-4 right-4 w-20 h-20 border-b-[3px] border-r-[3px] border-primary-600 pointer-events-none z-10"></div>

              <!-- Fondo Guilloche / Watermark -->
              <div class="absolute inset-0 opacity-[0.03] pointer-events-none z-0 flex items-center justify-center">
                <svg width="600" height="600" viewBox="0 0 100 100" class="text-primary-900 rotate-12">
                  <path d="M50 0 L100 25 L100 75 L50 100 L0 75 L0 25 Z" fill="none" stroke="currentColor" stroke-width="0.5"/>
                  <rect x="15" y="15" width="70" height="70" fill="none" stroke="currentColor" stroke-width="0.3"/>
                  <rect x="25" y="25" width="50" height="50" fill="none" stroke="currentColor" stroke-width="0.2" stroke-dasharray="2 2"/>
                </svg>
              </div>

                <!-- Contenido Principal -->
                <div class="flex flex-col items-center text-center px-20 py-10 flex-grow justify-center">
                  
                  <!-- Logo Superior -->
                  <div class="flex items-center gap-4 mb-10">
                    <div class="w-14 h-14 bg-[#0f172a] text-white flex items-center justify-center shadow-lg">
                      <svg viewBox="0 0 24 24" fill="currentColor" class="w-10 h-10">
                        <path d="M5 13.18v2.81c0 .73.4 1.41 1.04 1.76l5 2.73c.6.33 1.32.33 1.92 0l5-2.73c.64-.35 1.04-1.03 1.04-1.76v-2.81l-6.04 3.3c-.6.33-1.32.33-1.92 0L5 13.18zm7.04-4.13L18.14 12l-6.1 3.33-6.18-3.37L12.04 9.05zM12 3L2 8.45l10 5.45 10-5.45L12 3z"/>
                      </svg>
                    </div>
                    <div class="text-left">
                      <h2 class="text-[#0f172a] font-sans font-black text-2xl tracking-[0.2em] leading-none uppercase">ESTRELLA NUEVA</h2>
                      <h3 class="text-[#3b82f6] font-sans font-bold text-xs tracking-[0.3em] uppercase leading-none mt-1">Academia</h3>
                    </div>
                  </div>

                  <p [style.color]="'#64748b'" class="text-[10px] font-black uppercase tracking-[0.3em] mb-10">Certificado Oficial de Finalización</p>
                  
                  <p [style.color]="'#334155'" class="text-lg font-serif italic mb-4">Otorgado a:</p>

                  <h2 [style.color]="'#0f172a'" class="text-6xl font-black mb-8 leading-none tracking-tight">
                    {{ c.studentName }}
                  </h2>

                  <div class="w-24 h-1 mb-8" [style.backgroundColor]="'#3b82f6'"></div>

                  <p [style.color]="'#475569'" class="text-base font-sans leading-relaxed max-w-2xl mb-4">
                    Por haber completado satisfactoriamente los requisitos académicos del programa de formación profesional de:
                  </p>

                  <h3 [style.color]="'#6d28d9'" class="text-3xl font-black mb-10 uppercase tracking-tight leading-tight">
                    {{ c.courseTitle }}
                  </h3>

                  <!-- Calificación -->
                  <div class="flex items-center gap-4 bg-white border px-8 py-3"
                       [style.borderColor]="c.finalScore >= 70 ? '#bbf7d0' : '#fecaca'"
                       style="border-radius: 4px;">
                    <mat-icon [style.color]="c.finalScore >= 70 ? '#15803d' : '#b91c1c'" class="text-2xl">verified_user</mat-icon>
                    <div class="text-left">
                      <p [style.color]="'#64748b'" class="text-[8px] font-black uppercase tracking-widest leading-none mb-1">Calificación Académica</p>
                      <p class="text-lg font-black leading-none" [style.color]="'#0f172a'">
                        {{ c.finalScore }} / 100 — <span [style.color]="c.finalScore >= 70 ? '#15803d' : '#b91c1c'">{{ getGradeLabel(c.finalScore) }}</span>
                      </p>
                    </div>
                  </div>
                </div>
                <!-- Footer del Certificado -->
                <div class="flex w-full justify-between items-end mt-auto px-6 pb-6">
                  
                  <!-- Firma Izquierda -->
                  <div class="flex flex-col items-center w-64">
                    <div class="w-48 h-16 border-b-2 mb-3 flex items-end justify-center relative" [style.borderColor]="'#cbd5e1'">
                      <svg class="absolute bottom-2 w-40 h-14" [style.color]="'#0f172a'" viewBox="0 0 200 60" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                        <path d="M 10 40 Q 30 10 45 30 T 75 25 T 110 45 T 150 20 Q 170 30 185 15" />
                      </svg>
                    </div>
                    <p class="text-sm font-black" [style.color]="'#0f172a'">{{ c.instructorName }}</p>
                    <p class="text-[10px] font-bold uppercase tracking-widest mt-1" [style.color]="'#64748b'">{{ c.instructorRole }}</p>
                  </div>

                  <!-- Sello Central -->
                  <div class="w-32 h-32 relative flex flex-col items-center justify-center shrink-0">
                    <svg viewBox="0 0 100 100" class="absolute inset-0 w-full h-full" [style.color]="'#fbbf24'">
                      <path d="M 50 2 L 55 9 L 63 6 L 66 14 L 74 13 L 75 21 L 83 23 L 81 31 L 88 35 L 84 42 L 91 48 L 86 54 L 91 61 L 84 66 L 88 74 L 81 77 L 83 85 L 75 87 L 74 95 L 66 94 L 63 102 L 55 99 L 50 106 L 45 99 L 37 102 L 34 94 L 26 95 L 25 87 L 17 85 L 19 77 L 12 74 L 16 66 L 9 61 L 14 54 L 9 48 L 16 42 L 12 35 L 19 31 L 17 23 L 25 21 L 26 13 L 34 14 L 37 6 L 45 9 Z" fill="currentColor"/>
                      <rect x="15" y="15" width="70" height="70" fill="white"/>
                    </svg>
                    <div class="z-10 flex flex-col items-center mt-1" [style.color]="'#b45309'">
                      <svg viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 mb-0.5">
                        <path d="M23,12L20.56,9.22L20.9,5.54L17.29,4.72L15.4,1.54L12,3L8.6,1.54L6.71,4.72L3.1,5.53L3.44,9.21L1,12L3.44,14.78L3.1,18.47L6.71,19.29L8.6,22.47L12,21L15.4,22.46L17.29,19.28L20.9,18.46L20.56,14.78L23,12M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9L10,17Z"/>
                      </svg>
                      <span class="text-[7px] font-black tracking-[0.2em] uppercase leading-none">Validado</span>
                      <span class="text-[6px] font-bold tracking-widest uppercase leading-none mt-1">{{ c.issueDate | date:'yyyy' }}</span>
                    </div>
                  </div>

                  <!-- Info & QR Derecha -->
                  <div class="flex flex-col items-end w-64 text-right">
                    <div class="flex gap-4 items-center">
                      <div class="text-right">
                        <p class="text-[9px] text-[#64748b] uppercase tracking-widest mb-0.5">Fecha de Emisión</p>
                        <p class="text-xs font-bold text-[#0f172a] mb-3">{{ c.issueDate | date:'longDate' }}</p>
                        <p class="text-[9px] text-[#64748b] uppercase tracking-widest mb-0.5">ID Verificación</p>
                        <p class="text-[10px] font-mono font-bold text-[#6d28d9]">{{ c.serial }}</p>
                      </div>
                      
                      <!-- QR Real Renderizado Dinámicamente -->
                      <div class="w-20 h-20 bg-white p-1 border border-[#e2e8f0] shadow-sm">
                        <img [src]="qrCodeDataUrl()" alt="QR Verification" class="w-full h-full object-contain">
                      </div>
                    </div>
                    <p class="text-[8px] text-[#94a3b8] mt-3">Verificar autenticidad escaneando el código QR</p>
                  </div>

                </div>
            </div>
          </div>
        
        <div class="mt-8 text-center text-sm text-text-muted bg-white p-4 border border-[#e2e8f0]">
          Enlace permanente de verificación: <br>
          <a [routerLink]="['/verify', c.id]" class="text-primary-600 font-bold hover:underline">
            {{ getVerificationUrl(c.id) }}
          </a>
        </div>
      } @else {
        <div class="text-center py-20 text-red-600">
          <mat-icon class="text-5xl mb-4">error_outline</mat-icon>
          <h2 class="text-2xl font-bold">Certificado no encontrado</h2>
        </div>
      }
    </div>
  `
})
export class CertificateViewerComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private certService = inject(CertificateService);
  private ui = inject(UiService);

  @ViewChild('certificateNode') certificateNode!: ElementRef;

  cert = signal<Certificate | null>(null);
  isLoading = signal(true);
  isGenerating = signal(false);
  qrCodeDataUrl = signal<string>('');

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      try {
        const result = await this.certService.getCertificate(id);
        this.cert.set(result);
        await this.generateQR(result.id);
      } catch (e) {
        // Certificate not found — handled by template
      }
    }
    this.isLoading.set(false);
  }

  /**
   * Returns a coherent grade label based on score ranges.
   */
  getGradeLabel(score: number): string {
    if (score >= 90) return 'Aprobado con Excelencia';
    if (score >= 80) return 'Aprobado con Distinción';
    if (score >= 70) return 'Aprobado';
    return 'No Aprobado';
  }

  /**
   * Generates the absolute verification URL.
   */
  getVerificationUrl(id: string): string {
    const origin = window.location.origin;
    // For consistency, ensure no trailing slash
    const cleanOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
    return `${cleanOrigin}/verify/${id}`;
  }

  async generateQR(id: string) {
    try {
      const verifyUrl = this.getVerificationUrl(id);
      const url = await QRCode.toDataURL(verifyUrl, {
        width: 150,
        margin: 1,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      });
      this.qrCodeDataUrl.set(url);
    } catch (err) {
      console.error('QR Generation Error:', err);
    }
  }

  goBack() {
    window.history.back();
  }

  async downloadPDF() {
    if (!this.certificateNode || !this.cert()) return;
    
    this.isGenerating.set(true);
    try {
      // Asegurar que el scroll esté arriba para evitar capturas desplazadas
      window.scrollTo(0, 0);
      
      // Pequeño retardo para asegurar renderizado de imágenes y QR
      await new Promise(resolve => setTimeout(resolve, 500));

      const element = this.certificateNode.nativeElement;
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: '#ffffff',
        imageTimeout: 15000,
        width: 1123,
        height: 794,
        scrollX: 0,
        scrollY: -window.scrollY, // Corregir offset de scroll
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('certificate-node');
          if (el) {
            el.style.display = 'block';
            el.style.visibility = 'visible';
          }
        }
      });

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

      const filename = `CERT_NOVA_${this.cert()?.studentName.replace(/\s+/g, '_')}.pdf`;
      pdf.save(filename);
      this.ui.success('Certificado descargado correctamente.');

    } catch (e) {
      console.error('PDF Generation Error:', e);
      this.ui.error('Hubo un error al generar el PDF. Por favor, intenta de nuevo.');
    } finally {
      this.isGenerating.set(false);
    }
  }
}
