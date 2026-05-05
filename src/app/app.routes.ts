import {Routes} from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

const authGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.currentUser()) {
    return true;
  }
  return router.parseUrl('/login');
};

const adminGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.currentUser()?.role === 'admin') {
    return true;
  }
  return router.parseUrl('/');
};

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home.component').then(m => m.HomeComponent) },
  { path: 'about', loadComponent: () => import('./pages/about.component').then(m => m.AboutComponent) },
  { path: 'courses', loadComponent: () => import('./pages/courses.component').then(m => m.CoursesComponent) },
  { path: 'courses/:id', loadComponent: () => import('./pages/course-detail.component').then(m => m.CourseDetailComponent), canActivate: [authGuard] },
  { path: 'contact', loadComponent: () => import('./pages/contact.component').then(m => m.ContactComponent) },
  { path: 'login', loadComponent: () => import('./pages/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/register.component').then(m => m.RegisterComponent) },
  { path: 'forgot-password', loadComponent: () => import('./pages/forgot-password.component').then(m => m.ForgotPasswordComponent) },
  { path: 'reset-password', loadComponent: () => import('./pages/reset-password.component').then(m => m.ResetPasswordComponent) },
  { path: 'auth/action', loadComponent: () => import('./pages/auth-action.component').then(m => m.AuthActionComponent) },
  { path: 'terms', loadComponent: () => import('./pages/legal.component').then(m => m.TermsComponent) },
  { path: 'privacy', loadComponent: () => import('./pages/legal.component').then(m => m.PrivacyComponent) },
  { path: 'verify/:id', loadComponent: () => import('./features/certificates/pages/certificate-verify.component').then(m => m.CertificateVerifyComponent) },
  { path: 'certificate/:id', loadComponent: () => import('./features/certificates/pages/certificate-viewer.component').then(m => m.CertificateViewerComponent) },
  { path: 'profile', loadComponent: () => import('./pages/profile.component').then(m => m.ProfileComponent), canActivate: [authGuard] },
  { path: 'settings', loadComponent: () => import('./pages/settings.component').then(m => m.SettingsComponent), canActivate: [adminGuard] },
  { path: 'admin', loadComponent: () => import('./pages/admin.component').then(m => m.AdminComponent), canActivate: [adminGuard] },
  { 
    path: 'admin/ai-traces', 
    loadComponent: () => import('./features/admin/ai-traces/components/ai-trace-dashboard/ai-trace-dashboard.component').then(m => m.AITraceDashboardComponent),
    canActivate: [adminGuard]
  },
  { 
    path: 'admin/ai-traces/history', 
    loadComponent: () => import('./features/admin/ai-traces/components/ai-trace-list/ai-trace-list.component').then(m => m.AITraceListComponent),
    canActivate: [adminGuard]
  },
  { 
    path: 'admin/ai-traces/:id', 
    loadComponent: () => import('./features/admin/ai-traces/components/ai-trace-detail/ai-trace-detail.component').then(m => m.AITraceDetailComponent),
    canActivate: [adminGuard]
  },
  { 
    path: 'admin/audit', 
    loadComponent: () => import('./features/admin/audit/audit-panel.component').then(m => m.AuditPanelComponent),
    canActivate: [adminGuard]
  },
  { 
    path: 'admin/activity', 
    loadComponent: () => import('./features/admin/activity/activity-panel.component').then(m => m.ActivityPanelComponent),
    canActivate: [adminGuard]
  },
  { path: '**', redirectTo: '' }
];
