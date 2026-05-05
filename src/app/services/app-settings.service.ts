import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppSettingsService {
  siteName = signal('Nova Academy');
  siteLogo = signal<string | null>(null);

  updateSettings(name: string, logo: string | null) {
    this.siteName.set(name);
    if (logo) {
      this.siteLogo.set(logo);
    }
  }
}
