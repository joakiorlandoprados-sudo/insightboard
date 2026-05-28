import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-error-banner',
  standalone: true,
  templateUrl: './error-banner.component.html',
  styleUrl: './error-banner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorBannerComponent {
  readonly message = input<string | null>(null);
  readonly visible = input(false);
  readonly retry = output<void>();
  readonly dismiss = output<void>();
}
