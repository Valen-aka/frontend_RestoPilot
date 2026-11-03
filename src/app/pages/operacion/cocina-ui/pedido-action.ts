import {Component, DestroyRef, DOCUMENT, computed, inject, input} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Router} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {CocinaStore} from './cocina-store';
import {KitchenCommand, NEXT_KITCHEN_STATUS, kitchenDestination, sampleActionLabel} from './cocina.model';
import {PedidoStateDialog} from './pedido-state-dialog';

@Component({selector: 'rp-pedido-action', imports: [MatButtonModule],
  templateUrl: './pedido-action.html', styleUrl: './pedido-action.css'})
export class PedidoAction {
  readonly orderId = input.required<number>();
  readonly origin = input<'queue' | 'board'>('queue');
  readonly store = inject(CocinaStore);
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  private dialogRef?: MatDialogRef<PedidoStateDialog, boolean>;
  readonly order = computed(() => this.store.findOrder(this.orderId()));
  readonly target = computed(() => {const order = this.order(); return order ? NEXT_KITCHEN_STATUS[order.status] : undefined;});
  readonly label = computed(() => {const target = this.target(); return target ? sampleActionLabel(target) : '';});
  // Acciones de muestra bloqueadas durante la fase API de lectura (US15).
  readonly disabled = computed(() => true);

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this.dialogRef) {this.dialogRef.close(false); this.store.actionBusy.set(false);}
    });
  }

  request(event: Event): void {
    if (this.disabled()) return;
    const order = this.order(), target = this.target();
    if (!order || !target) return;
    const trigger = event.currentTarget as HTMLButtonElement;
    const command: KitchenCommand = {id: order.id, expected: order.status, target};
    this.store.actionBusy.set(true);
    this.dialogRef = this.dialog.open(PedidoStateDialog, {data: command, width: '480px',
      maxWidth: 'calc(100vw - 32px)', autoFocus: 'first-tabbable', restoreFocus: false});
    this.dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(confirmed => {
      this.dialogRef = undefined;
      if (!confirmed) {
        this.store.actionBusy.set(false);
        setTimeout(() => trigger.isConnected ? trigger.focus() : this.document.getElementById('kitchen-title')?.focus(), 0);
        return;
      }
      const result = this.store.applyTransition(command);
      this.store.actionBusy.set(false);
      if (!result.ok) {
        setTimeout(() => this.document.getElementById('kitchen-action-feedback')?.focus(), 0);
        return;
      }
      const destination = kitchenDestination(result.order.status);
      void this.router.navigate([destination.path], {queryParams: destination.vista ? {vista: destination.vista} : {},
        state: {cocinaOrderId: result.order.id, cocinaOrigin: this.origin(), cocinaFocus: true}});
    });
  }
}
