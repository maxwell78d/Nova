import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShortQuestion } from '../../../models/question.model';

@Component({
  selector: 'app-short-question',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h4 class="text-xl font-bold text-zinc-900 mb-6">{{ question.prompt }}</h4>
    
    <div>
      @if (isReviewMode) {
        <div class="mb-4 p-4 bg-surface border border-border-main">
          <p class="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Tu respuesta:</p>
          <p class="text-text-main font-bold">{{ currentAnswer || 'Sin respuesta' }}</p>
        </div>
        <div class="p-4 bg-primary-50 border border-primary-100">
          <p class="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-1">Criterio de evaluación:</p>
          <p class="text-primary-800 text-sm italic font-medium">{{ question.explanation }}</p>
        </div>
      } @else {
        <textarea 
          #textarea
          [value]="currentAnswer || ''"
          (input)="onInput($event)"
          (blur)="onBlur()"
          placeholder="Escribe tu respuesta aquí (máx. 50 palabras)..."
          class="w-full h-32 p-4 border-2 border-border-main focus:border-primary-600 focus:outline-none transition-all resize-none font-medium"
        ></textarea>
        <p class="text-right text-[10px] font-black text-text-muted uppercase tracking-widest mt-1">{{ wordCount }}/50 palabras</p>
      }
    </div>
  `
})
export class ShortQuestionComponent implements AfterViewInit {
  @Input({ required: true }) question!: ShortQuestion;
  @Input() currentAnswer: string | undefined;
  @Input() isReviewMode = false;
  
  @Output() answerChange = new EventEmitter<string>();
  @Output() intentionalChange = new EventEmitter<void>();

  @ViewChild('textarea') textarea!: ElementRef<HTMLTextAreaElement>;

  get wordCount(): number {
    if (!this.currentAnswer) return 0;
    const trimmed = this.currentAnswer.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  }

  ngAfterViewInit() {
    // Si queremos enfocar el textarea al renderizar:
    // if (!this.isReviewMode && this.textarea) {
    //   this.textarea.nativeElement.focus();
    // }
  }

  onInput(event: Event) {
    const el = event.target as HTMLTextAreaElement;
    this.answerChange.emit(el.value);
  }

  onBlur() {
    if (this.currentAnswer && this.currentAnswer.trim().length > 10) {
      this.intentionalChange.emit();
    }
  }
}
