import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';
import {
  ApiResponse,
  ChartDataset,
  ChartPeriod,
  FilterState,
  KpiMetric,
  Transaction
} from '../../core/models/dashboard.models';
import { ApiService } from '../../core/services/api.service';
import {
  buildFilterFromPreset,
  describeFilterRange
} from '../../core/utils/date-range.util';
import { ChartWidgetComponent } from '../../shared/components/chart-widget/chart-widget.component';
import { DataTableComponent } from '../../shared/components/data-table/data-table.component';
import { ErrorBannerComponent } from '../../shared/components/error-banner/error-banner.component';
import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    ChartWidgetComponent,
    DataTableComponent,
    DatePipe,
    ErrorBannerComponent,
    KpiCardComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  readonly filters = signal<FilterState>(buildFilterFromPreset('month'));
  readonly dateFromDraft = signal(this.filters().dateFrom);
  readonly dateToDraft = signal(this.filters().dateTo);
  readonly filterError = signal<string | null>(null);

  readonly kpis = signal<KpiMetric[]>([]);
  readonly revenueChart = signal<ChartDataset | null>(null);
  readonly categoryChart = signal<ChartDataset | null>(null);
  readonly channelChart = signal<ChartDataset | null>(null);
  readonly transactions = signal<Transaction[]>([]);

  readonly revenuePeriod = signal<ChartPeriod>('1y');
  readonly categoryPeriod = signal<ChartPeriod>('30d');
  readonly channelPeriod = signal<ChartPeriod>('30d');

  readonly kpisLoading = signal(true);
  readonly revenueLoading = signal(true);
  readonly categoryLoading = signal(true);
  readonly channelLoading = signal(true);
  readonly transactionsLoading = signal(true);

  readonly revenueError = signal<string | null>(null);
  readonly categoryError = signal<string | null>(null);
  readonly channelError = signal<string | null>(null);
  readonly transactionsError = signal<string | null>(null);
  readonly bannerMessage = signal<string | null>(null);
  readonly lastUpdated = signal<string | null>(null);

  readonly pendingRequests = signal(0);
  readonly hasLoadedOnce = signal(false);

  readonly filterBadge = computed(() => describeFilterRange(this.filters()));
  readonly refilterOverlayVisible = computed(
    () => this.hasLoadedOnce() && this.pendingRequests() > 0
  );
  readonly kpiCards = computed(() => (this.kpis().length ? this.kpis() : KPI_PLACEHOLDERS));

  readonly presets = [
    { id: 'today', label: 'Hoy' },
    { id: 'week', label: 'Esta semana' },
    { id: 'month', label: 'Este mes' },
    { id: 'quarter', label: 'Este trimestre' }
  ] as const;

  private readonly api = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);

  private retryAction: (() => void) | null = null;
  private requestIds = {
    kpis: 0,
    revenue: 0,
    categories: 0,
    channels: 0,
    transactions: 0
  };

  constructor() {
    this.reloadDashboard();
  }

  applyPreset(preset: 'today' | 'week' | 'month' | 'quarter'): void {
    const nextFilter = buildFilterFromPreset(preset);
    this.filters.set(nextFilter);
    this.dateFromDraft.set(nextFilter.dateFrom);
    this.dateToDraft.set(nextFilter.dateTo);
    this.filterError.set(null);
    this.reloadDashboard();
  }

  updateDateDraft(field: 'dateFrom' | 'dateTo', value: string): void {
    if (field === 'dateFrom') {
      this.dateFromDraft.set(value);
    } else {
      this.dateToDraft.set(value);
    }

    const dateFrom = this.dateFromDraft();
    const dateTo = this.dateToDraft();

    if (!dateFrom || !dateTo) {
      return;
    }

    if (dateFrom > dateTo) {
      this.filterError.set('La fecha inicial no puede ser posterior a la fecha final.');
      return;
    }

    this.filterError.set(null);

    const nextFilter: FilterState = {
      dateFrom,
      dateTo,
      preset: 'custom'
    };

    if (
      nextFilter.dateFrom === this.filters().dateFrom &&
      nextFilter.dateTo === this.filters().dateTo &&
      nextFilter.preset === this.filters().preset
    ) {
      return;
    }

    this.filters.set(nextFilter);
    this.reloadDashboard();
  }

  onRevenuePeriodChange(period: ChartPeriod): void {
    if (period === this.revenuePeriod()) {
      return;
    }

    this.revenuePeriod.set(period);
    this.loadRevenueChart();
  }

  onCategoryPeriodChange(period: ChartPeriod): void {
    if (period === this.categoryPeriod()) {
      return;
    }

    this.categoryPeriod.set(period);
    this.loadCategoryChart();
  }

  onChannelPeriodChange(period: ChartPeriod): void {
    if (period === this.channelPeriod()) {
      return;
    }

    this.channelPeriod.set(period);
    this.loadChannelChart();
  }

  retryBannerAction(): void {
    this.retryAction?.();
  }

  dismissBanner(): void {
    this.bannerMessage.set(null);
    this.retryAction = null;
  }

  reloadDashboard(): void {
    this.loadKpis();
    this.loadRevenueChart();
    this.loadCategoryChart();
    this.loadChannelChart();
    this.loadTransactions();
  }

  loadKpis(): void {
    const requestId = ++this.requestIds.kpis;
    this.kpisLoading.set(true);
    this.startRequest();

    this.api
      .get<ApiResponse<KpiMetric[]>>('dashboard/kpis', this.filterParams())
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          if (requestId === this.requestIds.kpis) {
            this.kpisLoading.set(false);
          }
          this.finishRequest();
        })
      )
      .subscribe({
        next: (response) => {
          if (requestId !== this.requestIds.kpis) {
            return;
          }

          this.kpis.set(response.data);
          this.markSuccess(response.timestamp);
        },
        error: (error) => {
          if (requestId !== this.requestIds.kpis) {
            return;
          }

          this.showBanner(this.resolveError(error, 'No fue posible actualizar los KPI.'), () =>
            this.loadKpis()
          );
        }
      });
  }

  loadRevenueChart(): void {
    const requestId = ++this.requestIds.revenue;
    this.revenueLoading.set(true);
    this.revenueError.set(null);
    this.startRequest();

    this.api
      .get<ApiResponse<ChartDataset>>('dashboard/charts/revenue', {
        ...this.filterParams(),
        period: this.revenuePeriod()
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          if (requestId === this.requestIds.revenue) {
            this.revenueLoading.set(false);
          }
          this.finishRequest();
        })
      )
      .subscribe({
        next: (response) => {
          if (requestId !== this.requestIds.revenue) {
            return;
          }

          this.revenueChart.set(response.data);
          this.markSuccess(response.timestamp);
        },
        error: (error) => {
          if (requestId !== this.requestIds.revenue) {
            return;
          }

          this.revenueChart.set(null);
          this.revenueError.set(this.resolveError(error, 'Falló la carga del gráfico de ingresos.'));
          this.showBanner(this.revenueError()!, () => this.loadRevenueChart());
        }
      });
  }

  loadCategoryChart(): void {
    const requestId = ++this.requestIds.categories;
    this.categoryLoading.set(true);
    this.categoryError.set(null);
    this.startRequest();

    this.api
      .get<ApiResponse<ChartDataset>>('dashboard/charts/categories', {
        ...this.filterParams(),
        period: this.categoryPeriod()
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          if (requestId === this.requestIds.categories) {
            this.categoryLoading.set(false);
          }
          this.finishRequest();
        })
      )
      .subscribe({
        next: (response) => {
          if (requestId !== this.requestIds.categories) {
            return;
          }

          this.categoryChart.set(response.data);
          this.markSuccess(response.timestamp);
        },
        error: (error) => {
          if (requestId !== this.requestIds.categories) {
            return;
          }

          this.categoryChart.set(null);
          this.categoryError.set(this.resolveError(error, 'Falló el gráfico de categorías.'));
          this.showBanner(this.categoryError()!, () => this.loadCategoryChart());
        }
      });
  }

  loadChannelChart(): void {
    const requestId = ++this.requestIds.channels;
    this.channelLoading.set(true);
    this.channelError.set(null);
    this.startRequest();

    this.api
      .get<ApiResponse<ChartDataset>>('dashboard/charts/channels', {
        ...this.filterParams(),
        period: this.channelPeriod()
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          if (requestId === this.requestIds.channels) {
            this.channelLoading.set(false);
          }
          this.finishRequest();
        })
      )
      .subscribe({
        next: (response) => {
          if (requestId !== this.requestIds.channels) {
            return;
          }

          this.channelChart.set(response.data);
          this.markSuccess(response.timestamp);
        },
        error: (error) => {
          if (requestId !== this.requestIds.channels) {
            return;
          }

          this.channelChart.set(null);
          this.channelError.set(this.resolveError(error, 'Falló la distribución por canal.'));
          this.showBanner(this.channelError()!, () => this.loadChannelChart());
        }
      });
  }

  loadTransactions(): void {
    const requestId = ++this.requestIds.transactions;
    this.transactionsLoading.set(true);
    this.transactionsError.set(null);
    this.startRequest();

    this.api
      .get<ApiResponse<Transaction[]>>('dashboard/transactions', this.filterParams())
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          if (requestId === this.requestIds.transactions) {
            this.transactionsLoading.set(false);
          }
          this.finishRequest();
        })
      )
      .subscribe({
        next: (response) => {
          if (requestId !== this.requestIds.transactions) {
            return;
          }

          this.transactions.set(response.data);
          this.markSuccess(response.timestamp);
        },
        error: (error) => {
          if (requestId !== this.requestIds.transactions) {
            return;
          }

          this.transactionsError.set(
            this.resolveError(error, 'No fue posible obtener la tabla de transacciones.')
          );
          this.showBanner(this.transactionsError()!, () => this.loadTransactions());
        }
      });
  }

  private filterParams() {
    const filter = this.filters();
    return {
      dateFrom: filter.dateFrom,
      dateTo: filter.dateTo,
      preset: filter.preset
    };
  }

  private startRequest(): void {
    this.pendingRequests.update((value) => value + 1);
  }

  private finishRequest(): void {
    this.pendingRequests.update((value) => Math.max(0, value - 1));
  }

  private markSuccess(timestamp: string): void {
    this.lastUpdated.set(timestamp);
    this.hasLoadedOnce.set(true);
  }

  private showBanner(message: string, action: () => void): void {
    this.bannerMessage.set(message);
    this.retryAction = action;
  }

  private resolveError(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      const apiMessage = error.error?.message;
      if (typeof apiMessage === 'string' && apiMessage.trim()) {
        return apiMessage;
      }
    }

    return fallback;
  }
}

const KPI_PLACEHOLDERS: KpiMetric[] = [
  {
    id: 'revenue',
    label: 'Total de Ingresos',
    value: 0,
    previousValue: 0,
    unit: 'currency',
    trend: 'neutral',
    icon: 'revenue'
  },
  {
    id: 'clients',
    label: 'Nuevos Clientes',
    value: 0,
    previousValue: 0,
    unit: 'number',
    trend: 'neutral',
    icon: 'clients'
  },
  {
    id: 'conversion',
    label: 'Tasa de Conversión',
    value: 0,
    previousValue: 0,
    unit: 'percentage',
    trend: 'neutral',
    icon: 'conversion'
  },
  {
    id: 'tickets',
    label: 'Tickets Abiertos',
    value: 0,
    previousValue: 0,
    unit: 'number',
    trend: 'neutral',
    icon: 'tickets'
  }
];
