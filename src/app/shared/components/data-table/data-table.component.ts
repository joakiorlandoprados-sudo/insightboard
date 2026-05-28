import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import {
  SortDirection,
  Transaction,
  TransactionSortKey
} from '../../../core/models/dashboard.models';
import { CurrencyFormatPipe } from '../../pipes/currency-format.pipe';
import { exportRowsAsCsv } from '../../utils/csv-export.util';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CurrencyFormatPipe, DatePipe],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataTableComponent {
  readonly transactions = input<Transaction[]>([]);
  readonly loading = input(false);
  readonly errorMessage = input<string | null>(null);
  readonly activeFilterLabel = input('');
  readonly retry = output<void>();

  readonly searchTerm = signal('');
  readonly debouncedSearchTerm = signal('');
  readonly pageSize = signal(10);
  readonly currentPage = signal(1);
  readonly sortKey = signal<TransactionSortKey>('date');
  readonly sortDirection = signal<SortDirection>('desc');
  readonly exported = signal(false);

  readonly pageSizeOptions = [10, 25, 50];
  readonly skeletonRows = Array.from({ length: 5 });

  private readonly searchInput$ = new Subject<string>();
  private readonly destroyRef = inject(DestroyRef);

  readonly filteredTransactions = computed(() => {
    const query = this.debouncedSearchTerm().trim().toLowerCase();
    const transactions = this.transactions();

    if (!query) {
      return transactions;
    }

    return transactions.filter((transaction) =>
      [
        transaction.id,
        transaction.client,
        transaction.product,
        transaction.status,
        transaction.date,
        transaction.amount
      ]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  });

  readonly sortedTransactions = computed(() => {
    const key = this.sortKey();
    const direction = this.sortDirection();
    const modifier = direction === 'asc' ? 1 : -1;

    return [...this.filteredTransactions()].sort((left, right) => {
      const leftValue = left[key];
      const rightValue = right[key];

      if (key === 'amount') {
        return (Number(leftValue) - Number(rightValue)) * modifier;
      }

      if (key === 'date') {
        return String(leftValue).localeCompare(String(rightValue)) * modifier;
      }

      return String(leftValue).localeCompare(String(rightValue), 'es', {
        sensitivity: 'base'
      }) * modifier;
    });
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.sortedTransactions().length / this.pageSize()))
  );

  readonly paginatedTransactions = computed(() => {
    const safePage = Math.min(this.currentPage(), this.totalPages());
    const start = (safePage - 1) * this.pageSize();
    const end = start + this.pageSize();

    return this.sortedTransactions().slice(start, end);
  });

  readonly showEmptyState = computed(
    () => !this.loading() && !this.errorMessage() && this.sortedTransactions().length === 0
  );

  readonly tableSummary = computed(() => {
    const total = this.sortedTransactions().length;
    const start = total === 0 ? 0 : (this.currentPage() - 1) * this.pageSize() + 1;
    const end = Math.min(this.currentPage() * this.pageSize(), total);

    return `${start}-${end} de ${total} resultados`;
  });

  constructor() {
    this.searchInput$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((value) => {
        this.debouncedSearchTerm.set(value);
        this.currentPage.set(1);
      });

    effect(() => {
      this.transactions();
      this.currentPage.set(1);
    });

    effect(() => {
      const totalPages = this.totalPages();
      if (this.currentPage() > totalPages) {
        this.currentPage.set(totalPages);
      }
    });
  }

  updateSearch(value: string): void {
    this.searchTerm.set(value);
    this.searchInput$.next(value.toLowerCase());
  }

  toggleSort(key: TransactionSortKey): void {
    if (this.sortKey() === key) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
      return;
    }

    this.sortKey.set(key);
    this.sortDirection.set(key === 'date' || key === 'amount' ? 'desc' : 'asc');
  }

  changePageSize(value: string): void {
    this.pageSize.set(Number(value));
    this.currentPage.set(1);
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((page) => page - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((page) => page + 1);
    }
  }

  exportCurrentView(): void {
    const rows = this.sortedTransactions().map((transaction) => ({
      ID: transaction.id,
      Cliente: transaction.client,
      Producto: transaction.product,
      Importe: transaction.amount,
      Estado: this.statusLabel(transaction.status),
      Fecha: transaction.date
    }));

    if (exportRowsAsCsv('transacciones', rows)) {
      this.exported.set(true);
      window.setTimeout(() => this.exported.set(false), 2_000);
    }
  }

  sortLabel(key: TransactionSortKey): string {
    if (this.sortKey() !== key) {
      return '↕';
    }

    return this.sortDirection() === 'asc' ? '↑' : '↓';
  }

  statusLabel(status: Transaction['status']): string {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelado';
    }
  }
}
