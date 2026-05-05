import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MCQuestion } from '../../../models/question.model';

@Component({
  selector: 'app-mc-question',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <h4 class="text-xl font-bold text-zinc-900 mb-6">{{ question.prompt }}</h4>
    
    <div class="space-y-3">
      @for (option of question.options; track option + $index) {
        <button 
          (click)="!isReviewMode && onSelect($index)"
          [disabled]="isReviewMode"
          class="w-full text-left p-4 border-2 transition-all"
          [class.border-primary-600]="currentAnswer === $index && !isReviewMode"
          [class.bg-primary-50]="currentAnswer === $index && !isReviewMode"
          [class.border-green-600]="isReviewMode && question.correctAnswerIndex === $index"
          [class.bg-green-50]="isReviewMode && question.correctAnswerIndex === $index"
          [class.border-red-600]="isReviewMode && currentAnswer === $index && question.correctAnswerIndex !== $index"
          [class.bg-red-50]="isReviewMode && currentAnswer === $index && question.correctAnswerIndex !== $index"
          [class.border-border-main]="!isReviewMode && currentAnswer !== $index"
          [class.opacity-60]="isReviewMode && currentAnswer !== $index && question.correctAnswerIndex !== $index">
          <div class="flex items-center gap-3">
            <div class="w-6 h-6 border-2 flex items-center justify-center"
                 [class.border-primary-600]="currentAnswer === $index && !isReviewMode"
                 [class.border-green-600]="isReviewMode && question.correctAnswerIndex === $index"
                 [class.border-border-main]="currentAnswer !== $index && (!isReviewMode || question.correctAnswerIndex !== $index)">
              @if (currentAnswer === $index || (isReviewMode && question.correctAnswerIndex === $index)) {
                <div class="w-3 h-3" 
                     [class.bg-primary-600]="!isReviewMode"
                     [class.bg-green-600]="isReviewMode && question.correctAnswerIndex === $index"
                     [class.bg-red-600]="isReviewMode && currentAnswer === $index && question.correctAnswerIndex !== $index"></div>
              }
            </div>
            <span class="text-text-main font-bold text-sm">{{ option }}</span>
            @if (isReviewMode && question.correctAnswerIndex === $index) {
              <mat-icon class="text-green-600 ml-auto">check</mat-icon>
            }
          </div>
        </button>
      }
    </div>
  `
})
export class MCQuestionComponent {
  private _question!: MCQuestion;
  @Input({ required: true }) 
  set question(val: MCQuestion) {
    this._question = val;
  }
  get question() { return this._question; }

  @Input() currentAnswer: number | undefined;
  @Input() isReviewMode = false;
  
  @Output() answerChange = new EventEmitter<number>();
  @Output() intentionalChange = new EventEmitter<void>();

  onSelect(index: number) {
    this.answerChange.emit(index);
    this.intentionalChange.emit();
  }

}
