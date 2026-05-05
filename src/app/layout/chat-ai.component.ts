import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService, ChatMessage } from '../services/ai.service';
import { UiStateService } from '../services/ui-state.service';
import { ChatLogService } from '../services/chat-log.service';
import { AuthService } from '../services/auth.service';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-chat-ai',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (!uiState.isExamMode()) {
      <div class="fixed bottom-6 right-6 z-50">
        <!-- Floating Button -->
      <button 
        (click)="isOpen.set(!isOpen())"
        class="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center group"
        [class.rotate-90]="isOpen()"
      >
        <svg *ngIf="!isOpen()" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <svg *ngIf="isOpen()" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Chat Window -->
      <div 
        *ngIf="isOpen()"
        class="absolute bottom-20 right-0 w-[350px] md:w-[400px] h-[500px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden"
        [@slideInOut]
      >
        <!-- Header -->
        <div class="bg-blue-600 p-4 text-white flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 class="font-black text-sm text-text-main">NOVA AI Tutor</h3>
              <p class="text-[10px] text-blue-100">Potenciado por Gemini 2.0</p>
            </div>
          </div>
        </div>

        <!-- Messages -->
        <div class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950" #scrollContainer>
          <div *ngFor="let msg of messages()" 
            [class]="msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'"
          >
            <div 
              [class]="msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-2xl rounded-tr-none px-4 py-2 max-w-[85%] shadow-sm' 
                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-2xl rounded-tl-none px-4 py-2 max-w-[85%] border border-gray-100 dark:border-gray-700 shadow-sm'"
            >
              <p class="text-sm leading-relaxed whitespace-pre-wrap">{{ msg.parts[0].text }}</p>
            </div>
          </div>
          <div *ngIf="isTyping()" class="flex justify-start animate-pulse">
            <div class="bg-gray-200 dark:bg-gray-800 rounded-full px-4 py-2 flex gap-1">
              <div class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
              <div class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
              <div class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
            </div>
          </div>
        </div>

        <!-- Input -->
        <div class="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          <form (submit)="sendMessage($event)" class="flex gap-2">
            <input 
              type="text" 
              [(ngModel)]="currentInput" 
              name="input"
              placeholder="Pregunta algo sobre el curso..."
              class="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all dark:text-white"
              [disabled]="isTyping()"
            >
            <button 
              type="submit"
              [disabled]="!currentInput.trim() || isTyping()"
              class="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2 rounded-xl transition-all shadow-lg shadow-blue-500/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
  `],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', style({ transform: 'translateY(20px)', opacity: 0 }))
      ])
    ])
  ]
})
export class ChatAIComponent {
  private aiService = inject(AiService);
  private chatLogService = inject(ChatLogService);
  private authService = inject(AuthService);
  public uiState = inject(UiStateService);
  
  isOpen = signal(false);
  isTyping = signal(false);
  currentInput = '';
  messages = signal<ChatMessage[]>([
    { role: 'model', parts: [{ text: '¡Hola! Soy tu tutor personal de NOVA Academy. ¿En qué puedo ayudarte hoy con tus estudios?' }] }
  ]);

  sendMessage(event: Event) {
    event.preventDefault();
    if (!this.currentInput.trim() || this.isTyping()) return;

    const userMessage = this.currentInput;
    this.currentInput = '';
    
    // Add user message to UI
    const history = [...this.messages()];
    this.messages.set([...history, { role: 'user', parts: [{ text: userMessage }] }]);
    
    this.isTyping.set(true);

    this.aiService.askGroq(userMessage, undefined, history).subscribe(response => {
      this.messages.set([...this.messages(), { role: 'model', parts: [{ text: response }] }]);
      this.isTyping.set(false);
      
      // Log conversation to Firestore
      const user = this.authService.currentUser();
      if (user) {
        this.chatLogService.logConversation(
          user.id,
          user.name,
          userMessage,
          response
        );
      }
    });
  }
}
