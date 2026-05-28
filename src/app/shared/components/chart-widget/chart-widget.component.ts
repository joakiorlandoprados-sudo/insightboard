import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
  viewChild
} from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import {
  Chart,
  ChartData,
  ChartOptions,
  ChartType,
  Filler,
  Legend,
  LineElement,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip
} from 'chart.js';
import { ChartDataset as InsightChartDataset, ChartPeriod } from '../../../core/models/dashboard.models';
import { exportRowsAsCsv } from '../../utils/csv-export.util';

Chart.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip
);

@Component({
  selector: 'app-chart-widget',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './chart-widget.component.html',
  styleUrl: './chart-widget.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartWidgetComponent {
  readonly title = input.required<string>();
  readonly chartType = input.required<ChartType>();
  readonly dataset = input<InsightChartDataset | null>(null);
  readonly period = input<ChartPeriod>('30d');
  readonly loading = input(false);
  readonly errorMessage = input<string | null>(null);
  readonly periodChange = output<ChartPeriod>();
  readonly retry = output<void>();
  readonly exported = signal(false);
  private readonly chart = viewChild(BaseChartDirective);

  readonly periods: ChartPeriod[] = ['7d', '30d', '90d', '1y'];

  readonly hasData = computed(() => !!this.dataset()?.labels.length);

  readonly chartData = computed<ChartData<ChartType>>(() => {
    const source = this.dataset();

    if (!source) {
      return { labels: [], datasets: [] };
    }

    if (this.chartType() === 'doughnut') {
      const [firstSeries] = source.datasets;
      return {
        labels: [...source.labels],
        datasets: [
          {
            data: [...(firstSeries?.data ?? [])],
            label: firstSeries?.label,
            backgroundColor:
              firstSeries?.segmentColors
                ? [...firstSeries.segmentColors]
                : ['#6366f1', '#10b981', '#f59e0b', '#38bdf8'],
            hoverOffset: 8,
            borderWidth: 0
          }
        ]
      };
    }

    if (this.chartType() === 'bar') {
      return {
        labels: [...source.labels],
        datasets: source.datasets.map((series) => ({
          label: series.label,
          data: [...series.data],
          backgroundColor: withAlpha(series.color, 0.85),
          borderColor: series.color,
          borderWidth: 1,
          borderRadius: 14,
          borderSkipped: false
        }))
      };
    }

    return {
      labels: [...source.labels],
      datasets: source.datasets.map((series) => ({
        label: series.label,
        data: [...series.data],
        borderColor: series.color,
        backgroundColor: withAlpha(series.color, 0.14),
        fill: true,
        tension: 0.36,
        borderWidth: 3,
        pointRadius: 0,
        pointHoverRadius: 5
      }))
    };
  });

  constructor() {
    effect(() => {
      this.chartData();
      this.chartOptions();

      if (this.loading()) {
        return;
      }

      queueMicrotask(() => this.chart()?.update());
    });
  }

  readonly chartOptions = computed<ChartOptions<ChartType>>(() => {
    const type = this.chartType();

    const sharedOptions: ChartOptions<ChartType> = {
      maintainAspectRatio: false,
      responsive: true,
      animation: {
        duration: 520,
        easing: 'easeOutQuart'
      },
      plugins: {
        legend: {
          display: true,
          position: type === 'doughnut' ? 'bottom' : 'top',
          labels: {
            color: '#cbd5e1',
            usePointStyle: true,
            boxWidth: 10,
            boxHeight: 10,
            padding: 18,
            font: {
              family: 'DM Sans, sans-serif',
              size: 12,
              weight: 600
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(12, 15, 22, 0.95)',
          borderColor: 'rgba(99, 102, 241, 0.24)',
          borderWidth: 1,
          titleColor: '#f8fafc',
          bodyColor: '#e2e8f0',
          padding: 12,
          displayColors: true
        }
      }
    };

    if (type === 'doughnut') {
      return {
        ...sharedOptions,
        cutout: '70%'
      };
    }

    return {
      ...sharedOptions,
      scales: {
        x: {
          ticks: {
            color: '#94a3b8'
          },
          grid: {
            display: false
          },
          border: {
            color: 'rgba(148, 163, 184, 0.14)'
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: '#94a3b8'
          },
          grid: {
            color: 'rgba(148, 163, 184, 0.1)'
          },
          border: {
            dash: [4, 4],
            color: 'rgba(148, 163, 184, 0.14)'
          }
        }
      }
    };
  });

  exportChart(): void {
    const dataset = this.dataset();

    if (!dataset) {
      return;
    }

    const rows = dataset.labels.map((label, index) => {
      const row: Record<string, string | number> = { Etiqueta: label };
      dataset.datasets.forEach((series) => {
        row[series.label] = series.data[index] ?? 0;
      });
      return row;
    });

    if (exportRowsAsCsv(this.title(), rows)) {
      this.exported.set(true);
      window.setTimeout(() => this.exported.set(false), 2_000);
    }
  }
}

function withAlpha(hexColor: string, alpha: number): string {
  const normalized = hexColor.replace('#', '');
  const pairs = normalized.length === 3
    ? normalized.split('').map((value) => `${value}${value}`)
    : [normalized.slice(0, 2), normalized.slice(2, 4), normalized.slice(4, 6)];

  const [red, green, blue] = pairs.map((value) => Number.parseInt(value, 16));
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}
