import {DestroyRef, Injectable, inject} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {filter} from 'rxjs';
import {AccountRequest} from './auth.service';
@Injectable({providedIn:'root'})
export class OwnerDraftService {
 private value:AccountRequest|null=null;private timer?:ReturnType<typeof setTimeout>;
 constructor(){const sub=inject(Router).events.pipe(filter(e=>e instanceof NavigationEnd)).subscribe(e=>{if(!/^\/auth\/(registro-dueno|restaurante)(?:[?/#]|$)/.test(e.urlAfterRedirects))this.clear();});inject(DestroyRef).onDestroy(()=>{sub.unsubscribe();this.clear();});}
 read():AccountRequest|null{return this.value;}
 save(value:AccountRequest):void {this.clear();this.value={...value};this.timer=setTimeout(()=>this.clear(),15*60000);}
 clear():void {clearTimeout(this.timer);this.value=null;}
}
