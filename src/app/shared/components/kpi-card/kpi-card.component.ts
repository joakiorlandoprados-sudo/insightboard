import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { computed, effect, input, signal } from '@angular/core';
import { KpiMetric } from '../../../core/models/dashboard.models';
import { CurrencyFormatPipe } from '../../pipes/currency-format.pipe';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CurrencyFormatPipe, DecimalPipe],
  templateUrl: './kpi-card.component.html',
  styleUrl: './kpi-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KpiCardComponent {
  readonly metric = input<KpiMetric | null>(null);
  readonly loading = input(false);
  readonly animatedValue = signal(0);

  readonly trendDelta = computed(() => {
    const metric = this.metric();

    if (!metric || metric.previousValue === 0) {
      return 0;
    }

    return ((metric.value - metric.previousValue) / Math.abs(metric.previousValue)) * 100;
  });

  readonly trendLabel = computed(() => `${Math.abs(this.trendDelta()).toFixed(1)}%`);

  constructor() {
    effect((onCleanup) => {
      const metric = this.metric();

      if (this.loading() || !metric) {
        this.animatedValue.set(0);
        return;
      }

      const target = metric.value;
      const totalSteps = 28;
      let currentStep = 0;

      const intervalId = window.setInterval(() => {
        currentStep += 1;
        const progress = currentStep / totalSteps;
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        const nextValue = target * easedProgress;

        this.animatedValue.set(
          metric.unit === 'percentage' ? Number(nextValue.toFixed(1)) : Math.round(nextValue)
        );

        if (currentStep >= totalSteps) {
          window.clearInterval(intervalId);
          this.animatedValue.set(target);
        }
      }, 32);

      onCleanup(() => window.clearInterval(intervalId));
    });
  }
}
