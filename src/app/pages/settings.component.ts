import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AppSettingsService } from '../services/app-settings.service';
import { ThemeService, ThemeType } from '../core/design-system/theme.service';
import { ActivityTrackerService } from '../services/activity-tracker.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule],
  template: `
    <div class="bg-zinc-50 min-h-screen py-12">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-zinc-900">Configuración de la Plataforma</h1>
          <p class="text-zinc-500">Administra los ajustes globales de {{ settingsService.siteName() }}</p>
        </div>

        <div class="bg-white rounded-3xl shadow-xl border border-zinc-100 p-8">
          
          <form [formGroup]="settingsForm" (ngSubmit)="saveSettings()" class="space-y-8">
            
            <!-- Site Name -->
            <div>
              <label for="siteName" class="block text-sm font-bold text-zinc-900 mb-2">Nombre del Sitio</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <mat-icon class="text-zinc-400">title</mat-icon>
                </div>
                <input 
                  type="text" 
                  id="siteName" 
                  formControlName="siteName" 
                  class="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                  placeholder="Ej. NOVA Academy"
                >
              </div>
              <p class="mt-2 text-xs text-zinc-500">Este nombre aparecerá en la barra de navegación y en los correos.</p>
            </div>

            <!-- Theme Switcher -->
            <div>
              <label for="themeSelect" class="block text-sm font-bold text-zinc-900 mb-2">Tema Visual de la Plataforma</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <mat-icon class="text-zinc-400">palette</mat-icon>
                </div>
                <select 
                  id="themeSelect" 
                  formControlName="theme" 
                  class="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all appearance-none"
                  (change)="changeTheme($event)"
                >
                  <option value="classic">NOVA Classic (Estándar)</option>
                  <option value="glass">NOVA Glass (Premium)</option>
                  <option value="minimal">NOVA Minimal (Apple)</option>
                  <option value="professional">NOVA Professional (Corporativo)</option>
                  <option value="dark">NOVA Dark (Elegante)</option>
                </select>
                <div class="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <mat-icon class="text-zinc-400">expand_more</mat-icon>
                </div>
              </div>
              <p class="mt-2 text-xs text-zinc-500">Cambia instantáneamente la estructura, colores y tipografía de toda la plataforma.</p>
            </div>

            <!-- Logo Upload -->
            <div>
              <label class="block text-sm font-bold text-zinc-900 mb-2">Logo de la Institución</label>
              <div class="flex items-center gap-6">
                <!-- Current Logo Preview -->
                <div class="w-24 h-24 rounded-2xl bg-zinc-100 border-2 border-dashed border-zinc-300 flex items-center justify-center p-2 overflow-hidden relative group">
                  @if (logoPreview()) {
                    <img [src]="logoPreview()" alt="Logo" class="max-w-full max-h-full object-contain">
                  } @else {
                    <mat-icon class="text-zinc-400 text-3xl">image</mat-icon>
                  }
                </div>
                
                <div class="flex-1">
                  <input 
                    type="file" 
                    id="logoUpload" 
                    accept="image/*" 
                    class="hidden" 
                    #fileInput
                    (change)="onFileSelected($event)"
                  >
                  <button 
                    type="button" 
                    (click)="fileInput.click()" 
                    class="bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-50 px-4 py-2 rounded-lg font-medium transition-colors mb-2"
                  >
                    Seleccionar Archivo
                  </button>
                  <p class="text-xs text-zinc-500">Formato recomendado: PNG transparente o SVG. Tamaño máximo: 5MB.</p>
                </div>
              </div>
            </div>

            <div class="pt-6 border-t border-zinc-100 flex justify-end gap-3">
              <button 
                type="button" 
                (click)="resetForm()"
                class="px-6 py-3 rounded-xl font-bold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                [disabled]="settingsForm.pristine && !logoChanged()"
                class="px-6 py-3 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed transition-colors shadow-lg"
              >
                Guardar Cambios
              </button>
            </div>
            
            @if (showSuccessMsg()) {
              <div class="mt-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                <mat-icon>check_circle</mat-icon>
                <span class="font-medium">Configuración guardada exitosamente.</span>
              </div>
            }

          </form>
        </div>

      </div>
    </div>
  `
})
export class SettingsComponent implements OnInit {
  fb = inject(FormBuilder);
  settingsService = inject(AppSettingsService);
  themeService = inject(ThemeService);
  tracker = inject(ActivityTrackerService);
  
  settingsForm = this.fb.group({
    siteName: ['', Validators.required],
    theme: ['classic']
  });

  logoPreview = signal<string | null>(null);
  logoChanged = signal(false);
  showSuccessMsg = signal(false);

  ngOnInit() {
    this.settingsForm.patchValue({
      siteName: this.settingsService.siteName(),
      theme: this.themeService.currentTheme()
    });
    this.logoPreview.set(this.settingsService.siteLogo());
  }

  changeTheme(event: any) {
    const theme = event.target.value as ThemeType;
    this.themeService.setTheme(theme);
    this.tracker.track('theme_changed', 'Cambió tema a: ' + theme, 'settings', theme);
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.logoPreview.set(reader.result as string);
        this.logoChanged.set(true);
      };
      reader.readAsDataURL(file);
    }
  }

  resetForm() {
    this.settingsForm.reset({ siteName: this.settingsService.siteName() });
    this.logoPreview.set(this.settingsService.siteLogo());
    this.logoChanged.set(false);
  }

  saveSettings() {
    if (this.settingsForm.valid) {
      const newName = this.settingsForm.value.siteName;
      const newLogo = this.logoPreview();
      
      if (newName) {
        this.settingsService.updateSettings(newName, newLogo);
      }
      
      this.logoChanged.set(false);
      this.settingsForm.markAsPristine();
      
      this.showSuccessMsg.set(true);
      setTimeout(() => this.showSuccessMsg.set(false), 3000);
    }
  }
}
