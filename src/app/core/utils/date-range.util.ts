import { FilterPreset, FilterState } from '../models/dashboard.models';

const ES_DATE_FORMATTER = new Intl.DateTimeFormat('es-ES', {
  day: '2-digit',
  month: 'short',
  year: 'numeric'
});

export function formatInputDate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function parseInputDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

export function buildFilterFromPreset(
  preset: Exclude<FilterPreset, 'custom'>,
  reference = new Date()
): FilterState {
  const today = new Date(reference);
  today.setHours(0, 0, 0, 0);

  const rangeStart = new Date(today);
  const rangeEnd = new Date(today);

  switch (preset) {
    case 'today':
      break;
    case 'week': {
      const day = today.getDay() || 7;
      rangeStart.setDate(today.getDate() - day + 1);
      break;
    }
    case 'month':
      rangeStart.setDate(1);
      break;
    case 'quarter': {
      const quarterStartMonth = Math.floor(today.getMonth() / 3) * 3;
      rangeStart.setMonth(quarterStartMonth, 1);
      break;
    }
  }

  return {
    dateFrom: formatInputDate(rangeStart),
    dateTo: formatInputDate(rangeEnd),
    preset
  };
}

export function presetLabel(preset: FilterPreset): string {
  switch (preset) {
    case 'today':
      return 'Hoy';
    case 'week':
      return 'Esta semana';
    case 'month':
      return 'Este mes';
    case 'quarter':
      return 'Este trimestre';
    case 'custom':
      return 'Rango personalizado';
  }
}

export function describeFilterRange(filter: FilterState): string {
  const from = ES_DATE_FORMATTER.format(parseInputDate(filter.dateFrom));
  const to = ES_DATE_FORMATTER.format(parseInputDate(filter.dateTo));
  return `${presetLabel(filter.preset)} · ${from} - ${to}`;
}

export function getRangeMetrics(filter: Pick<FilterState, 'dateFrom' | 'dateTo'>): {
  start: Date;
  end: Date;
  totalDays: number;
} {
  const start = parseInputDate(filter.dateFrom);
  const end = parseInputDate(filter.dateTo);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  const totalDays = Math.max(
    1,
    Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1
  );

  return { start, end, totalDays };
}
