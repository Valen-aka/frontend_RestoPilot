import {DOCUMENT, Injectable, inject, signal} from '@angular/core';
import {OrderSnapshot} from './pedido.model';

/** Contexto de presentación en memoria. No identifica ni registra pedidos reales. */
@Injectable({providedIn: 'root'})
export class PedidoDemoContext {
  private readonly document = inject(DOCUMENT);
  readonly snapshot = signal<OrderSnapshot | undefined>(undefined);

  forCurrentNavigation(): OrderSnapshot | undefined {
    return this.document.defaultView?.history.state?.us11Demo === true ? this.snapshot() : undefined;
  }
}
