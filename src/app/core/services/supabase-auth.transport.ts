import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {Observable, catchError, map, of, switchMap, throwError} from 'rxjs';
import type {AuthResponse} from '../models/auth.model';

export interface SupabasePublicConfig {readonly url:string;readonly publishableKey:string;}
export class EmailConfirmationRequired extends Error {
 constructor(){super('Revisa tu correo para confirmar la cuenta y después inicia sesión. Si ya tenías una cuenta, usa tu contraseña actual.');}
}
interface AuthToken {access_token?:string;id?:string;email?:string;user?:{id?:string;email?:string};}
const uuid=(v:unknown):v is string=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
export function jwtClaims(token:string):Record<string,unknown> {
 const parts=token.split('.');if(parts.length!==3)throw new Error('La sesión recibida no es válida.');
 const part=parts[1].replace(/-/g,'+').replace(/_/g,'/');return JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(part.padEnd(Math.ceil(part.length/4)*4,'=')),c=>c.charCodeAt(0))));
}
export function validSupabaseIdentity(response:AuthResponse,claims:Record<string,unknown>,config:SupabasePublicConfig):boolean {
 return uuid(response.authUserId)&&claims['sub']===response.authUserId&&claims['email']===response.correo&&claims['iss']===config.url.replace(/\/$/,'')+'/auth/v1'&&claims['role']==='authenticated'&&(claims['aud']==='authenticated'||Array.isArray(claims['aud'])&&claims['aud'].includes('authenticated'));
}
export function supabaseAuth(http:HttpClient,config:SupabasePublicConfig,path:string,input:Record<string,unknown>,redirectTo?:string):Observable<AuthResponse> {
 const base=config.url.replace(/\/$/,''),headers=new HttpHeaders({apikey:config.publishableKey,'Content-Type':'application/json'}),signup=path!=='/auth/login';
 const data=signup?{nombreCompleto:input['nombreCompleto'],...(path==='/auth/register-owner'?{register_owner:true,restaurante:input['restaurante']}:{})}:undefined;
 return http.post<AuthToken>(base+'/auth/v1/'+(signup?'signup'+(redirectTo?'?redirect_to='+encodeURIComponent(redirectTo):''):'token?grant_type=password'),{email:input['correo'],password:input['password'],...(signup?{data}:{})},{headers,timeout:20000}).pipe(
  switchMap(auth=>{
   if(signup&&!auth?.access_token){const pending=auth?.user??auth;if(!uuid(pending?.id)||(pending.email!==undefined&&pending.email.trim().toLowerCase()!==String(input['correo']).trim().toLowerCase()))throw new Error('No pudimos verificar la respuesta del registro.');throw new EmailConfirmationRequired();}
   if(typeof auth.access_token!=='string'||!uuid(auth.user?.id))throw new Error('Supabase no devolvió una sesión verificable.');
   const token=auth.access_token,claims=jwtClaims(token);
   if(claims['sub']!==auth.user.id)throw new Error('La identidad recibida no coincide.');
   return http.post<{status:number;body:Record<string,unknown>}>(base+'/rest/v1/rpc/rp_api',{p_method:'GET',p_path:'/session',p_query:{},p_body:{}},{headers:headers.set('Authorization','Bearer '+token),timeout:20000}).pipe(map(result=>{
    if(result.status!==200)throw new HttpErrorResponse({status:result.status,error:result.body});
    const body=result.body,response={...body,token,mensaje:'Sesión iniciada con Supabase.'} as unknown as AuthResponse;
    if(!validSupabaseIdentity(response,claims,config))throw new Error('No se pudo verificar el perfil de la sesión.');return response;
   }));
  }),
  catchError(error=>{
   if(error instanceof EmailConfirmationRequired)return throwError(()=>error);
   if(error instanceof HttpErrorResponse){const code=error.error?.error_code||error.error?.code;
    const status=['email_exists','user_already_exists'].includes(code)?409:error.status;
    const mensaje=code==='email_not_confirmed'?'Confirma tu correo antes de iniciar sesión.':status===429?'Espera un momento antes de volver a intentarlo.':status===409?'El correo ya está registrado.':signup&&status===400?'Revisa los datos del registro.':'No se pudo completar el acceso.';
    return throwError(()=>new HttpErrorResponse({status,error:{mensaje,code},url:error.url??undefined}));
   }return throwError(()=>error);
  })
 );
}
