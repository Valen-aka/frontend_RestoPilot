import {Component, computed, input} from '@angular/core';
import {OrderStatus, stageIndex} from './pedido.model';

@Component({
  selector: 'rp-pedido-progress',
  templateUrl: './pedido-progress.html',
  styleUrl: './pedido-progress.css'
})
export class PedidoProgress {
  readonly status = input.required<OrderStatus>();
  readonly activeIndex = computed(() => stageIndex(this.status()));
  readonly stages = ['Recibido', 'En preparación', 'Listo', 'Entregado'];
}
