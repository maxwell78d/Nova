import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  template: `
    <div class="min-h-screen bg-surface-50 py-16 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto bg-surface p-8 md:p-12 border border-border-main shadow-premium">
        <h1 class="text-4xl font-black text-text-main mb-8 uppercase tracking-tight">Términos de Uso</h1>
        
        <div class="prose prose-slate max-w-none space-y-6 text-text-main font-medium leading-relaxed">
          <p>Bienvenido a Zervion Learning. Al acceder a nuestra plataforma, usted acepta los siguientes términos y condiciones:</p>
          
          <h3 class="text-xl font-black uppercase tracking-widest text-primary-700">1. Uso de la Plataforma</h3>
          <p>El acceso a los cursos es personal e intransferible. El usuario se compromete a no compartir sus credenciales de acceso con terceros.</p>
          
          <h3 class="text-xl font-black uppercase tracking-widest text-primary-700">2. Propiedad Intelectual</h3>
          <p>Todo el contenido, incluyendo videos, textos y exámenes, es propiedad exclusiva de Zervion Learning y está protegido por leyes internacionales de derechos de autor.</p>
          
          <h3 class="text-xl font-black uppercase tracking-widest text-primary-700">3. Certificaciones</h3>
          <p>Los certificados se otorgan únicamente al completar satisfactoriamente el 100% de las lecciones y aprobar los exámenes correspondientes.</p>
          
          <h3 class="text-xl font-black uppercase tracking-widest text-primary-700">4. Modificaciones</h3>
          <p>Nos reservamos el derecho de modificar el contenido de los cursos o los presentes términos en cualquier momento para mejorar la calidad del servicio.</p>
        </div>

        <div class="mt-12 pt-8 border-t border-border-main flex justify-between items-center">
          <a routerLink="/" class="text-primary-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
            <mat-icon>arrow_back</mat-icon> Volver al Inicio
          </a>
          <p class="text-text-muted text-[10px] font-bold uppercase tracking-widest">Última actualización: Mayo 2026</p>
        </div>
      </div>
    </div>
  `
})
export class TermsComponent {}

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  template: `
    <div class="min-h-screen bg-surface-50 py-16 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto bg-surface p-8 md:p-12 border border-border-main shadow-premium">
        <h1 class="text-4xl font-black text-text-main mb-8 uppercase tracking-tight">Política de Privacidad</h1>
        
        <div class="prose prose-slate max-w-none space-y-6 text-text-main font-medium leading-relaxed">
          <p>En Zervion Learning, la privacidad de nuestros estudiantes es nuestra prioridad.</p>
          
          <h3 class="text-xl font-black uppercase tracking-widest text-primary-700">1. Recolección de Datos</h3>
          <p>Recopilamos información básica como nombre, correo electrónico y progreso académico para personalizar su experiencia de aprendizaje.</p>
          
          <h3 class="text-xl font-black uppercase tracking-widest text-primary-700">2. Uso de la Información</h3>
          <p>Sus datos se utilizan exclusivamente para la gestión académica, emisión de certificados y soporte técnico.</p>
          
          <h3 class="text-xl font-black uppercase tracking-widest text-primary-700">3. Seguridad</h3>
          <p>Implementamos protocolos de cifrado SSL y seguridad en base de datos de Firebase para proteger su información contra accesos no autorizados.</p>
          
          <h3 class="text-xl font-black uppercase tracking-widest text-primary-700">4. Derechos del Usuario</h3>
          <p>Usted puede solicitar la eliminación de su cuenta y datos personales en cualquier momento a través de nuestro canal de soporte.</p>
        </div>

        <div class="mt-12 pt-8 border-t border-border-main flex justify-between items-center">
          <a routerLink="/" class="text-primary-600 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
            <mat-icon>arrow_back</mat-icon> Volver al Inicio
          </a>
          <p class="text-text-muted text-[10px] font-bold uppercase tracking-widest">Última actualización: Mayo 2026</p>
        </div>
      </div>
    </div>
  `
})
export class PrivacyComponent {}
