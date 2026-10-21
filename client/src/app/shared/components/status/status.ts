import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-loading',
  template: `
    <div class="status status--loading" role="status">
      <span class="status__spinner" aria-hidden="true"></span>
      <span>{{ label() }}</span>
    </div>
  `,
})
export class Loading {
  readonly label = input('Loading…');
}

@Component({
  selector: 'app-alert',
  template: `
    <div class="alert-box" [class.alert-box--success]="tone() === 'success'" [attr.role]="tone() === 'error' ? 'alert' : 'status'">
      <span><ng-content /></span>
      @if (retryLabel()) {
        <button type="button" class="alert-box__retry" (click)="retry.emit()">{{ retryLabel() }}</button>
      }
    </div>
  `,
})
export class Alert {
  readonly tone = input<'error' | 'success'>('error');
  readonly retryLabel = input('');
  readonly retry = output<void>();
}

@Component({
  selector: 'app-empty-state',
  template: `<p class="status status--empty"><ng-content /></p>`,
})
export class EmptyState {}
