import {inject} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {HttpBackend, HttpClient, HttpErrorResponse, HttpHeaders, HttpInterceptorFn, HttpRequest, HttpResponse} from '@angular/common/http';
import {map} from 'rxjs';
import {environment} from '../../../environments/environment';
import {supabaseAuth} from '../services/supabase-auth.transport';
import {confirmationRedirect} from '../services/email-confirmation-return.service';

/** Traduce el contrato interno a RPC HTTPS; nunca utiliza una API local como respaldo. */
export const supabaseTransportInterceptor:HttpInterceptorFn=(request,next)=>{
 const base=environment.apiUrl.replace(/\/$/,''),isApi=request.url===base||request.url.startsWith(base+'/')||request.url.startsWith(base+'?');
 if(environment.transport!=='supabase'||!isApi)return next(request);
 const config=environment.supabase,path=request.url.slice(base.length).split('?')[0];
 if(!config?.url||!config.publishableKey)throw new Error('Falta la configuración pública de Supabase.');
 if(['/auth/login','/auth/register','/auth/register-owner'].includes(path)){
  if(request.method!=='POST')throw new HttpErrorResponse({status:405,error:{mensaje:'Operación no admitida.'}});
  const origin=inject(DOCUMENT,{optional:true})?.defaultView?.location.origin;
  return supabaseAuth(new HttpClient(inject(HttpBackend)),config,path,request.body as Record<string,unknown>,confirmationRedirect(origin)).pipe(map(body=>new HttpResponse({status:path==='/auth/login'?200:201,body,url:request.url})));
 }
 const query:Record<string,string>={};const url=new URL(request.urlWithParams,'https://restopilot.invalid');url.searchParams.forEach((value,key)=>query[key]=value);
 const token=request.headers.get('Authorization');if(!token)throw new HttpErrorResponse({status:401,error:{mensaje:'Inicia sesión para continuar.'}});
 const rpc=new HttpRequest('POST',config.url.replace(/\/$/,'')+'/rest/v1/rpc/rp_api',{p_method:request.method,p_path:path,p_query:query,p_body:request.body??{}},{headers:new HttpHeaders({apikey:config.publishableKey,Authorization:token,'Content-Type':'application/json'}),responseType:'json',timeout:20000});
 return next(rpc).pipe(map(event=>{
  if(!(event instanceof HttpResponse))return event;
  const result=event.body as {status?:unknown;body?:unknown};if(!result||!Number.isInteger(result.status)||Number(result.status)<200||Number(result.status)>599)throw new HttpErrorResponse({status:502,error:{mensaje:'La respuesta de Supabase no es válida.'},url:request.url});
  if(Number(result.status)>=400)throw new HttpErrorResponse({status:Number(result.status),error:result.body,url:request.url});
  return new HttpResponse({status:Number(result.status),body:result.body??null,url:request.url});
 }));
};
