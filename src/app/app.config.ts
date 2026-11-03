import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {apiAuthInterceptor} from './core/interceptors/api-auth.interceptor';
import {ApplicationConfig,provideBrowserGlobalErrorListeners} from '@angular/core';
import {provideRouter} from '@angular/router';
import {provideNativeDateAdapter,MAT_DATE_LOCALE} from '@angular/material/core';
import {routes} from './app.routes';
export const appConfig:ApplicationConfig={providers:[provideHttpClient(withInterceptors([apiAuthInterceptor])), provideBrowserGlobalErrorListeners(),provideRouter(routes),provideNativeDateAdapter(),{provide:MAT_DATE_LOCALE,useValue:'es-PE'}]};
