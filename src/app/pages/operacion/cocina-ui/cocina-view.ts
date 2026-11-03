import {Component, DOCUMENT, afterNextRender, computed, effect, inject, input, untracked} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {MatPaginatorIntl, MatPaginatorModule, PageEvent} from '@angular/material/paginator';
import {parsePedidoId} from '../../../core/models/pedido-query.model';
import {CurrencyPipe} from '@angular/common';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatTableModule} from '@angular/material/table';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {cocinaPaginator} from './cocina-paginator';
import {CocinaShell} from './cocina-shell';
import {CocinaCard} from './cocina-card';
import {CocinaStore} from './cocina-store';
import {KitchenOrder, MODALITY_LABELS, isActive, kitchenDestination, orderUnits, sampleDate, sampleTime, serviceLabel} from './cocina.model';

@Component({selector: 'rp-cocina-view',
  providers:[{provide:MatPaginatorIntl,useFactory:cocinaPaginator}],
  imports: [CurrencyPipe, RouterLink, MatButtonModule, MatCardModule, MatTableModule, MatProgressSpinnerModule, CocinaShell, CocinaCard, MatPaginatorModule],
  templateUrl: './cocina-view.html', styleUrl: './cocina-view.css'})
export class CocinaView {
  readonly mode = input<'queue' | 'board' | 'detail' | 'preparation' | 'delivery' | 'delivered'>('queue');
  readonly store = inject(CocinaStore);
  private readonly document = inject(DOCUMENT);
  readonly router=inject(Router);
  private readonly route=inject(ActivatedRoute);
  private readonly params=toSignal(this.route.queryParamMap,{initialValue:this.route.snapshot.queryParamMap});
  private readonly navigation = this.document.defaultView?.history.state;
  readonly selectedId = computed(()=>this.params().has('pedidoId') ? parsePedidoId(this.params().get('pedidoId'))??undefined :
    parsePedidoId(this.navigation?.cocinaOrderId)??undefined);
  readonly origin = this.navigation?.cocinaOrigin === 'board' || this.route.snapshot.queryParamMap.get('origen')==='board' ? 'board' : 'queue';
  readonly returnPath = this.origin === 'board' ? '/operacion/cocina' : '/operacion/pedidos';
  readonly isDetail = computed(() => this.mode() !== 'queue' && this.mode() !== 'board');
  readonly selected = computed(() => this.store.queryState() === 'loading' || this.store.queryState() === 'error' ?
    undefined : this.store.findOrder(this.selectedId()));
  readonly retained = computed(() => {
    if (this.store.queryState() === 'loading' || this.store.queryState() === 'error') return undefined;
    const order = this.store.findOrder(this.store.lastSelectedId());
    return order && !isActive(order) ? order : undefined;
  });
  readonly feedback = computed(() => {
    const message = this.store.actionMessage();
    return message && (!this.isDetail() || message.id === this.selectedId()) ? message : undefined;
  });
  readonly stageMatches = computed(() => {
    const mode = this.mode(), status = this.selected()?.status;
    return mode === 'detail' || (mode === 'preparation' && status === 'En preparación') ||
      (mode === 'delivery' && status === 'Listo') || (mode === 'delivered' && status === 'Entregado');
  });
  readonly groups = computed(() => [
    {label: 'Pendientes', state: 'Pendiente', orders: this.store.displayed().filter(order => order.status === 'Pendiente')},
    {label: 'En preparación', state: 'En preparación', orders: this.store.displayed().filter(order => order.status === 'En preparación')}
  ]);
  readonly title = computed(() => {
    if (this.mode() === 'queue') return 'El servicio en movimiento';
    if (this.mode() === 'board') return 'El ritmo de la cocina';
    const order = this.selected();
    if (!order || !this.stageMatches()) return 'Consulta del pedido';
    if (this.mode() === 'preparation') return `Preparación del pedido #${order.id}`;
    if (this.mode() === 'delivery') return 'Pedido listo para entregar';
    if (this.mode() === 'delivered') return 'Entrega del pedido';
    return `Pedido #${order.id}`;
  });
  readonly subtitle = computed(() => this.mode() === 'queue' ? 'La cola de trabajo del restaurante.' :
    this.mode() === 'board' ? 'Menos ruido. Más coordinación.' : 'La información de la comanda, en un solo lugar.');
  readonly columns = ['id', 'customer', 'modality', 'status', 'total', 'action'];
  readonly detailColumns = ['name', 'quantity', 'unitPrice', 'subtotal'];
  readonly serviceLabel = serviceLabel;
  readonly time = sampleTime;
  readonly date = sampleDate;
  readonly units = orderUnits;
  readonly labels = MODALITY_LABELS;
  readonly trackOrder = (_index: number, order: KitchenOrder) => order.id;
  readonly destination = (order: KitchenOrder) => kitchenDestination(order.status);

  changePage(event:PageEvent):void {
    void this.router.navigate([], {relativeTo:this.route,queryParams:{page:event.pageIndex,size:event.pageSize},queryParamsHandling:'merge'});
  }
  constructor() {
    effect(()=>{
      const mode=this.mode(),id=this.selectedId(),params=this.params(),session=this.store.sessionKey();
      untracked(()=>{
        if(mode==='queue'||mode==='board'){
          const raw=params.get('page');
          const page=raw!==null&&/^\d+$/.test(raw)&&Number.isSafeInteger(Number(raw))?Number(raw):this.store.page();
          const rawSize=Number(params.get('size'));
          this.store.loadQueue(page,[10,20,50].includes(rawSize)?rawSize:this.store.size());
        } else this.store.loadDetail(id);
      });
    });
    afterNextRender(() => {
      if (this.isDetail() && this.selected()) this.store.lastSelectedId.set(this.selected()!.id);
      if (this.navigation?.cocinaFocus === true) {
        this.document.getElementById('kitchen-title')?.focus();
      } else if (!this.isDetail()) {
        const id = this.navigation?.cocinaReturnId;
        if (Number.isSafeInteger(id) && id > 0) {
          const link = this.document.querySelector<HTMLAnchorElement>(`a[aria-label="Consultar pedido #${id}"]`);
          (link ?? this.document.getElementById('kitchen-title'))?.focus();
        }
      }
    });
  }
}
