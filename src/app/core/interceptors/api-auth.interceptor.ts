import {HttpInterceptorFn} from '@angular/common/http';
import {catchError, throwError} from 'rxjs';
import {AuthService} from '../services/auth.service';
import {HttpErrorResponse} from '@angular/common/http';
import {inject} from '@angular/core';
import {environment} from '../../../environments/environment';
import {API_SESSION} from '../auth/api-session';

export const apiAuthInterceptor: HttpInterceptorFn = (request, next) => {
  const session = inject(API_SESSION)();
  const base = environment.apiUrl.replace(/\/$/, '');
  const isApi = request.url === base || request.url.startsWith(base + '/') || request.url.startsWith(base + '?');
  const auth = inject(AuthService);
  if (request.url.startsWith(base + '/auth/')) return next(request);
  if (!isApi || !session?.accessToken.trim() || session.expiresAt <= Date.now()) return next(request);
  return next(request.clone({setHeaders: {Authorization: 'Bearer ' + session.accessToken}})).pipe(
    catchError(error => {
      if (error instanceof HttpErrorResponse && error.status === 401 && auth.session()?.accessToken === session.accessToken) auth.logout('unauthorized');
      return throwError(() => error);
    }));
};
