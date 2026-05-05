import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Certificate } from '../models/certificate.model';

@Injectable({
  providedIn: 'root'
})
export class CertificateService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/certificates';

  /**
   * Generate a certificate with REAL user and course data.
   * The caller must provide all required fields — no placeholders allowed.
   */
  async generateCertificate(payload: {
    studentId: string;
    studentName: string;
    courseId: string;
    courseTitle: string;
    category: string;
    hours: number;
    finalScore: number;
  }): Promise<Certificate> {
    return firstValueFrom(this.http.post<Certificate>(this.API_URL, payload));
  }

  async getCertificate(id: string): Promise<Certificate> {
    return firstValueFrom(this.http.get<Certificate>(`${this.API_URL}/${id}`));
  }

  async verifyCertificate(id: string): Promise<{ valid: boolean, certificate?: Certificate }> {
    return firstValueFrom(this.http.get<{ valid: boolean, certificate?: Certificate }>(`${this.API_URL}/verify/${id}`));
  }
}
