import {Component, DestroyRef, DOCUMENT, computed, effect, inject, input, untracked} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Router} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {CocinaStore} from './cocina-store';
import {KitchenCommand, NEXT_KITCHEN_STATUS, kitchenDestination, kitchenActionLabel} from './cocina.model';
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
  readonly label = computed(() => {const target = this.target(); return target ? kitchenActionLabel(target) : '';});
  private dialogSession='';
  readonly disabled = computed(() => !this.store.canAct(this.orderId()));

  constructor() {
    effect(()=>{const key=this.store.sessionKey();untracked(()=>{
      if(this.dialogRef && this.dialogSession!==key)this.dialogRef.close(false);
    });});
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
    this.dialogSession=this.store.sessionKey();
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
      const key=this.store.sessionKey(),sourceUrl=this.router.url;
      void this.store.applyTransition(command).then(result=>{
        if(key!==this.store.sessionKey() || this.router.url!==sourceUrl)return;
        if(!result.ok){setTimeout(()=>this.document.getElementById('kitchen-action-feedback')?.focus(),0);return;}
        const destination=kitchenDestination(result.order.status);
        void this.router.navigate([destination.path],{queryParams:{vista:destination.vista,pedidoId:result.order.id,
          origen:this.origin(),page:this.store.page(),size:this.store.size()},
          state:{cocinaOrderId:result.order.id,cocinaOrigin:this.origin(),cocinaFocus:true}});
      });
    });
  }
}
