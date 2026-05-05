import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppSettingsService } from '../services/app-settings.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  template: `
    <footer class="bg-black text-zinc-300 pt-16 pb-8 border-t border-zinc-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div class="col-span-1 md:col-span-2">
            <h2 class="text-2xl font-black text-white mb-4 tracking-widest uppercase">NOVA <span class="text-primary-500">Academy</span></h2>
            <p class="text-gray-400 mb-6 leading-relaxed">
              Formando profesionales técnicos de excelencia en Nova Academy para un futuro brillante.
            </p>
            <div class="flex space-x-4">
              <a href="https://www.facebook.com/profile.php?id=100042235765826" target="_blank" class="w-10 h-10 bg-zinc-900 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-colors">
                <mat-icon>facebook</mat-icon>
              </a>
              <a href="https://www.instagram.com/cepva.oficial?igsh=MW5idTN6eWdkc3JseQ==" target="_blank" class="w-10 h-10 bg-zinc-900 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-colors">
                <mat-icon>photo_camera</mat-icon>
              </a>
              <a href="#" class="w-10 h-10 bg-zinc-900 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-colors">
                <mat-icon>close</mat-icon>
              </a>
            </div>
          </div>
          
          <div>
            <h3 class="text-white font-semibold mb-4 uppercase tracking-wider text-sm">Enlaces Rápidos</h3>
            <ul class="space-y-3 text-sm">
              <li><a routerLink="/" class="hover:text-primary-400 transition-colors">Inicio</a></li>
              <li><a routerLink="/about" class="hover:text-primary-400 transition-colors">Sobre Nosotros</a></li>
              <li><a routerLink="/courses" class="hover:text-primary-400 transition-colors">Cursos Técnicos</a></li>
              <li><a routerLink="/contact" class="hover:text-primary-400 transition-colors">Contacto</a></li>
            </ul>
          </div>

          <div>
            <h3 class="text-white font-semibold mb-4 uppercase tracking-wider text-sm">Contacto</h3>
            <ul class="space-y-4">
              <li class="flex items-start gap-3 text-gray-400">
                <mat-icon class="text-primary-500">location_on</mat-icon>
                <span>Ave. Presidente Hugo Chávez Frías,<br>Santo Domingo Este 11906.</span>
              </li>
              <li class="flex items-center gap-3">
                <mat-icon class="text-primary-500 text-[20px] w-[20px] h-[20px]">phone</mat-icon>
                <span>+1 (809) 555-0123</span>
              </li>
              <li class="flex items-center gap-3 text-gray-400">
                <mat-icon class="text-primary-500">email</mat-icon>
                <span>info@nova-academy.edu</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div class="border-t border-gray-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p class="text-zinc-500 text-sm">&copy; {{ currentYear }} NOVA Academy — Todos los derechos reservados. Diseñado por <span class="text-white font-black">Maxwell</span>.</p>
          <div class="flex gap-4 text-sm text-gray-400">
            <a routerLink="/terms" class="hover:text-white transition-colors">Términos de Uso</a>
            <a routerLink="/privacy" class="hover:text-white transition-colors">Política de Privacidad</a>
          </div>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
  settings = inject(AppSettingsService);
  currentYear = new Date().getFullYear();
}
