import {Component, computed, DOCUMENT, effect, inject, input, untracked} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import {PedidoView} from './pedido-view';
import {PedidoConsultaStore} from './pedido-consulta-store';
import {AuthService} from '../../../core/services/auth.service';
import {API_SESSION} from '../../../core/auth/api-session';
import {parsePedidoId} from '../../../core/models/pedido-query.model';
import {EMPTY_ORDER, orderSnapshot, orderStatus, paymentSnapshot} from './pedido-api.adapter';
import {OrderSnapshot, OrderStatus, PaymentSnapshot, PaymentState, QueryState} from './pedido.model';

@Component({selector:'rp-pedido-selection-view',imports:[PedidoView],providers:[PedidoConsultaStore],
  templateUrl:'./pedido-selection-view.html',styleUrl:'./pedido-selection-view.css'})
export class PedidoSelectionView {
  // Compatibilidad de las entradas visuales existentes; nunca sustituyen los datos de la API.
  readonly order=input<OrderSnapshot>(EMPTY_ORDER);
  readonly status=input<OrderStatus>('Pendiente');
  readonly queryState=input<QueryState>('loading');
  readonly payment=input<PaymentState>('missing');
  readonly paymentRecord=input<PaymentSnapshot|undefined>();
  readonly mode=input<'order'|'payment'>('order');
  readonly store=inject(PedidoConsultaStore);
  private readonly auth=inject(AuthService);
  private readonly session=inject(API_SESSION);
  private readonly router=inject(Router);
  private readonly route=inject(ActivatedRoute);
  private readonly params=toSignal(this.route.queryParamMap,{initialValue:this.route.snapshot.queryParamMap});
  private readonly navigation=this.router.currentNavigation()?.extras.state??inject(DOCUMENT).defaultView?.history.state??{};
  readonly selectedId=computed(()=>{
    const params=this.params();
    if(params.has('pedidoId'))return params.getAll('pedidoId').length===1?parsePedidoId(params.get('pedidoId')):null;
    return parsePedidoId(this.navigation['pedidoId']);
  });
  readonly snapshot=computed(()=>{const p=this.store.order();return p?orderSnapshot(p):EMPTY_ORDER;});
  readonly actualStatus=computed(()=>{const p=this.store.order();return p?orderStatus(p):'Pendiente';});
  readonly actualPayment=computed<PaymentState>(()=>this.store.payment()?.estado==='PAGADO'?'paid':this.store.payment()?'pending':'missing');
  readonly paymentSnapshot=computed(()=>{const p=this.store.payment();return p?paymentSnapshot(p):undefined;});
  constructor(){effect(()=>{
    const id=this.selectedId(),mode=this.mode();this.session();
    untracked(()=>this.store.load(id,mode));
  });}
  retry():void {this.store.load(this.selectedId(),this.mode());}
  logout():void {this.auth.logout();void this.router.navigate(['/auth/login']);}
}
