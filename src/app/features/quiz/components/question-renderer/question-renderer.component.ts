import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NormalizedQuestion, MCQuestion, OrderQuestion, ShortQuestion } from '../../models/question.model';
import { MCQuestionComponent } from '../questions/mc-question/mc-question.component';
import { OrderQuestionComponent } from '../questions/order-question/order-question.component';
import { ShortQuestionComponent } from '../questions/short-question/short-question.component';

@Component({
  selector: 'app-question-renderer',
  standalone: true,
  imports: [CommonModule, MCQuestionComponent, OrderQuestionComponent, ShortQuestionComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (question; as q) {
      <div [attr.data-key]="q.id">
        @if (q.type === 'mc') {
          <app-mc-question
            [question]="asMC(q)"
            [currentAnswer]="currentAnswer"
            [isReviewMode]="isReviewMode"
            (answerChange)="answerChange.emit($event)"
            (intentionalChange)="intentionalChange.emit()">
          </app-mc-question>
        }

        @if (q.type === 'order') {
          <app-order-question
            [question]="asOrder(q)"
            [currentAnswer]="currentAnswer"
            [isReviewMode]="isReviewMode"
            (answerChange)="answerChange.emit($event)"
            (intentionalChange)="intentionalChange.emit()">
          </app-order-question>
        }

        @if (q.type === 'short') {
          <app-short-question
            [question]="asShort(q)"
            [currentAnswer]="currentAnswer"
            [isReviewMode]="isReviewMode"
            (answerChange)="answerChange.emit($event)"
            (intentionalChange)="intentionalChange.emit()">
          </app-short-question>
        }
      </div>
    }
  `
})
export class QuestionRendererComponent {
  private _question!: NormalizedQuestion;
  @Input({ required: true })
  set question(val: NormalizedQuestion) {
    this._question = val;
  }
  get question() { return this._question; }

  @Input() currentAnswer: any;
  @Input() isReviewMode = false;

  @Output() answerChange = new EventEmitter<any>();
  @Output() intentionalChange = new EventEmitter<void>();

  // Type helpers for the template
  asMC(q: NormalizedQuestion): MCQuestion { return q as MCQuestion; }
  asOrder(q: NormalizedQuestion): OrderQuestion { return q as OrderQuestion; }
  asShort(q: NormalizedQuestion): ShortQuestion { return q as ShortQuestion; }
}
