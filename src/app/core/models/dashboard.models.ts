export type MetricUnit = 'currency' | 'percentage' | 'number';
export type TrendDirection = 'up' | 'down' | 'neutral';
export type ChartPeriod = '7d' | '30d' | '90d' | '1y';
export type ChartWidgetType = 'line' | 'bar' | 'doughnut';
export type TransactionStatus = 'completed' | 'pending' | 'cancelled';
export type FilterPreset = 'today' | 'week' | 'month' | 'quarter' | 'custom';
export type TransactionSortKey = keyof Transaction;
export type SortDirection = 'asc' | 'desc';

export interface KpiMetric {
  id: string;
  label: string;
  value: number;
  previousValue: number;
  unit: MetricUnit;
  trend: TrendDirection;
  icon: string;
}

export interface ChartDataset {
  period: ChartPeriod;
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color: string;
    segmentColors?: string[];
  }[];
}

export interface Transaction {
  id: string;
  client: string;
  product: string;
  amount: number;
  status: TransactionStatus;
  date: string;
}

export interface ApiResponse<T> {
  data: T;
  meta: {
    total: number;
    page: number;
    pageSize: number;
  };
  timestamp: string;
}

export interface FilterState {
  dateFrom: string;
  dateTo: string;
  preset: FilterPreset;
}

export interface DashboardQueryParams {
  dateFrom?: string;
  dateTo?: string;
  period?: ChartPeriod;
  preset?: FilterPreset;
}
