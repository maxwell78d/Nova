import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderQuestion } from '../../../models/question.model';

@Component({
  selector: 'app-order-question',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h4 class="text-xl font-bold text-zinc-900 mb-6">{{ question.prompt }}</h4>
    
    <div class="space-y-2">
      <p class="text-[10px] text-text-muted mb-4 font-black uppercase tracking-widest italic">Haz clic en los elementos en el orden correcto:</p>
      
      @if (isReviewMode) {
        <div class="grid grid-cols-1 gap-2 mb-6">
          <p class="text-[10px] font-black text-green-600 uppercase tracking-widest mb-2">Orden Correcto Esperado:</p>
          @for (option of question.correctOrder; track option; let i = $index) {
            <div class="p-4 border-2 border-green-600 bg-green-50 flex items-center justify-between">
              <span class="font-bold text-text-main text-sm">{{ option }}</span>
              <span class="w-8 h-8 bg-green-600 text-white flex items-center justify-center font-black">
                {{ i + 1 }}
              </span>
            </div>
          }
        </div>
      }

      <div class="grid grid-cols-1 gap-2">
        <p class="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">
          {{ isReviewMode ? 'Tu Respuesta:' : 'Opciones:' }}
        </p>
        @for (option of question.options; track option) {
          <button 
            (click)="!isReviewMode && toggleOption(option)"
            [disabled]="isReviewMode"
            class="p-4 border-2 text-left transition-all flex items-center justify-between"
            [class.border-primary-600]="isOptionInOrder(option) && !isReviewMode"
            [class.bg-primary-50]="isOptionInOrder(option) && !isReviewMode"
            [class.border-border-main]="!isOptionInOrder(option) && !isReviewMode"
            [class.border-red-600]="isReviewMode && isOptionInOrder(option) && getOptionIndex(option) !== question.correctOrder.indexOf(option)"
            [class.bg-red-50]="isReviewMode && isOptionInOrder(option) && getOptionIndex(option) !== question.correctOrder.indexOf(option)"
            [class.border-green-600]="isReviewMode && isOptionInOrder(option) && getOptionIndex(option) === question.correctOrder.indexOf(option)">
            
            <span class="font-bold text-text-main text-sm">{{ option }}</span>
            
            @if (isOptionInOrder(option)) {
              <span class="w-8 h-8 flex items-center justify-center font-black"
                [class.bg-primary-600]="!isReviewMode"
                [class.text-white]="!isReviewMode"
                [class.bg-red-600]="isReviewMode && getOptionIndex(option) !== question.correctOrder.indexOf(option)"
                [class.bg-green-600]="isReviewMode && getOptionIndex(option) === question.correctOrder.indexOf(option)">
                {{ getOptionIndex(option) + 1 }}
              </span>
            }
          </button>
        }
      </div>
      @if (!isReviewMode && (currentAnswer?.length || 0) > 0) {
        <button (click)="resetOrder()" class="mt-4 text-[10px] text-primary-600 font-black uppercase tracking-widest">Reiniciar orden</button>
      }
    </div>
  `
})
export class OrderQuestionComponent {
  @Input({ required: true }) question!: OrderQuestion;
  @Input() currentAnswer: string[] | undefined;
  @Input() isReviewMode = false;
  
  @Output() answerChange = new EventEmitter<string[]>();
  @Output() intentionalChange = new EventEmitter<void>();

  getOptionIndex(option: string): number {
    return this.currentAnswer ? this.currentAnswer.indexOf(option) : -1;
  }

  isOptionInOrder(option: string): boolean {
    return this.getOptionIndex(option) !== -1;
  }

  toggleOption(option: string) {
    const current = this.currentAnswer ? [...this.currentAnswer] : [];
    const idx = current.indexOf(option);
    if (idx === -1) {
      current.push(option);
    } else {
      current.splice(idx, 1);
    }
    this.answerChange.emit(current);
    
    if (current.length === this.question.options.length) {
      this.intentionalChange.emit();
    }
  }

  resetOrder() {
    this.answerChange.emit([]);
  }
}
