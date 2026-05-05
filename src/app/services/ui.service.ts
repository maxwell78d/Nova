import { Injectable, signal } from '@angular/core';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class UiService {
  notifications = signal<Notification[]>([]);

  notify(type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) {
    const id = crypto.randomUUID();
    const notification: Notification = { id, type, title, message };
    
    this.notifications.update(n => [...n, notification]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      this.removeNotification(id);
    }, 5000);
  }

  removeNotification(id: string) {
    this.notifications.update(n => n.filter(item => item.id !== id));
  }

  // Helper for common actions
  success(message: string) {
    this.notify('success', '¡Éxito!', message);
  }

  error(message: string) {
    this.notify('error', 'Error', message);
  }
}
