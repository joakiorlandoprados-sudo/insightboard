import {
  HttpErrorResponse,
  HttpEvent,
  HttpParams,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of, throwError, timer } from 'rxjs';
import { delay, map, switchMap } from 'rxjs/operators';
import {
  ApiResponse,
  ChartDataset,
  ChartPeriod,
  DashboardQueryParams,
  FilterState,
  KpiMetric,
  Transaction,
  TransactionStatus
} from '../models/dashboard.models';
import {
  buildFilterFromPreset,
  getRangeMetrics,
  parseInputDate
} from '../utils/date-range.util';

@Injectable({
  providedIn: 'root'
})
export class DataMockService {
  private readonly productCatalog = [
    'Insight Suite Enterprise',
    'Pulse CRM Pro',
    'Automations Hub',
    'Support AI Desk',
    'Forecast Engine',
    'Retail Sync',
    'Customer Journey Kit',
    'Ops Analytics Cloud'
  ];

  private readonly customerChannels = ['Web', 'App', 'Tienda física', 'Referidos'];
  private readonly customerNames = [
    'Aster Labs',
    'Nova Retail',
    'BluePeak Group',
    'Solstice Energy',
    'Urban Hive',
    'Atlas Finance',
    'Corely Systems',
    'Vertex Foods',
    'Lighthouse Media',
    'Aquila Health'
  ];

  handleRequest(req: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
    const endpoint = req.url.replace(/^\/api\/?/, '');
    const query = this.paramsToQuery(req.params);

    if (req.method !== 'GET') {
      return throwError(() =>
        new HttpErrorResponse({
          status: 405,
          statusText: 'Method Not Allowed',
          error: { message: 'Solo se soportan peticiones GET en el mock.' }
        })
      );
    }

    switch (endpoint) {
      case 'dashboard/kpis':
        return this.getKpis(this.resolveFilter(query)).pipe(this.toHttpResponse());
      case 'dashboard/charts/revenue':
        return this.getRevenueSeries(this.resolvePeriod(query.period), this.resolveFilter(query)).pipe(
          this.toHttpResponse()
        );
      case 'dashboard/charts/categories':
        return this.getCategorySales(this.resolvePeriod(query.period), this.resolveFilter(query)).pipe(
          this.toHttpResponse()
        );
      case 'dashboard/charts/channels':
        return this.getChannelDistribution(
          this.resolvePeriod(query.period),
          this.resolveFilter(query)
        ).pipe(this.toHttpResponse());
      case 'dashboard/transactions':
        return this.getTransactions(this.resolveFilter(query)).pipe(this.toHttpResponse());
      default:
        return throwError(() =>
          new HttpErrorResponse({
            status: 404,
            statusText: 'Not Found',
            error: { message: `Endpoint mock no encontrado: ${endpoint}` }
          })
        );
    }
  }

  getKpis(filter: FilterState): Observable<ApiResponse<KpiMetric[]>> {
    return this.respond(`kpis|${JSON.stringify(filter)}`, () => {
      const range = getRangeMetrics(filter);
      const random = this.createSeededRandom(`kpis-${filter.dateFrom}-${filter.dateTo}`);
      const revenue = Math.round(
        (78_000 + range.totalDays * 1_460 + random() * 42_000) *
          (filter.preset === 'quarter' ? 1.42 : 1)
      );
      const previousRevenue = Math.round(revenue * (0.86 + random() * 0.18));

      const newClients = Math.round(24 + range.totalDays * 1.5 + random() * 36);
      const previousClients = Math.round(newClients * (0.84 + random() * 0.2));

      const conversion = Number((2.8 + random() * 3.6).toFixed(1));
      const previousConversion = Number((conversion * (0.9 + random() * 0.16)).toFixed(1));

      const openTickets = Math.round(18 + random() * 55 + range.totalDays * 0.5);
      const previousTickets = Math.max(
        6,
        Math.round(openTickets * (0.82 + random() * 0.28))
      );

      return this.createResponse<KpiMetric[]>(
        [
          this.metric('revenue', 'Total de Ingresos', revenue, previousRevenue, 'currency'),
          this.metric('clients', 'Nuevos Clientes', newClients, previousClients, 'number'),
          this.metric(
            'conversion',
            'Tasa de Conversión',
            conversion,
            previousConversion,
            'percentage'
          ),
          this.metric('tickets', 'Tickets Abiertos', openTickets, previousTickets, 'number')
        ],
        4
      );
    });
  }

  getRevenueSeries(
    period: ChartPeriod,
    filter: FilterState
  ): Observable<ApiResponse<ChartDataset>> {
    return this.respond(`revenue|${period}|${JSON.stringify(filter)}`, () => {
      const random = this.createSeededRandom(`revenue-${period}-${filter.dateFrom}-${filter.dateTo}`);
      const frames = this.createTimeline(period, filter.dateTo);
      const range = getRangeMetrics(filter);
      const base = 18_000 + range.totalDays * 650;

      const data = frames.map((_, index) =>
        Math.round(base * (0.55 + index * 0.06 + random() * 0.32))
      );

      return this.createResponse<ChartDataset>(
        {
          period,
          labels: frames.map((frame) => frame.label),
          datasets: [
            {
              label: 'Ingresos',
              data,
              color: '#6366f1'
            }
          ]
        },
        data.length
      );
    });
  }

  getCategorySales(
    period: ChartPeriod,
    filter: FilterState
  ): Observable<ApiResponse<ChartDataset>> {
    return this.respond(`categories|${period}|${JSON.stringify(filter)}`, () => {
      const random = this.createSeededRandom(
        `categories-${period}-${filter.dateFrom}-${filter.dateTo}`
      );
      const labels = [
        'Analytics',
        'CRM',
        'Automatización',
        'Soporte AI',
        'Integraciones',
        'Consultoría'
      ];
      const scale = this.periodScale(period);

      const data = labels.map((_, index) =>
        Math.round((9_000 + index * 1_250 + random() * 7_800) * scale)
      );

      return this.createResponse<ChartDataset>(
        {
          period,
          labels,
          datasets: [
            {
              label: 'Ventas',
              data,
              color: '#10b981'
            }
          ]
        },
        data.length
      );
    });
  }

  getChannelDistribution(
    period: ChartPeriod,
    filter: FilterState
  ): Observable<ApiResponse<ChartDataset>> {
    return this.respond(`channels|${period}|${JSON.stringify(filter)}`, () => {
      const random = this.createSeededRandom(
        `channels-${period}-${filter.dateFrom}-${filter.dateTo}`
      );

      const data = this.customerChannels.map((_, index) =>
        Math.round(18 + index * 4 + random() * 35)
      );

      return this.createResponse<ChartDataset>(
        {
          period,
          labels: [...this.customerChannels],
          datasets: [
            {
              label: 'Clientes',
              data,
              color: '#6366f1',
              segmentColors: ['#6366f1', '#10b981', '#f59e0b', '#38bdf8']
            }
          ]
        },
        data.length
      );
    });
  }

  getTransactions(filter: FilterState): Observable<ApiResponse<Transaction[]>> {
    return this.respond(`transactions|${JSON.stringify(filter)}`, () => {
      const random = this.createSeededRandom(`transactions-${filter.dateFrom}-${filter.dateTo}`);
      const { start, end, totalDays } = getRangeMetrics(filter);
      const total = Math.max(18, Math.min(180, totalDays * 4 + Math.round(random() * 18)));
      const data = Array.from({ length: total }, (_, index) =>
        this.createTransaction(index, start, end, random)
      ).sort((left, right) => right.date.localeCompare(left.date));

      return this.createResponse<Transaction[]>(data, data.length);
    });
  }

  private respond<T>(
    seedKey: string,
    factory: () => ApiResponse<T>
  ): Observable<ApiResponse<T>> {
    const latency = 600 + Math.floor(Math.random() * 801);

    if (Math.random() < 0.1) {
      return timer(latency).pipe(
        switchMap(() =>
          throwError(
            () =>
              new HttpErrorResponse({
                status: 503,
                statusText: 'Service Unavailable',
                error: {
                  message:
                    'La simulación ha provocado un error temporal para demostrar el estado de fallo.',
                  seedKey
                }
              })
          )
        )
      );
    }

    return of(factory()).pipe(delay(latency));
  }

  private toHttpResponse<T>() {
    return map<ApiResponse<T>, HttpEvent<unknown>>(
      (body) =>
        new HttpResponse({
          status: 200,
          body
        })
    );
  }

  private resolvePeriod(period?: string): ChartPeriod {
    if (period === '7d' || period === '30d' || period === '90d' || period === '1y') {
      return period;
    }

    return '30d';
  }

  private resolveFilter(query: DashboardQueryParams): FilterState {
    const fallback = buildFilterFromPreset('month');

    return {
      dateFrom: query.dateFrom ?? fallback.dateFrom,
      dateTo: query.dateTo ?? fallback.dateTo,
      preset: query.preset ?? fallback.preset
    };
  }

  private paramsToQuery(params: HttpParams): DashboardQueryParams {
    return {
      dateFrom: params.get('dateFrom') ?? undefined,
      dateTo: params.get('dateTo') ?? undefined,
      period: (params.get('period') as ChartPeriod | null) ?? undefined,
      preset: (params.get('preset') as FilterState['preset'] | null) ?? undefined
    };
  }

  private createTimeline(period: ChartPeriod, referenceDate: string): Array<{ label: string }> {
    const endDate = parseInputDate(referenceDate);

    switch (period) {
      case '7d':
        return Array.from({ length: 7 }, (_, index) => {
          const point = new Date(endDate);
          point.setDate(endDate.getDate() - (6 - index));
          return {
            label: point.toLocaleDateString('es-ES', { weekday: 'short' })
          };
        });
      case '30d':
        return Array.from({ length: 10 }, (_, index) => {
          const point = new Date(endDate);
          point.setDate(endDate.getDate() - (9 - index) * 3);
          return {
            label: point.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
          };
        });
      case '90d':
        return Array.from({ length: 12 }, (_, index) => {
          const point = new Date(endDate);
          point.setDate(endDate.getDate() - (11 - index) * 7);
          return {
            label: `S${index + 1}`
          };
        });
      case '1y':
        return Array.from({ length: 12 }, (_, index) => {
          const point = new Date(endDate);
          point.setMonth(endDate.getMonth() - (11 - index), 1);
          return {
            label: point.toLocaleDateString('es-ES', { month: 'short' })
          };
        });
    }
  }

  private createTransaction(
    index: number,
    start: Date,
    end: Date,
    random: () => number
  ): Transaction {
    const date = new Date(start);
    const spread = end.getTime() - start.getTime();
    const offset = Math.floor(random() * Math.max(spread, 1));
    date.setTime(start.getTime() + offset);

    const status = this.pickStatus(random());

    return {
      id: `TX-${date.getFullYear()}-${`${10_000 + index}`.slice(-5)}`,
      client: this.customerNames[Math.floor(random() * this.customerNames.length)],
      product: this.productCatalog[Math.floor(random() * this.productCatalog.length)],
      amount: Math.round((850 + random() * 18_400) * (status === 'cancelled' ? 0.65 : 1)),
      status,
      date: date.toISOString()
    };
  }

  private pickStatus(seed: number): TransactionStatus {
    if (seed < 0.68) {
      return 'completed';
    }

    if (seed < 0.88) {
      return 'pending';
    }

    return 'cancelled';
  }

  private metric(
    id: string,
    label: string,
    value: number,
    previousValue: number,
    unit: KpiMetric['unit']
  ): KpiMetric {
    return {
      id,
      label,
      value,
      previousValue,
      unit,
      trend: this.resolveTrend(value, previousValue),
      icon: id
    };
  }

  private resolveTrend(value: number, previousValue: number): KpiMetric['trend'] {
    const delta = value - previousValue;
    const ratio = previousValue === 0 ? delta : delta / previousValue;

    if (Math.abs(ratio) < 0.01) {
      return 'neutral';
    }

    return ratio > 0 ? 'up' : 'down';
  }

  private createResponse<T>(data: T, total: number): ApiResponse<T> {
    return {
      data,
      meta: {
        total,
        page: 1,
        pageSize: total
      },
      timestamp: new Date().toISOString()
    };
  }

  private periodScale(period: ChartPeriod): number {
    switch (period) {
      case '7d':
        return 0.45;
      case '30d':
        return 1;
      case '90d':
        return 1.35;
      case '1y':
        return 2.2;
    }
  }

  private createSeededRandom(seedInput: string): () => number {
    let seed = this.hashSeed(seedInput);

    return () => {
      seed += 0x6d2b79f5;
      let transformed = Math.imul(seed ^ (seed >>> 15), seed | 1);
      transformed ^= transformed + Math.imul(transformed ^ (transformed >>> 7), transformed | 61);
      return ((transformed ^ (transformed >>> 14)) >>> 0) / 4_294_967_296;
    };
  }

  private hashSeed(value: string): number {
    let hash = 0;

    for (let index = 0; index < value.length; index += 1) {
      hash = (hash << 5) - hash + value.charCodeAt(index);
      hash |= 0;
    }

    return hash;
  }
}
