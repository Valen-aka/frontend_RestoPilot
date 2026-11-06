import {PreviewOperation} from '../../../components/preview-operation/preview-operation';
import {PreviewPanel} from '../../../components/preview-operation/preview-panel';
import {OperationalPreviewStore} from '../operational-preview/operational-preview-store';
import {Component, inject, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatDialog} from '@angular/material/dialog';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {DestroyRef} from '@angular/core';
import {WorkspaceShell} from '../../../components/workspace-shell/workspace-shell';
import {OpPedidoCancelarDialog} from '../../../dialogs/op-pedido-cancelar/op-pedido-cancelar-dialog';

@Component({selector:'rp-op-pedido-cancelar',imports:[PreviewPanel,WorkspaceShell,RouterLink,MatButtonModule],templateUrl:'./op-pedido-cancelar.html',styleUrls:['../../../components/workspace-shell/workspace-pages.css','./op-pedido-cancelar.css']})
export class OpPedidoCancelarPage {
 readonly notice=signal('');
 readonly store=inject(OperationalPreviewStore);
 readonly preview=new PreviewOperation();
 private readonly dialog=inject(MatDialog);
 private readonly destroyRef=inject(DestroyRef);
 openConfirmation(){
  if(this.store.blocked()||this.preview.busy())return;
  this.dialog.open(OpPedidoCancelarDialog,{width:'480px',maxWidth:'calc(100vw - 32px)',autoFocus:'first-tabbable',restoreFocus:true,ariaLabelledBy:'cancel-order-title',ariaDescribedBy:'cancel-order-description'})
   .afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(confirmed=>{
    if(confirmed===true)this.preview.run(result=>{if(result==='success'&&!this.store.cancel())this.preview.phase.set('forbidden');});
   });
 }
}
