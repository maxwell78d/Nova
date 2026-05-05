import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AuditService, AuditEntry } from '../../../services/audit.service';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-audit-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, DatePipe, RouterLink],
  template: `
    <div class="p-4 md:p-6 space-y-6 min-h-screen bg-surface-50">

      <!-- Header with Back Button -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div class="flex items-center gap-3">
          <a routerLink="/admin" class="w-10 h-10 bg-surface border border-border-main flex items-center justify-center text-text-muted hover:text-text-main hover:border-primary-300 transition-all shrink-0">
            <mat-icon>arrow_back</mat-icon>
          </a>
          <div>
            <h2 class="text-2xl md:text-3xl font-black text-text-main tracking-tight">Registro de Auditoría</h2>
            <p class="text-text-muted text-xs md:text-sm font-medium">{{ totalEntries() }} eventos registrados</p>
          </div>
        </div>
        <div class="flex gap-2 w-full sm:w-auto">
          <button (click)="exportPDF()" class="flex-1 sm:flex-none bg-red-600 text-white px-4 py-2 font-bold flex items-center justify-center gap-2 hover:bg-red-700 transition-colors text-sm">
            <mat-icon class="text-[18px] w-[18px] h-[18px]">picture_as_pdf</mat-icon> PDF
          </button>
          <button (click)="exportCSV()" class="flex-1 sm:flex-none bg-surface border border-border-main text-text-main px-4 py-2 font-bold flex items-center justify-center gap-2 hover:bg-surface-100 transition-colors text-sm">
            <mat-icon class="text-[18px] w-[18px] h-[18px]">download</mat-icon> CSV
          </button>
          <button (click)="refreshData()" class="flex-1 sm:flex-none bg-primary-600 text-white px-4 py-2 font-bold flex items-center justify-center gap-2 hover:bg-primary-700 transition-colors text-sm">
            <mat-icon class="text-[18px] w-[18px] h-[18px]">refresh</mat-icon> Actualizar
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-surface border border-border-main p-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label class="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1 block">Acción</label>
            <select [(ngModel)]="filterAction" (ngModelChange)="applyFilters()" class="w-full px-3 py-2 bg-surface-50 border border-border-main text-sm outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">Todas</option>
              <option value="login">Login</option>
              <option value="failed_login">Login Fallido</option>
              <option value="logout">Logout</option>
              <option value="course_started">Curso Iniciado</option>
              <option value="quiz_completed">Quiz Completado</option>
              <option value="certificate_generated">Certificado</option>
              <option value="profile_updated">Perfil Actualizado</option>
              <option value="theme_changed">Tema Cambiado</option>
            </select>
          </div>
          <div>
            <label class="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1 block">Estado</label>
            <select [(ngModel)]="filterStatus" (ngModelChange)="applyFilters()" class="w-full px-3 py-2 bg-surface-50 border border-border-main text-sm outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">Todos</option>
              <option value="success">Éxito</option>
              <option value="failure">Fallo</option>
              <option value="warning">Advertencia</option>
            </select>
          </div>
          <div>
            <label class="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1 block">Búsqueda</label>
            <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="applyFilters()" placeholder="Usuario, IP, acción..." class="w-full px-3 py-2 bg-surface-50 border border-border-main text-sm outline-none focus:ring-2 focus:ring-primary-500">
          </div>
          <div class="flex items-end">
            <button (click)="clearFilters()" class="w-full px-3 py-2 text-sm font-bold text-text-muted hover:text-text-main border border-border-main hover:bg-surface-100 transition-colors">
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-surface border border-border-main overflow-hidden">
        <div class="overflow-x-auto max-h-[65vh] overflow-y-auto">
          <table class="w-full text-sm min-w-[700px]">
            <thead class="sticky top-0 z-10">
              <tr class="border-b border-border-main bg-surface-50">
                <th class="px-3 md:px-4 py-3 text-left font-black text-text-muted text-[10px] uppercase tracking-widest">Fecha</th>
                <th class="px-3 md:px-4 py-3 text-left font-black text-text-muted text-[10px] uppercase tracking-widest">Usuario</th>
                <th class="px-3 md:px-4 py-3 text-left font-black text-text-muted text-[10px] uppercase tracking-widest">Acción</th>
                <th class="px-3 md:px-4 py-3 text-left font-black text-text-muted text-[10px] uppercase tracking-widest">Estado</th>
                <th class="px-3 md:px-4 py-3 text-left font-black text-text-muted text-[10px] uppercase tracking-widest">Navegador</th>
                <th class="px-3 md:px-4 py-3 text-left font-black text-text-muted text-[10px] uppercase tracking-widest">Dispositivo</th>
                <th class="px-3 md:px-4 py-3 text-left font-black text-text-muted text-[10px] uppercase tracking-widest">Ruta</th>
              </tr>
            </thead>
            <tbody>
              @for (entry of filteredEntries(); track entry.auditId) {
                <tr class="border-b border-border-main hover:bg-surface-50 transition-colors">
                  <td class="px-3 md:px-4 py-3 text-text-muted font-mono text-xs whitespace-nowrap">{{ entry.timestamp | date:'short' }}</td>
                  <td class="px-3 md:px-4 py-3 font-bold text-text-main text-xs">{{ entry.userName }}</td>
                  <td class="px-3 md:px-4 py-3">
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold"
                      [class.bg-blue-50]="entry.action === 'login'"
                      [class.text-blue-700]="entry.action === 'login'"
                      [class.bg-red-50]="entry.action === 'failed_login'"
                      [class.text-red-700]="entry.action === 'failed_login'"
                      [class.bg-green-50]="entry.action !== 'login' && entry.action !== 'failed_login'"
                      [class.text-green-700]="entry.action !== 'login' && entry.action !== 'failed_login'"
                    >
                      {{ entry.action }}
                    </span>
                  </td>
                  <td class="px-3 md:px-4 py-3">
                    <span class="inline-flex items-center gap-1 text-xs font-bold"
                      [class.text-green-600]="entry.status === 'success'"
                      [class.text-red-600]="entry.status === 'failure'"
                      [class.text-amber-600]="entry.status === 'warning'"
                    >
                      <mat-icon class="text-[14px] w-[14px] h-[14px]">
                        {{ entry.status === 'success' ? 'check_circle' : entry.status === 'failure' ? 'cancel' : 'warning' }}
                      </mat-icon>
                      {{ entry.status }}
                    </span>
                  </td>
                  <td class="px-3 md:px-4 py-3 text-text-muted text-xs">{{ entry.browser }}</td>
                  <td class="px-3 md:px-4 py-3 text-text-muted text-xs capitalize">{{ entry.deviceType }}</td>
                  <td class="px-3 md:px-4 py-3 text-text-muted font-mono text-xs">{{ entry.route }}</td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="px-4 py-12 text-center text-text-muted">
                    <mat-icon class="text-4xl mb-2 opacity-30">search_off</mat-icon>
                    <p class="font-bold">No se encontraron registros de auditoría</p>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class AuditPanelComponent implements OnInit {
  private auditService = inject(AuditService);

  allEntries = signal<AuditEntry[]>([]);
  filteredEntries = signal<AuditEntry[]>([]);
  totalEntries = computed(() => this.allEntries().length);

  filterAction = '';
  filterStatus = '';
  searchTerm = '';

  ngOnInit() {
    this.refreshData();
  }

  refreshData() {
    const entries = this.auditService.getAll();
    this.allEntries.set(entries);
    this.applyFilters();
  }

  applyFilters() {
    let entries = this.allEntries();

    if (this.filterAction) {
      entries = entries.filter(e => e.action === this.filterAction);
    }
    if (this.filterStatus) {
      entries = entries.filter(e => e.status === this.filterStatus);
    }
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      entries = entries.filter(e =>
        e.userName.toLowerCase().includes(term) ||
        e.action.toLowerCase().includes(term) ||
        e.route.toLowerCase().includes(term) ||
        e.browser.toLowerCase().includes(term)
      );
    }

    this.filteredEntries.set(entries);
  }

  clearFilters() {
    this.filterAction = '';
    this.filterStatus = '';
    this.searchTerm = '';
    this.applyFilters();
  }

  exportCSV() {
    const csv = this.auditService.exportCSV();
    if (!csv) return;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `nova_audit_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  }

  exportPDF() {
    const entries = this.filteredEntries();
    if (!entries.length) return;

    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();

    // Header bar
    pdf.setFillColor(15, 23, 42);
    pdf.rect(0, 0, pageW, 22, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('NOVA ACADEMY — Informe de Auditoría', 14, 14);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generado: ${new Date().toLocaleString()} · Total: ${entries.length} registros`, pageW - 14, 14, { align: 'right' });

    // Table headers
    let y = 30;
    const cols = [14, 52, 92, 132, 162, 202, 242];
    const headers = ['Fecha', 'Usuario', 'Acción', 'Estado', 'Navegador', 'Dispositivo', 'Ruta'];

    pdf.setFillColor(241, 245, 249);
    pdf.rect(10, y - 4, pageW - 20, 8, 'F');
    pdf.setTextColor(100, 116, 139);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    headers.forEach((h, i) => pdf.text(h.toUpperCase(), cols[i], y));
    y += 8;

    // Rows
    pdf.setFont('helvetica', 'normal');
    const maxRows = Math.min(entries.length, 200);
    for (let i = 0; i < maxRows; i++) {
      if (y > pageH - 20) {
        pdf.addPage();
        y = 20;
        pdf.setFillColor(241, 245, 249);
        pdf.rect(10, y - 4, pageW - 20, 8, 'F');
        pdf.setTextColor(100, 116, 139);
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'bold');
        headers.forEach((h, j) => pdf.text(h.toUpperCase(), cols[j], y));
        y += 8;
        pdf.setFont('helvetica', 'normal');
      }

      const e = entries[i];
      if (i % 2 === 0) {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(10, y - 3.5, pageW - 20, 7, 'F');
      }

      // Status color
      if (e.status === 'failure') {
        pdf.setTextColor(220, 38, 38);
      } else {
        pdf.setTextColor(15, 23, 42);
      }

      pdf.setFontSize(7);
      pdf.text(new Date(e.timestamp).toLocaleString('es', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }), cols[0], y);
      pdf.setTextColor(15, 23, 42);
      pdf.text((e.userName || '').substring(0, 18), cols[1], y);
      pdf.text(e.action, cols[2], y);
      // Status with color
      if (e.status === 'success') pdf.setTextColor(22, 163, 74);
      else if (e.status === 'failure') pdf.setTextColor(220, 38, 38);
      else pdf.setTextColor(217, 119, 6);
      pdf.text(e.status, cols[3], y);
      pdf.setTextColor(15, 23, 42);
      pdf.text((e.browser || '').substring(0, 18), cols[4], y);
      pdf.text((e.deviceType || ''), cols[5], y);
      pdf.text((e.route || '').substring(0, 20), cols[6], y);
      y += 7;
    }

    // Footer on all pages
    const totalPages = pdf.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      pdf.setPage(p);
      pdf.setFontSize(7);
      pdf.setTextColor(148, 163, 184);
      pdf.text(`Nova Academy · Confidencial · Página ${p}/${totalPages}`, pageW / 2, pageH - 8, { align: 'center' });
    }

    pdf.save(`Nova_Auditoria_${new Date().toISOString().slice(0, 10)}.pdf`);
  }
}
