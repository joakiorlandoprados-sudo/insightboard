import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyFormat',
  standalone: true
})
export class CurrencyFormatPipe implements PipeTransform {
  transform(value: number | null | undefined, compact = false): string {
    const safeValue = Number.isFinite(value) ? Number(value) : 0;

    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      notation: compact ? 'compact' : 'standard',
      minimumFractionDigits: compact ? 1 : 0,
      maximumFractionDigits: compact ? 1 : 0
    }).format(safeValue);
  }
}
