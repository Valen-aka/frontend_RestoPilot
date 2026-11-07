import {DOCUMENT} from '@angular/common';
import {Injectable, inject} from '@angular/core';

/** Devuelve una ruta local sin aceptar ni persistir tokens de la URL. */
export function confirmationReturn(url:string):string|null {
  let current:URL;try{current=new URL(url);}catch{return null;}
  if(!['http:','https:'].includes(current.protocol))return null;
  const hash=new URLSearchParams(current.hash.slice(1));
  if(!['access_token','refresh_token','error','error_code'].some(key=>hash.has(key)))return null;
  const target=new URL('/auth/login',current.origin);
  if(hash.has('error')||hash.has('error_code'))target.searchParams.set('motivo','enlace-confirmacion-invalido');
  else target.searchParams.set('registro','confirmacion-recibida');
  return target.pathname+target.search;
}

export function confirmationRedirect(origin:string|undefined):string|undefined {
  if(!origin)return undefined;
  try{
    const url=new URL(origin);
    if(url.protocol!=='https:'&&!(url.protocol==='http:'&&['localhost','127.0.0.1','[::1]'].includes(url.hostname)))return undefined;
    return new URL('/auth/login',url.origin).href;
  }catch{return undefined;}
}

@Injectable({providedIn:'root'})
export class EmailConfirmationReturn {
  constructor(){
    const view=inject(DOCUMENT).defaultView;
    if(!view)return;
    const target=confirmationReturn(view.location.href);
    if(target)view.history.replaceState(null,'',target);
  }
}
