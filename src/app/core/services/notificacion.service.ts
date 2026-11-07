import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {NotificacionesPage, readNotificacionesResponse} from '../models/notificacion-api.model';

@Injectable({providedIn:'root'})
export class NotificacionService {
  private readonly http=inject(HttpClient);
  consultar(subject:string,page:number,size:number):Observable<NotificacionesPage> {
    const params=new HttpParams().set('page',page).set('size',size).set('sort','id,desc');
    return this.http.get<unknown>(environment.apiUrl.replace(/\/$/,'')+'/notificaciones/me',{params,timeout:20000})
      .pipe(map(value=>readNotificacionesResponse(value,subject,page,size,environment.transport==='supabase')));
  }
}
