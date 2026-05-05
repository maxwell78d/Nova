import { Component, inject, OnInit } from '@angular/core';
import { ThemeService } from './core/design-system/theme.service';
import { SessionService } from './services/session.service';
import { AuthService } from './services/auth.service';
import { ActivityTrackerService } from './services/activity-tracker.service';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './layout/navbar.component';
import { FooterComponent } from './layout/footer.component';
import { ChatAIComponent } from './layout/chat-ai.component';
import { UiService } from './services/ui.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ChatAIComponent, MatIconModule],
  template: `
    <div class="flex flex-col min-h-screen font-sans">
      <app-navbar></app-navbar>
      <main class="flex-grow">
        <router-outlet></router-outlet>
      </main>
      <app-footer></app-footer>
      <app-chat-ai></app-chat-ai>

      <!-- Global Notifications -->
      <div class="fixed bottom-8 right-8 z-[9999] flex flex-col gap-3 max-w-sm w-full">
        @for (n of ui.notifications(); track n.id) {
          <div class="bg-white border-l-4 p-5 shadow-2xl animate-in slide-in-from-right-10 duration-300 flex items-start gap-4 group"
               [class.border-green-500]="n.type === 'success'"
               [class.border-red-500]="n.type === 'error'"
               [class.border-blue-500]="n.type === 'info'"
               [class.border-amber-500]="n.type === 'warning'">
            <div class="flex-grow">
              <h4 class="text-[10px] font-black uppercase tracking-widest mb-1"
                  [class.text-green-600]="n.type === 'success'"
                  [class.text-red-600]="n.type === 'error'"
                  [class.text-blue-600]="n.type === 'info'"
                  [class.text-amber-600]="n.type === 'warning'">
                {{ n.title }}
              </h4>
              <p class="text-xs font-bold text-text-main leading-relaxed">{{ n.message }}</p>
            </div>
            <button (click)="ui.removeNotification(n.id)" class="text-text-muted hover:text-text-main transition-colors">
              <mat-icon class="text-sm">close</mat-icon>
            </button>
          </div>
        }
      </div>
    </div>
  `
})
export class AppComponent implements OnInit {
  ui = inject(UiService);
  private themeService = inject(ThemeService);
  private sessionService = inject(SessionService);
  private auth = inject(AuthService);
  private activityTracker = inject(ActivityTrackerService);

  ngOnInit() {
    // Initialize activity tracking for everyone (including guests)
    this.activityTracker.initialize();

    // Initialize session tracking if user is logged in
    if (this.auth.currentUser()) {
      this.sessionService.initialize();
    }
  }
}
