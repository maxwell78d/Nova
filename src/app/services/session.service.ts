import { Injectable, inject, PLATFORM_ID, signal, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Session Security Service
 * - Detects user inactivity and auto-logs out after configurable timeout
 * - Cleans up tokens, signals, cache, and storage on logout
 */
@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  private auth = inject(AuthService);
  private zone = inject(NgZone);

  private readonly TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
  private readonly SESSION_KEY = 'nova_session_id';

  private timeoutHandle: any = null;
  private sessionId = signal<string | null>(null);
  private isInitialized = false;

  initialize() {
    if (!isPlatformBrowser(this.platformId) || this.isInitialized) return;
    this.isInitialized = true;

    // Generate session id
    const sid = crypto.randomUUID();
    this.sessionId.set(sid);
    sessionStorage.setItem(this.SESSION_KEY, sid);

    // Listen for activity events (run outside Angular zone for performance)
    this.zone.runOutsideAngular(() => {
      const events = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'];
      events.forEach(evt => {
        document.addEventListener(evt, () => this.resetTimer(), { passive: true });
      });

      // Tab close / browser close
      window.addEventListener('beforeunload', () => {
        this.persistLogoutEvent();
      });
    });

    this.resetTimer();
  }

  private resetTimer() {
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
    }
    this.timeoutHandle = setTimeout(() => {
      this.zone.run(() => this.forceLogout('inactivity'));
    }, this.TIMEOUT_MS);
  }

  forceLogout(reason: 'inactivity' | 'manual' | 'tab_close' = 'manual') {
    if (!isPlatformBrowser(this.platformId)) return;

    // Clean everything
    this.auth.logout();
    this.sessionId.set(null);
    sessionStorage.removeItem(this.SESSION_KEY);

    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
      this.timeoutHandle = null;
    }

    if (reason === 'inactivity') {
      this.router.navigate(['/login'], { queryParams: { reason: 'timeout' } });
    }
  }

  private persistLogoutEvent() {
    // Use sendBeacon for reliable tab-close logging
    if (navigator.sendBeacon) {
      const data = JSON.stringify({
        sessionId: this.sessionId(),
        userId: this.auth.currentUser()?.id,
        event: 'tab_close',
        timestamp: new Date().toISOString()
      });
      navigator.sendBeacon('/api/audit/beacon', data);
    }
  }

  getSessionId(): string | null {
    return this.sessionId();
  }
}
