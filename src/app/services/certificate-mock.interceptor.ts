import { HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { from, Observable, of } from 'rxjs';
import { delay, switchMap } from 'rxjs/operators';
import { Certificate } from '../models/certificate.model';

// Mock DB
const certificates: Certificate[] = [];

async function generateHash(data: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const dataBuff = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuff);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  return btoa(data).substring(0, 32);
}

export function certificateMockInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<any> {
  const { url, method, body } = req;

  if (url.startsWith('/api/certificates')) {
    
    // GET /api/certificates/verify/:id
    const verifyMatch = url.match(/\/api\/certificates\/verify\/([a-zA-Z0-9-]+)$/);
    if (method === 'GET' && verifyMatch) {
      const id = verifyMatch[1];
      const stored = typeof window !== 'undefined' ? localStorage.getItem('mock_certs') : null;
      const db: Certificate[] = stored ? JSON.parse(stored) : certificates;
      
      const cert = db.find(c => c.id === id || c.serial === id);
      
      if (cert) {
        return of(new HttpResponse({ status: 200, body: { valid: true, certificate: cert } })).pipe(delay(600));
      }
      return of(new HttpResponse({ status: 200, body: { valid: false } })).pipe(delay(600));
    }

    // GET /api/certificates/:id
    const detailMatch = url.match(/\/api\/certificates\/([a-zA-Z0-9-]+)$/);
    if (method === 'GET' && detailMatch) {
      const id = detailMatch[1];
      const stored = typeof window !== 'undefined' ? localStorage.getItem('mock_certs') : null;
      const db: Certificate[] = stored ? JSON.parse(stored) : certificates;
      
      const cert = db.find(c => c.id === id);
      if (cert) {
        return of(new HttpResponse({ status: 200, body: cert })).pipe(delay(300));
      }
      return of(new HttpResponse({ status: 404, body: { error: 'Certificate not found' } })).pipe(delay(300));
    }

    // POST /api/certificates — expects full payload with real data
    if (method === 'POST') {
      const payload = body as {
        studentId: string;
        studentName: string;
        courseId: string;
        courseTitle: string;
        category: string;
        hours: number;
        finalScore: number;
      };
      
      const issueDate = new Date().toISOString();
      const secret = 'nova-academy-integrity-key-2026';
      
      const rawData = `${payload.studentId}:${payload.courseId}:${issueDate}:${secret}`;
      
      return from(generateHash(rawData)).pipe(
        switchMap(hash => {
          const newCert: Certificate = {
            id: crypto.randomUUID(),
            serial: `NOV-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
            hash: hash,
            signature: '0x' + crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, ''),
            studentId: payload.studentId,
            studentName: payload.studentName,
            courseId: payload.courseId,
            courseTitle: payload.courseTitle,
            category: payload.category || 'Tecnología y Desarrollo',
            issueDate: issueDate,
            hours: payload.hours,
            finalScore: payload.finalScore,
            instructorName: 'Dr. Alejandro Valdez',
            instructorRole: 'Director Académico, Nova Academy'
          };

          certificates.push(newCert);
          try {
            const stored = localStorage.getItem('mock_certs');
            const currentCerts = stored ? JSON.parse(stored) : [];
            localStorage.setItem('mock_certs', JSON.stringify([...currentCerts, newCert]));
          } catch(e) {}

          return of(new HttpResponse({ status: 201, body: newCert }));
        }),
        delay(800)
      );
    }
  }

  return next(req);
}
