import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ActivityTrackerService, ActivityEvent } from '../../../services/activity-tracker.service';
import { AuthService } from '../../../services/auth.service';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-activity-panel',
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
            <h2 class="text-2xl md:text-3xl font-black text-text-main tracking-tight">Centro de Actividad</h2>
            <p class="text-text-muted text-xs md:text-sm font-medium flex items-center gap-2">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              En vivo · {{ totalEvents() }} eventos · Auto-refresh {{ refreshInterval / 1000 }}s
            </p>
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

      <!-- Live Stats -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-px bg-border-main border border-border-main">
        <div class="bg-surface p-4 text-center">
          <p class="text-2xl md:text-3xl font-black text-primary-600">{{ totalEvents() }}</p>
          <p class="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Total</p>
        </div>
        <div class="bg-surface p-4 text-center">
          <p class="text-2xl md:text-3xl font-black text-green-600">{{ loginCount() }}</p>
          <p class="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Logins</p>
        </div>
        <div class="bg-surface p-4 text-center">
          <p class="text-2xl md:text-3xl font-black text-blue-600">{{ pageViewCount() }}</p>
          <p class="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Páginas</p>
        </div>
        <div class="bg-surface p-4 text-center">
          <p class="text-2xl md:text-3xl font-black text-amber-600">{{ quizCount() }}</p>
          <p class="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Exámenes</p>
        </div>
        <div class="bg-surface p-4 text-center col-span-2 md:col-span-1">
          <p class="text-2xl md:text-3xl font-black text-red-600">{{ errorCount() }}</p>
          <p class="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Errores</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-surface border border-border-main p-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          <div>
            <label class="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1 block">Usuario</label>
            <div class="relative">
              <mat-icon class="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted text-[16px] w-[16px] h-[16px]">search</mat-icon>
              <input type="text" [(ngModel)]="filterUser" (ngModelChange)="applyFilters()" placeholder="Buscar usuario..." class="w-full pl-8 pr-3 py-2 bg-surface-50 border border-border-main text-sm outline-none focus:ring-2 focus:ring-primary-500">
            </div>
          </div>
          <div>
            <label class="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1 block">Acción</label>
            <select [(ngModel)]="filterAction" (ngModelChange)="applyFilters()" class="w-full px-3 py-2 bg-surface-50 border border-border-main text-sm outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">Todas</option>
              @for (action of uniqueActions(); track action) {
                <option [value]="action">{{ action }}</option>
              }
            </select>
          </div>
          <div>
            <label class="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1 block">Dispositivo</label>
            <select [(ngModel)]="filterDevice" (ngModelChange)="applyFilters()" class="w-full px-3 py-2 bg-surface-50 border border-border-main text-sm outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">Todos</option>
              <option value="desktop">Desktop</option>
              <option value="tablet">Tablet</option>
              <option value="mobile">Mobile</option>
            </select>
          </div>
          <div>
            <label class="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1 block">Búsqueda</label>
            <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="applyFilters()" placeholder="Buscar evento..." class="w-full px-3 py-2 bg-surface-50 border border-border-main text-sm outline-none focus:ring-2 focus:ring-primary-500">
          </div>
          <div class="flex items-end">
            <button (click)="clearFilters()" class="w-full px-3 py-2 text-sm font-bold text-text-muted hover:text-text-main border border-border-main hover:bg-surface-100 transition-colors">
              Limpiar
            </button>
          </div>
        </div>
      </div>

      <!-- Activity Feed -->
      <div class="bg-surface border border-border-main overflow-hidden">
        <div class="overflow-x-auto max-h-[65vh] overflow-y-auto">
          <table class="w-full text-sm min-w-[700px]">
            <thead class="sticky top-0 z-10">
              <tr class="border-b border-border-main bg-surface-50">
                <th class="px-3 md:px-4 py-3 text-left font-black text-text-muted text-[10px] uppercase tracking-widest w-36">Fecha / Hora</th>
                <th class="px-3 md:px-4 py-3 text-left font-black text-text-muted text-[10px] uppercase tracking-widest">Usuario</th>
                <th class="px-3 md:px-4 py-3 text-left font-black text-text-muted text-[10px] uppercase tracking-widest">Acción</th>
                <th class="px-3 md:px-4 py-3 text-left font-black text-text-muted text-[10px] uppercase tracking-widest">Detalle</th>
                <th class="px-3 md:px-4 py-3 text-left font-black text-text-muted text-[10px] uppercase tracking-widest">Ruta</th>
                <th class="px-3 md:px-4 py-3 text-left font-black text-text-muted text-[10px] uppercase tracking-widest">Dispositivo</th>
              </tr>
            </thead>
            <tbody>
              @for (event of filteredEvents(); track event.id; let i = $index) {
                <tr class="border-b border-border-main hover:bg-surface-50 transition-colors" [class.animate-pulse]="i === 0 && isNew">
                  <td class="px-3 md:px-4 py-3 text-text-muted font-mono text-xs whitespace-nowrap">
                    {{ event.timestamp | date:'dd/MM HH:mm:ss' }}
                  </td>
                  <td class="px-3 md:px-4 py-3">
                    <div class="flex items-center gap-2">
                      <div class="w-7 h-7 flex items-center justify-center text-[10px] font-black shrink-0"
                        [class.bg-primary-100]="event.role === 'admin'"
                        [class.text-primary-700]="event.role === 'admin'"
                        [class.bg-blue-100]="event.role === 'student'"
                        [class.text-blue-700]="event.role === 'student'"
                        [class.bg-gray-100]="event.role === 'guest'"
                        [class.text-gray-700]="event.role === 'guest'"
                      >
                        {{ event.userName.charAt(0).toUpperCase() }}
                      </div>
                      <div class="min-w-0">
                        <p class="font-bold text-text-main text-xs leading-none truncate">{{ event.userName }}</p>
                        <p class="text-[10px] text-text-muted leading-none mt-0.5">{{ event.role }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-3 md:px-4 py-3">
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider"
                      [class]="getActionBadgeClass(event.action)">
                      <mat-icon class="text-[12px] w-[12px] h-[12px]">{{ getActionIcon(event.action) }}</mat-icon>
                      {{ event.action }}
                    </span>
                  </td>
                  <td class="px-3 md:px-4 py-3 text-text-muted text-xs max-w-[200px] truncate" [title]="event.detail">
                    {{ event.detail }}
                  </td>
                  <td class="px-3 md:px-4 py-3 text-text-muted font-mono text-[11px]">{{ event.route }}</td>
                  <td class="px-3 md:px-4 py-3">
                    <span class="text-text-muted text-xs capitalize flex items-center gap-1">
                      <mat-icon class="text-[14px] w-[14px] h-[14px]">
                        {{ event.deviceType === 'mobile' ? 'smartphone' : event.deviceType === 'tablet' ? 'tablet' : 'computer' }}
                      </mat-icon>
                      {{ event.deviceType }}
                    </span>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="px-4 py-20 text-center text-text-muted">
                    <mat-icon class="text-5xl opacity-20 mb-2">inbox</mat-icon>
                    <p class="font-black text-lg">Sin actividad registrada</p>
                    <p class="text-sm">Los eventos aparecerán aquí en tiempo real.</p>
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
export class ActivityPanelComponent implements OnInit, OnDestroy {
  private tracker = inject(ActivityTrackerService);
  private auth = inject(AuthService);

  allUsers = this.auth.allUsers;
  filteredEvents = signal<ActivityEvent[]>([]);
  isNew = false;

  filterUser = '';
  filterAction = '';
  filterDevice = '';
  searchTerm = '';

  refreshInterval = 5000;
  private intervalHandle: any = null;

  totalEvents = computed(() => this.tracker.liveFeed().length);
  loginCount = computed(() => this.tracker.liveFeed().filter(e => e.action === 'login' || e.action === 'failed_login').length);
  pageViewCount = computed(() => this.tracker.liveFeed().filter(e => e.action === 'page_view').length);
  quizCount = computed(() => this.tracker.liveFeed().filter(e => e.action.includes('quiz')).length);
  errorCount = computed(() => this.tracker.liveFeed().filter(e => e.action.includes('error') || e.action === 'failed_login').length);

  uniqueActions = computed(() => {
    const actions = new Set(this.tracker.liveFeed().map(e => e.action));
    return Array.from(actions).sort();
  });

  ngOnInit() {
    this.tracker.initialize();
    this.refreshData();
    this.intervalHandle = setInterval(() => {
      this.refreshData();
    }, this.refreshInterval);
  }

  ngOnDestroy() {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
    }
  }

  refreshData() {
    this.isNew = true;
    this.applyFilters();
    setTimeout(() => this.isNew = false, 1000);
  }

  applyFilters() {
    let events = this.tracker.liveFeed();

    if (this.filterUser) {
      const term = this.filterUser.toLowerCase();
      events = events.filter(e => e.userName.toLowerCase().includes(term));
    }
    if (this.filterAction) {
      events = events.filter(e => e.action === this.filterAction);
    }
    if (this.filterDevice) {
      events = events.filter(e => e.deviceType === this.filterDevice);
    }
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      events = events.filter(e =>
        e.userName.toLowerCase().includes(term) ||
        e.action.toLowerCase().includes(term) ||
        e.detail.toLowerCase().includes(term) ||
        e.route.toLowerCase().includes(term)
      );
    }

    this.filteredEvents.set(events);
  }

  clearFilters() {
    this.filterUser = '';
    this.filterAction = '';
    this.filterDevice = '';
    this.searchTerm = '';
    this.applyFilters();
  }

  exportCSV() {
    const csv = this.tracker.exportCSV();
    if (!csv) return;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `nova_activity_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  }

  exportPDF() {
    const events = this.filteredEvents();
    if (!events.length) return;

    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();

    // Header
    pdf.setFillColor(15, 23, 42);
    pdf.rect(0, 0, pageW, 22, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('NOVA ACADEMY — Informe de Actividad', 14, 14);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Generado: ${new Date().toLocaleString()} · Total: ${events.length} eventos`, pageW - 14, 14, { align: 'right' });

    // Table header
    let y = 30;
    const cols = [14, 52, 92, 122, 182, 232];
    const headers = ['Fecha', 'Usuario', 'Acción', 'Detalle', 'Ruta', 'Dispositivo'];

    pdf.setFillColor(241, 245, 249);
    pdf.rect(10, y - 4, pageW - 20, 8, 'F');
    pdf.setTextColor(100, 116, 139);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    headers.forEach((h, i) => pdf.text(h.toUpperCase(), cols[i], y));

    y += 8;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(15, 23, 42);

    // Table rows
    const maxRows = Math.min(events.length, 200);
    for (let i = 0; i < maxRows; i++) {
      if (y > pageH - 20) {
        pdf.addPage();
        y = 20;
        // Re-draw header on new page
        pdf.setFillColor(241, 245, 249);
        pdf.rect(10, y - 4, pageW - 20, 8, 'F');
        pdf.setTextColor(100, 116, 139);
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'bold');
        headers.forEach((h, j) => pdf.text(h.toUpperCase(), cols[j], y));
        y += 8;
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(15, 23, 42);
      }

      const e = events[i];
      // Zebra striping
      if (i % 2 === 0) {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(10, y - 3.5, pageW - 20, 7, 'F');
      }
      pdf.setFontSize(7);
      pdf.setTextColor(15, 23, 42);
      pdf.text(new Date(e.timestamp).toLocaleString('es', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }), cols[0], y);
      pdf.text(e.userName.substring(0, 18), cols[1], y);
      pdf.text(e.action, cols[2], y);
      pdf.text((e.detail || '').substring(0, 30), cols[3], y);
      pdf.text((e.route || '').substring(0, 25), cols[4], y);
      pdf.text(e.deviceType || '', cols[5], y);
      y += 7;
    }

    // Footer
    const totalPages = pdf.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      pdf.setPage(p);
      pdf.setFontSize(7);
      pdf.setTextColor(148, 163, 184);
      pdf.text(`Nova Academy · Confidencial · Página ${p}/${totalPages}`, pageW / 2, pageH - 8, { align: 'center' });
    }

    pdf.save(`Nova_Actividad_${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  getActionIcon(action: string): string {
    const map: Record<string, string> = {
      'login': 'login', 'logout': 'logout', 'failed_login': 'block',
      'page_view': 'visibility', 'course_started': 'play_arrow',
      'lesson_opened': 'menu_book', 'quiz_started': 'quiz',
      'quiz_completed': 'check_circle', 'certificate_generated': 'workspace_premium',
      'certificate_downloaded': 'download', 'profile_updated': 'person',
      'theme_changed': 'palette', 'enroll': 'school', 'error': 'error',
    };
    return map[action] || 'radio_button_checked';
  }

  getActionBadgeClass(action: string): string {
    if (action === 'login') return 'bg-green-50 text-green-700';
    if (action === 'failed_login') return 'bg-red-50 text-red-700';
    if (action === 'logout') return 'bg-amber-50 text-amber-700';
    if (action === 'page_view') return 'bg-blue-50 text-blue-700';
    if (action.includes('quiz')) return 'bg-purple-50 text-purple-700';
    if (action.includes('certificate')) return 'bg-emerald-50 text-emerald-700';
    if (action.includes('error')) return 'bg-red-50 text-red-700';
    return 'bg-gray-50 text-gray-700';
  }
}
