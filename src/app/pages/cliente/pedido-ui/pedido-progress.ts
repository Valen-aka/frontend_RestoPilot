import {Component, computed, input} from '@angular/core';
import {OrderStatus, stageIndex} from './pedido.model';

@Component({
  selector: 'rp-pedido-progress',
  templateUrl: './pedido-progress.html',
  styleUrl: './pedido-progress.css'
})
export class PedidoProgress {
  readonly status = input.required<OrderStatus>();
  readonly stale=input(false);
  readonly activeIndex = computed(() => stageIndex(this.status()));
  readonly stages = ['Recibido', 'En preparación', 'Listo', 'Entregado'];
  readonly summary = computed(() => {
    if(this.stale())return 'Último estado confirmado: '+this.status()+'. No se ha podido verificar una actualización.';
    switch (this.status()) {
      case 'Pendiente': return 'El pedido fue recibido y está pendiente de preparación.';
      case 'En preparación': return 'El restaurante está preparando tu pedido.';
      case 'Listo': return 'Tu pedido está listo. La entrega todavía está pendiente.';
      case 'Entregado': return 'La entrega fue completada. No hay etapas posteriores.';
      case 'Cancelado': return 'Este pedido fue cancelado. Sus datos se conservan para tu consulta.';
    }
  });
}
