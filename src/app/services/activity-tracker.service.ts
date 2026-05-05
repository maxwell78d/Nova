import { Injectable, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface ActivityEvent {
  id: string;
  userId: string;
  userName: string;
  role: string;
  action: string;
  detail: string;
  entityType: string;
  entityId: string;
  route: string;
  timestamp: string;
  browser: string;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  sessionId: string;
}

const ACTIVITY_KEY = 'nova_activity_feed';
const MAX_EVENTS = 3000;

@Injectable({
  providedIn: 'root'
})
export class ActivityTrackerService {
  private platformId = inject(PLATFORM_ID);
  private auth = inject(AuthService);
  private router = inject(Router);

  /** Live signal — admin panels can subscribe reactively */
  public liveFeed = signal<ActivityEvent[]>([]);

  private initialized = false;

  initialize() {
    if (!isPlatformBrowser(this.platformId) || this.initialized) return;
    this.initialized = true;

    // Load existing feed
    this.liveFeed.set(this.loadFromStorage());

    // Auto-track route navigation
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.track('page_view', 'Navegó a ' + e.urlAfterRedirects, 'navigation', e.urlAfterRedirects);
    });
  }

  /**
   * Track ANY action across the entire platform.
   * Call this from components, services, guards — everywhere.
   */
  track(action: string, detail: string, entityType: string = '', entityId: string = '') {
    if (!isPlatformBrowser(this.platformId)) return;

    const user = this.auth.currentUser();

    const event: ActivityEvent = {
      id: crypto.randomUUID(),
      userId: user?.id || 'anonymous',
      userName: user?.name || 'Visitante',
      role: user?.role || 'guest',
      action,
      detail,
      entityType,
      entityId,
      route: window.location.pathname,
      timestamp: new Date().toISOString(),
      browser: this.detectBrowser(),
      deviceType: this.detectDevice(),
      sessionId: sessionStorage.getItem('nova_session_id') || ''
    };

    // Update live signal (prepend newest)
    this.liveFeed.update(feed => {
      const updated = [event, ...feed];
      if (updated.length > MAX_EVENTS) updated.length = MAX_EVENTS;
      return updated;
    });

    // Persist immediately
    this.persistToStorage();
  }

  getByUser(userId: string): ActivityEvent[] {
    return this.liveFeed().filter(e => e.userId === userId);
  }

  getByAction(action: string): ActivityEvent[] {
    return this.liveFeed().filter(e => e.action === action);
  }

  clearAll() {
    this.liveFeed.set([]);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(ACTIVITY_KEY);
    }
  }

  exportCSV(): string {
    const events = this.liveFeed();
    if (!events.length) return '';
    const headers = Object.keys(events[0]);
    const rows = events.map(e => headers.map(h => JSON.stringify((e as any)[h] ?? '')).join(','));
    return [headers.join(','), ...rows].join('\n');
  }

  private persistToStorage() {
    try {
      localStorage.setItem(ACTIVITY_KEY, JSON.stringify(this.liveFeed()));
    } catch {
      // Storage full — trim older entries
      const trimmed = this.liveFeed().slice(0, 1000);
      localStorage.setItem(ACTIVITY_KEY, JSON.stringify(trimmed));
    }
  }

  private loadFromStorage(): ActivityEvent[] {
    try {
      const raw = localStorage.getItem(ACTIVITY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
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

  private detectDevice(): 'desktop' | 'tablet' | 'mobile' {
    const w = screen.width;
    if (w < 768) return 'mobile';
    if (w < 1024) return 'tablet';
    return 'desktop';
  }
}
