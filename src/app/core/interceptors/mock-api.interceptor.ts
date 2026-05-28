import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { DataMockService } from '../services/data-mock.service';

export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api/')) {
    return next(req);
  }

  return inject(DataMockService).handleRequest(req);
};
