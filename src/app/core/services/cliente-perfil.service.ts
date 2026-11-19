import {HttpClient} from '@angular/common/http';
import {Injectable, inject} from '@angular/core';
import {defer, map, Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {API_SESSION, activeClientSession} from '../auth/api-session';
import {AuthService} from './auth.service';

export interface ClientePerfil {
  readonly id:number;
  readonly nombreCompleto:string;
  readonly correo:string;
  readonly rol:'CLIENTE';
  readonly restauranteId:null;
}

@Injectable({providedIn:'root'})
export class ClientePerfilService {
  private readonly http=inject(HttpClient);
  private readonly session=inject(API_SESSION);
  private readonly auth=inject(AuthService);
  private readonly base=environment.springApiUrl?.replace(/\/$/,'');

  consultar():Observable<ClientePerfil> {return this.request('GET');}
  actualizar(nombreCompleto:string):Observable<ClientePerfil> {return this.request('PATCH',nombreCompleto);}

  private request(method:'GET'|'PATCH',nombreCompleto?:string):Observable<ClientePerfil> {
    return defer(()=>{
      const session=this.session();
      if(!activeClientSession(session))throw new Error('Inicia sesión como cliente para consultar tu perfil.');
      if(!this.base)throw new Error('La edición del perfil necesita el backend de RestoPilot.');
      return this.http.request<unknown>(method,this.base+'/auth/me',{
        ...(method==='PATCH'?{body:{nombreCompleto}}:{}),timeout:20000
      }).pipe(map(value=>{
        if(this.session()?.accessToken!==session.accessToken)throw new Error('La sesión cambió durante la consulta.');
        const profile=value as ClientePerfil;
        if(!profile||profile.id!==Number(session.subject)||profile.rol!=='CLIENTE'||profile.restauranteId!==null||
          typeof profile.nombreCompleto!=='string'||!profile.nombreCompleto.trim()||
          typeof profile.correo!=='string'||!profile.correo.includes('@'))throw new Error('La respuesta del perfil no es válida.');
        this.auth.updateName(profile.nombreCompleto);
        return Object.freeze(profile);
      }));
    });
  }
}
