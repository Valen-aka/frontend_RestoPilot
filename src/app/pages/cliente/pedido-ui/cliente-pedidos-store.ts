import {DestroyRef, Injectable, computed, effect, inject, signal, untracked} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {Subscription} from 'rxjs';
import {API_SESSION, activeClientSession} from '../../../core/auth/api-session';
import {PedidoService} from '../../../core/services/pedido.service';
import {PedidoResponse} from '../../../core/models/pedido-api.model';
import {orderSnapshot, orderStatus} from './pedido-api.adapter';
import {QueryState} from './pedido.model';

/** Listado de soporte para seleccionar pedidos propios. No completa el historial de reservas US07. */
@Injectable({providedIn:'root'})
export class ClientePedidosStore {
  private readonly session=inject(API_SESSION);
  private readonly pedidos=inject(PedidoService);
  private readonly records=signal<readonly PedidoResponse[]>([]);
  private readonly state=signal<QueryState>('loading');
  private readonly owner=signal('');
  private readonly count=signal(0);
  private version=0;
  private previousSession='';
  private request?:Subscription;
  readonly error=signal('');
  readonly pageIndex=signal(0);
  readonly pageSize=signal(5);
  readonly hasSession=computed(()=>activeClientSession(this.session()));
  private readonly key=computed(()=>{const s=this.session();return activeClientSession(s)?s.subject+':'+s.accessToken:'';});
  readonly history=computed(()=>this.key()&&this.key()===this.owner()?this.records().map(p=>({order:orderSnapshot(p),status:orderStatus(p)})):[]);
  readonly total=computed(()=>this.key()&&this.key()===this.owner()?this.count():0);
  readonly queryState=computed<QueryState>(()=>!this.hasSession()?'unauthenticated':this.key()!==this.owner()?'loading':this.state());

  constructor(){
    effect(()=>{
      const key=this.key(),index=this.pageIndex(),size=this.pageSize();
      untracked(()=>{
        if(this.previousSession!==key){this.previousSession=key;this.pageIndex.set(0);this.load(0,size);}
        else this.load(index,size);
      });
    });
    inject(DestroyRef).onDestroy(()=>{this.version++;this.request?.unsubscribe();});
  }
  reload():void {this.load(this.pageIndex(),this.pageSize());}
  private load(page:number,size:number):void {
    const version=++this.version;this.request?.unsubscribe();this.records.set([]);this.count.set(0);this.error.set('');
    const session=this.session(),key=this.key();this.owner.set(key);
    if(!activeClientSession(session)){this.state.set('unauthenticated');return;}
    this.state.set('loading');
    this.request=this.pedidos.propios(page,size).subscribe({next:result=>{
      if(version!==this.version||key!==this.key())return;
      if(result.pedidos.some(p=>String(p.clienteId)!==session.subject)){
        this.state.set('error');this.error.set('No pudimos verificar los pedidos de tu cuenta.');return;
      }
      this.records.set(result.pedidos);this.count.set(result.totalElementos);this.state.set('ready');
    },error:cause=>{
      if(version!==this.version||key!==this.key())return;
      this.records.set([]);this.count.set(0);
      const status=cause instanceof HttpErrorResponse?cause.status:0;
      this.state.set(status===401?'unauthenticated':status===403?'forbidden':'error');
      this.error.set('No pudimos consultar tus pedidos. Intenta nuevamente.');
    }});
  }
}
