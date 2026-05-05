import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';

export interface AuditEntry {
  auditId: string;
  userId: string;
  userName: string;
  role: string;
  action: string;
  entityType: string;
  entityId: string;
  status: 'success' | 'failure' | 'warning';
  timestamp: string;
  userAgent: string;
  browser: string;
  os: string;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  screenResolution: string;
  language: string;
  timezone: string;
  sessionId: string;
  route: string;
  success: boolean;
  error?: string;
  oldValue?: any;
  newValue?: any;
}

const AUDIT_STORAGE_KEY = 'nova_audit_log';

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private platformId = inject(PLATFORM_ID);

  /**
   * Log an audit event immediately.
   * In production this would POST to /api/audit.
   * For now we persist to localStorage as the mock DB.
   */
  log(params: {
    userId?: string;
    userName?: string;
    role?: string;
    action: string;
    entityType?: string;
    entityId?: string;
    status?: 'success' | 'failure' | 'warning';
    sessionId?: string;
    error?: string;
    oldValue?: any;
    newValue?: any;
  }) {
    if (!isPlatformBrowser(this.platformId)) return;

    const entry: AuditEntry = {
      auditId: crypto.randomUUID(),
      userId: params.userId || 'anonymous',
      userName: params.userName || 'Anónimo',
      role: params.role || 'guest',
      action: params.action,
      entityType: params.entityType || '',
      entityId: params.entityId || '',
      status: params.status || 'success',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      browser: this.detectBrowser(),
      os: this.detectOS(),
      deviceType: this.detectDeviceType(),
      screenResolution: `${screen.width}x${screen.height}`,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      sessionId: params.sessionId || sessionStorage.getItem('nova_session_id') || '',
      route: window.location.pathname,
      success: params.status !== 'failure',
      error: params.error,
      oldValue: params.oldValue,
      newValue: params.newValue,
    };

    this.persist(entry);
  }

  getAll(): AuditEntry[] {
    if (!isPlatformBrowser(this.platformId)) return [];
    try {
      const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  getFiltered(filters: {
    userId?: string;
    action?: string;
    dateFrom?: string;
    dateTo?: string;
    status?: string;
  }): AuditEntry[] {
    let entries = this.getAll();
    if (filters.userId) {
      entries = entries.filter(e => e.userId === filters.userId);
    }
    if (filters.action) {
      entries = entries.filter(e => e.action === filters.action);
    }
    if (filters.status) {
      entries = entries.filter(e => e.status === filters.status);
    }
    if (filters.dateFrom) {
      entries = entries.filter(e => e.timestamp >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      entries = entries.filter(e => e.timestamp <= filters.dateTo!);
    }
    return entries;
  }

  clearAll() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(AUDIT_STORAGE_KEY);
    }
  }

  exportCSV(): string {
    const entries = this.getAll();
    if (!entries.length) return '';
    const headers = Object.keys(entries[0]);
    const rows = entries.map(e => headers.map(h => JSON.stringify((e as any)[h] ?? '')).join(','));
    return [headers.join(','), ...rows].join('\n');
  }

  private firestore = inject(Firestore);

  private async persist(entry: AuditEntry) {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const entries = this.getAll();
      entries.unshift(entry); // newest first
      // Keep max 5000 entries
      if (entries.length > 5000) entries.length = 5000;
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(entries));

      // Hardening: Persistir en Firestore de manera asíncrona
      if (this.firestore) {
        await addDoc(collection(this.firestore, 'audit_logs'), entry);
      }
    } catch {
      // Storage full — silently drop oldest
    }
  }

  private detectBrowser(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Edg')) return 'Edge';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    return 'Other';
  }

  private detectOS(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS') || ua.includes('iPhone')) return 'iOS';
    return 'Other';
  }

  private detectDeviceType(): 'desktop' | 'tablet' | 'mobile' {
    const width = screen.width;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }
}
