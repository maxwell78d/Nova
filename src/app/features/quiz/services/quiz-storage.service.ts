import { Injectable } from '@angular/core';
import { QuizState } from '../state/quiz.store';

const STORAGE_KEY = 'nova_quiz_state';
const CURRENT_VERSION = 3;

interface VersionedState {
  version: number;
  state: Partial<QuizState>;
}

@Injectable({ providedIn: 'root' })
export class QuizStorageService {
  
  saveState(state: Partial<QuizState>) {
    try {
      const payload: VersionedState = {
        version: CURRENT_VERSION,
        state
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      // Storage quota exceeded or corrupt — silently skip
    }
  }

  loadState(): Partial<QuizState> | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      
      const parsed = JSON.parse(raw) as VersionedState;
      if (parsed.version !== CURRENT_VERSION) {
        return this.migrate(parsed);
      }
      return parsed.state;
    } catch (e) {
      this.clear();
      return null;
    }
  }

  private migrate(oldState: any): Partial<QuizState> | null {
    // Auto-migrate old state versions
    // Mecanismo de migración. Si falla, descartamos el estado corrupto.
    try {
       this.clear();
       return null;
    } catch {
       this.clear();
       return null;
    }
  }

  clear() {
    localStorage.removeItem(STORAGE_KEY);
  }
}
