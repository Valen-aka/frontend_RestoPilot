import {DestroyRef, Injectable, inject, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {defer, map, Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import type {ApiSession} from '../auth/api-session';
import type {AuthResponse, LoginRequest} from '../models/auth.model';
import {positiveId} from '../models/pedido-api.model';
export interface AccountRequest {readonly nombreCompleto:string;readonly correo:string;readonly password:string;}
export interface OwnerRequest extends AccountRequest {readonly restaurante:{readonly nombre:string;readonly direccion:string;readonly telefono:string;readonly horaApertura:string;readonly horaCierre:string;readonly tieneAtencionFisica:boolean;readonly aceptaDelivery:boolean;};}
export interface AdminResponse {readonly mensaje:string;readonly id:number;readonly nombreCompleto:string;readonly correo:string;readonly rol:'ADMINISTRADOR';readonly restauranteId:number;}
@Injectable({providedIn:'root'})
export class AuthService {
 private readonly http=inject(HttpClient);private readonly current=signal<ApiSession|null>(null);private expiryTimer?:ReturnType<typeof setTimeout>;private generation=0;
 readonly session=this.current.asReadonly();readonly endedBy=signal<'manual'|'expired'|'unauthorized'|null>(null);private readonly url=environment.apiUrl.replace(/\/$/,'');
 constructor(){inject(DestroyRef).onDestroy(()=>clearTimeout(this.expiryTimer));}
 login(request:LoginRequest):Observable<AuthResponse> {return this.authenticate('/auth/login',{correo:request.correo.trim().toLowerCase(),password:request.password},200);}
 register(request:AccountRequest):Observable<AuthResponse> {return this.authenticate('/auth/register',this.accountPayload(request),201,'CLIENTE');}
 registerOwner(request:OwnerRequest):Observable<AuthResponse> {
  const r=request.restaurante;
  return this.authenticate('/auth/register-owner',{...this.accountPayload(request),restaurante:{nombre:r.nombre,direccion:r.direccion,telefono:r.telefono,horaApertura:r.horaApertura,horaCierre:r.horaCierre,tieneAtencionFisica:r.tieneAtencionFisica,aceptaDelivery:r.aceptaDelivery}},201,'DUENO');
 }
 private accountPayload(request:AccountRequest):AccountRequest {return {nombreCompleto:request.nombreCompleto.trim(),correo:request.correo.trim().toLowerCase(),password:request.password};}
 createAdmin(request:AccountRequest):Observable<AdminResponse> {
  return defer(()=>{const session=this.session();if(!session||session.role!=='DUENO'||!positiveId(session.restauranteId)||session.expiresAt<=Date.now())throw new Error('Necesitas una sesión de dueño vigente.');return this.http.post<unknown>(this.url+'/usuarios/administradores',this.accountPayload(request),{observe:'response',timeout:20000}).pipe(map(r=>{const p=r.body as AdminResponse;if(r.status!==201||session.accessToken!==this.session()?.accessToken||!p||!positiveId(p.id)||p.rol!=='ADMINISTRADOR'||p.restauranteId!==session.restauranteId||typeof p.nombreCompleto!=='string'||typeof p.correo!=='string')throw new Error('No pudimos verificar el administrador creado.');return Object.freeze({mensaje:p.mensaje,id:p.id,nombreCompleto:p.nombreCompleto,correo:p.correo,rol:p.rol,restauranteId:p.restauranteId});}));});
 }
 private authenticate(path:string,request:LoginRequest|AccountRequest|OwnerRequest,status:number,expectedRole?:string):Observable<AuthResponse> {
  return defer(()=>{this.logout();const generation=this.generation;return this.http.post<unknown>(this.url+path,request,{observe:'response',timeout:20000}).pipe(map(r=>{
   if(generation!==this.generation)throw new Error('Este intento de acceso ya no está vigente.');const response=r.body as AuthResponse;
   if(r.status!==status||!response||!positiveId(response.id)||typeof response.nombreCompleto!=='string'||typeof response.correo!=='string'||!['CLIENTE','ADMINISTRADOR','DUENO'].includes(response.rol)||expectedRole&&response.rol!==expectedRole||typeof response.token!=='string'||response.token.split('.').length!==3)throw new Error('La respuesta de acceso no es válida.');
   let claims:Record<string,unknown>;try{const encoded=response.token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');const bytes=Uint8Array.from(atob(encoded.padEnd(Math.ceil(encoded.length/4)*4,'=')),c=>c.charCodeAt(0));claims=JSON.parse(new TextDecoder().decode(bytes));}catch{throw new Error('No pudimos interpretar la sesión recibida.');}
   const expiresAt=typeof claims['exp']==='number'?claims['exp']*1000:0,restaurant=response.restauranteId??null;
   if(!Number.isFinite(expiresAt)||expiresAt<=Date.now()||claims['userId']!==response.id||claims['sub']!==response.correo||claims['rol']!==response.rol||(restaurant!==null&&!positiveId(restaurant))||restaurant!==(claims['restauranteId']??null)||expectedRole==='CLIENTE'&&restaurant!==null||expectedRole==='DUENO'&&!positiveId(restaurant))throw new Error('La sesión recibida no es válida o ya expiró.');
   this.endedBy.set(null);this.current.set(Object.freeze({subject:String(response.id),role:response.rol,accessToken:response.token,expiresAt,restauranteId:restaurant}));this.scheduleExpiry(expiresAt);return response;
  }));});
 }
 logout(reason:'manual'|'expired'|'unauthorized'='manual'):void {this.generation++;clearTimeout(this.expiryTimer);this.endedBy.set(reason);this.current.set(null);}
 private scheduleExpiry(expiresAt:number):void {clearTimeout(this.expiryTimer);const remaining=expiresAt-Date.now();if(remaining<=0){this.logout('expired');return;}this.expiryTimer=setTimeout(()=>this.scheduleExpiry(expiresAt),Math.min(remaining,2147483647));}
}
