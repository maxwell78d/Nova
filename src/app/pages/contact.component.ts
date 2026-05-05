import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [MatIconModule, ReactiveFormsModule],
  template: `
    <div class="bg-surface-50 min-h-screen py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div class="text-center max-w-3xl mx-auto mb-16">
          <h1 class="text-5xl font-black text-text-main mb-4 tracking-tight uppercase">Contáctanos</h1>
          <p class="text-lg text-text-muted font-medium">
            ¿Tienes dudas sobre nuestros cursos o el proceso de inscripción? Estamos aquí para ayudarte.
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 bg-white border border-border-main overflow-hidden">
          
          <!-- Contact Info -->
          <div class="bg-surface-900 text-white p-10 md:p-12 flex flex-col justify-between">
            <div>
              <h2 class="text-3xl font-black mb-10 uppercase tracking-widest">Información</h2>
              <ul class="space-y-8">
                <li class="flex items-start gap-4">
                  <div class="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <mat-icon class="text-primary-500">location_on</mat-icon>
                  </div>
                  <div class="ml-4">
                    <h3 class="text-white font-black uppercase tracking-widest text-xs mb-1">Nuestra Sede</h3>
                    <p class="text-gray-400 leading-relaxed font-medium">Ave. Presidente Hugo Chávez Frías,<br>Santo Domingo Este 11906.</p>
                  </div>
                </li>
                <li class="flex items-start gap-4">
                  <div class="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <mat-icon class="text-primary-500">phone</mat-icon>
                  </div>
                  <div>
                    <h3 class="text-white font-black uppercase tracking-widest text-xs mb-1">Teléfono</h3>
                    <p class="text-gray-400 leading-relaxed font-medium">+1 (809) 555-0123<br>Lunes a Viernes, 8:00 AM - 5:00 PM</p>
                  </div>
                </li>
                <li class="flex items-start gap-4">
                  <div class="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <mat-icon class="text-primary-500">email</mat-icon>
                  </div>
                  <div class="ml-4">
                    <h3 class="text-white font-black uppercase tracking-widest text-xs mb-1">Correo Electrónico</h3>
                    <p class="text-gray-400 leading-relaxed font-medium">info@nova-academy.edu<br>soporte@nova-academy.edu</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div class="mt-8 border border-white/10 hidden md:block overflow-hidden h-48 bg-white/5">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3784.0538053641!2d-69.8398038!3d18.4812345!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8ea5630000000000%3A0x0000000000000000!2sSanto%20Domingo%20Este!5e0!3m2!1sen!2sdo!4v1700000000000!5m2!1sen!2sdo" 
                width="100%" 
                height="100%" 
                style="border:0; filter: grayscale(1) invert(0.9);" 
                allowfullscreen="" 
                loading="lazy" 
                referrerpolicy="no-referrer-when-downgrade">
              </iframe>
            </div>

            <div class="mt-10 pt-10 border-t border-white/10">
              <h3 class="text-xs font-black uppercase tracking-widest mb-4">Síguenos</h3>
              <div class="flex gap-4">
                <a href="https://www.facebook.com/profile.php?id=100042235765826" target="_blank" class="w-10 h-10 bg-white/5 border border-white/10 hover:bg-primary-600 hover:text-white flex items-center justify-center transition-all">
                  <mat-icon>facebook</mat-icon>
                </a>
                <a href="https://www.instagram.com/cepva.oficial?igsh=MW5idTN6eWdkc3JseQ==" target="_blank" class="w-10 h-10 bg-white/5 border border-white/10 hover:bg-primary-600 hover:text-white flex items-center justify-center transition-all">
                  <mat-icon>photo_camera</mat-icon>
                </a>
              </div>
            </div>
          </div>

          <!-- Contact Form -->
          <div class="p-10 md:p-12 bg-white">
            <h2 class="text-2xl font-black text-text-main mb-6 uppercase tracking-tight">Envíanos un mensaje</h2>
            
            @if (submitted) {
              <div class="bg-primary-50 border border-primary-100 p-8 text-center animate-in fade-in zoom-in-95">
                <div class="w-20 h-20 bg-primary-100 text-primary-600 flex items-center justify-center mx-auto mb-6">
                  <mat-icon class="text-4xl w-10 h-10">check_circle</mat-icon>
                </div>
                <h3 class="text-2xl font-black text-primary-900 mb-2 uppercase">¡Mensaje Enviado!</h3>
                <p class="text-primary-700 font-medium">Gracias por contactarnos. Te responderemos a la brevedad posible.</p>
                <button (click)="resetForm()" class="mt-8 bg-surface-900 text-white px-8 py-3 font-black text-xs uppercase tracking-widest hover:bg-primary-600 transition-colors">Enviar otro mensaje</button>
              </div>
            } @else {
              <form [formGroup]="contactForm" (ngSubmit)="onSubmit()" class="space-y-6">
                <div>
                  <label for="name" class="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Nombre Completo</label>
                  <input type="text" id="name" formControlName="name" class="w-full px-4 py-3 bg-surface-50 border border-border-main focus:ring-2 focus:ring-primary-500 outline-none transition-all font-medium" placeholder="Ej. Juan Pérez">
                </div>
                
                <div>
                  <label for="email" class="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Correo Electrónico</label>
                  <input type="email" id="email" formControlName="email" class="w-full px-4 py-3 bg-surface-50 border border-border-main focus:ring-2 focus:ring-primary-500 outline-none transition-all font-medium" placeholder="ejemplo@correo.com">
                </div>
                
                <div>
                  <label for="subject" class="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Asunto</label>
                  <input type="text" id="subject" formControlName="subject" class="w-full px-4 py-3 bg-surface-50 border border-border-main focus:ring-2 focus:ring-primary-500 outline-none transition-all font-medium" placeholder="¿En qué podemos ayudarte?">
                </div>
                
                <div>
                  <label for="message" class="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Mensaje</label>
                  <textarea id="message" formControlName="message" rows="4" class="w-full px-4 py-3 bg-surface-50 border border-border-main focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none font-medium" placeholder="Escribe tu mensaje aquí..."></textarea>
                </div>
                
                <button type="submit" [disabled]="contactForm.invalid" class="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-surface-300 text-white font-black py-5 uppercase tracking-widest transition-all flex items-center justify-center gap-3">
                  <mat-icon>send</mat-icon> Enviar Mensaje
                </button>
              </form>
            }
          </div>

        </div>
      </div>
    </div>
  `
})
export class ContactComponent {
  fb = inject(FormBuilder);
  
  contactForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    subject: ['', Validators.required],
    message: ['', Validators.required]
  });

  submitted = false;

  onSubmit() {
    if (this.contactForm.valid) {
      // Simulate API call
      setTimeout(() => {
        this.submitted = true;
      }, 500);
    }
  }

  resetForm() {
    this.submitted = false;
    this.contactForm.reset();
  }
}
