import {Injectable, computed, signal} from '@angular/core';

export interface PreviewItem {key: 'lomo' | 'aji'; name: string; quantity: number; price: number}
export interface PreviewPayment {estado: 'PENDIENTE' | 'PAGADO'; monto: number; metodo: string | null; referencia: string; fecha: string | null}
const initialItems = (): PreviewItem[] => [{key: 'lomo', name: 'Lomo saltado', quantity: 1, price: 38}, {key: 'aji', name: 'Ají de gallina', quantity: 1, price: 28}];

/** A single in-memory design sample for US18/US24. Never represents a server order. */
@Injectable({providedIn: 'root'})
export class OperationalPreviewStore {
  readonly items = signal(initialItems());
  readonly estado = signal('PENDIENTE');
  readonly modalidad = signal('RECOGER');
  readonly mesa = signal('Mesa 04');
  readonly direccion = signal('');
  readonly total = computed(() => this.items().reduce((sum, item) => sum + item.price * item.quantity, 0));
  readonly payment = signal<PreviewPayment>({estado: 'PENDIENTE', monto: 66, metodo: null, referencia: '', fecha: null});
  readonly blocked = computed(() => this.estado() !== 'PENDIENTE' || this.payment().estado === 'PAGADO');
  pay(metodo: string, referencia: string, estado: 'PENDIENTE' | 'PAGADO'): boolean {
    if (this.estado() === 'CANCELADO' || this.payment().estado === 'PAGADO') return false;
    this.payment.set({estado, monto: this.total(), metodo, referencia, fecha: estado === 'PAGADO' ? new Date().toLocaleString('es-PE') : null});
    return true;
  }
  adjust(items: PreviewItem[], modalidad: string, mesa: string, direccion: string): boolean {
    if (this.blocked()) return false;
    this.items.set(items.map(item => ({...item}))); this.modalidad.set(modalidad); this.mesa.set(mesa); this.direccion.set(direccion);
    this.payment.update(payment => ({...payment, monto: this.total()})); return true;
  }
  cancel(): boolean {if (this.blocked()) return false; this.estado.set('CANCELADO'); return true;}
  reset(): void {
    this.items.set(initialItems()); this.estado.set('PENDIENTE'); this.modalidad.set('RECOGER'); this.mesa.set('Mesa 04'); this.direccion.set('');
    this.payment.set({estado: 'PENDIENTE', monto: 66, metodo: null, referencia: '', fecha: null});
  }
}
