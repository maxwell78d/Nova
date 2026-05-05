import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class QuizSessionLockService implements OnDestroy {
  private channel = new BroadcastChannel('quiz-session-lock');
  public conflictDetected = new Subject<boolean>();

  constructor() {
    this.channel.onmessage = (event) => {
      if (event.data.type === 'HEARTBEAT') {
        this.conflictDetected.next(true);
      }
    };
  }

  acquireLock(quizId: string) {
    this.channel.postMessage({ type: 'HEARTBEAT', quizId });
  }

  releaseLock() {
    this.channel.postMessage({ type: 'RELEASE' });
  }

  ngOnDestroy() {
    this.channel.close();
  }
}
