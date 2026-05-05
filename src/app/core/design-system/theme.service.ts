import { Injectable, effect, signal } from '@angular/core';

export type ThemeType = 'classic' | 'glass' | 'minimal' | 'professional' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'nova_theme';
  
  public currentTheme = signal<ThemeType>('classic');

  constructor() {
    this.initTheme();
    
    effect(() => {
      const theme = this.currentTheme();
      if (typeof document !== 'undefined') {
        const htmlTag = document.documentElement;
        htmlTag.setAttribute('data-theme', theme);
        localStorage.setItem(this.THEME_KEY, theme);
      }
    });
  }

  private initTheme() {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem(this.THEME_KEY) as ThemeType;
      if (savedTheme && this.isValidTheme(savedTheme)) {
        this.currentTheme.set(savedTheme);
      } else {
        this.currentTheme.set('classic');
      }
    }
  }

  public setTheme(theme: ThemeType) {
    this.currentTheme.set(theme);
  }

  private isValidTheme(theme: string): boolean {
    return ['classic', 'glass', 'minimal', 'professional', 'dark'].includes(theme);
  }
}
