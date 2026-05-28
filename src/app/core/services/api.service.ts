import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { retry, timeout } from 'rxjs/operators';

type QueryValue = string | number | boolean | null | undefined;

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api';

  get<T>(endpoint: string, params?: Record<string, QueryValue>): Observable<T> {
    return this.http
      .get<T>(this.normalizeEndpoint(endpoint), {
        params: this.buildParams(params)
      })
      .pipe(
        timeout(10_000),
        retry({
          count: 2,
          delay: (_, retryIndex) => timer(retryIndex * 400)
        })
      );
  }

  private normalizeEndpoint(endpoint: string): string {
    const cleaned = endpoint.replace(/^\/+/, '');
    return `${this.baseUrl}/${cleaned}`;
  }

  private buildParams(params?: Record<string, QueryValue>): HttpParams {
    let httpParams = new HttpParams();

    Object.entries(params ?? {}).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });

    return httpParams;
  }
}
