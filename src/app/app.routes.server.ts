import {RenderMode, ServerRoute} from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'courses/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: 'verify/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: 'certificate/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: 'admin/ai-traces/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: 'auth/action',
    renderMode: RenderMode.Client,
  },
  {
    path: 'reset-password',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
