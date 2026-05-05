import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, query, orderBy, limit, Timestamp } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface ChatLog {
  id?: string;
  userId: string;
  userName: string;
  message: string;
  response: string;
  timestamp: any;
  courseId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatLogService {
  private firestore = inject(Firestore);
  private chatsCollection = collection(this.firestore, 'chats');

  // Guardar una nueva conversación
  async logConversation(userId: string, userName: string, message: string, response: string, courseId?: string) {
    try {
      await addDoc(this.chatsCollection, {
        userId,
        userName,
        message,
        response,
        courseId: courseId || 'general',
        timestamp: Timestamp.now()
      });
    } catch (error) {
      console.error('Error logging conversation:', error);
    }
  }

  // Obtener los últimos chats para el monitor del admin
  getRecentChats(limitCount: number = 10): Observable<ChatLog[]> {
    const q = query(this.chatsCollection, orderBy('timestamp', 'desc'), limit(limitCount));
    return collectionData(q, { idField: 'id' }) as Observable<ChatLog[]>;
  }
}
