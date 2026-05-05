import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="bg-surface min-h-screen">
      <!-- Hero -->
      <div class="bg-surface-900 text-white py-24">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 class="text-4xl md:text-6xl font-black text-white tracking-tight mb-6">Sobre Nosotros</h1>
          <p class="text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto font-medium">
            Conoce más sobre NOVA Academy, la plataforma educativa diseñada para formar a la nueva generación de profesionales tecnológicos.
          </p>
        </div>
      </div>

      <!-- Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 class="text-3xl font-black text-text-main mb-8 tracking-tight">Nuestra Historia</h2>
            <div class="space-y-6 text-lg text-text-muted">
              <p class="leading-relaxed">
                Nova Academy nace con la vocación de brindar educación tecnológica de calidad a jóvenes y adultos de todo el mundo. A lo largo de los años, hemos formado a miles de profesionales que hoy en día son líderes en la industria tecnológica.
              </p>
              <p class="leading-relaxed">
                Nuestra plataforma virtual <span class="font-black text-primary-600">NOVA Academy</span> es el siguiente paso en nuestra evolución, llevando nuestra excelencia educativa al entorno virtual para que puedas estudiar a tu propio ritmo, desde cualquier lugar.
              </p>
            </div>
          </div>
          <div class="relative">
            <div class="absolute -inset-4 bg-primary-100 rounded-[3rem] transform rotate-3 opacity-50"></div>
            <img src="https://picsum.photos/seed/tech_school/800/600" alt="Campus" class="relative rounded-[2rem] shadow-premium w-full object-cover" referrerpolicy="no-referrer">
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32">
          <div class="bg-surface-50 p-10 rounded-[2rem] border border-border-main text-center hover:shadow-premium-hover transition-shadow">
            <div class="w-20 h-20 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <mat-icon class="text-4xl">visibility</mat-icon>
            </div>
            <h3 class="text-xl font-black text-text-main mb-4">Visión</h3>
            <p class="text-text-muted font-medium leading-relaxed">Ser la institución líder en educación técnica virtual, reconocida por la excelencia de sus egresados y su contribución al desarrollo social.</p>
          </div>
          <div class="bg-surface-50 p-10 rounded-[2rem] border border-border-main text-center hover:shadow-premium-hover transition-shadow">
            <div class="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <mat-icon class="text-4xl">flag</mat-icon>
            </div>
            <h3 class="text-xl font-black text-text-main mb-4">Misión</h3>
            <p class="text-text-muted font-medium leading-relaxed">Formar profesionales técnicos competentes, éticos y emprendedores, mediante programas educativos innovadores y accesibles.</p>
          </div>
          <div class="bg-surface-50 p-10 rounded-[2rem] border border-border-main text-center hover:shadow-premium-hover transition-shadow">
            <div class="w-20 h-20 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <mat-icon class="text-4xl">favorite</mat-icon>
            </div>
            <h3 class="text-xl font-black text-text-main mb-4">Valores</h3>
            <p class="text-text-muted font-medium leading-relaxed">Excelencia, Compromiso, Innovación, Ética profesional y Responsabilidad social en cada paso que damos.</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AboutComponent {}
