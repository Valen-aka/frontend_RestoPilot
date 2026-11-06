import {Component, DestroyRef, DOCUMENT, effect, inject, input, untracked} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {WorkspaceShell} from '../../../components/workspace-shell/workspace-shell';
import {AtencionFisicaStore} from './atencion-fisica-store';
import {OpReservasModuloConfirmarDialog} from '../../../dialogs/op-reservas-modulo-confirmar/op-reservas-modulo-confirmar-dialog';
import {AuthService} from '../../../core/services/auth.service';
@Component({selector:'rp-atencion-fisica-view',imports:[RouterLink,MatButtonModule,MatCardModule,MatProgressSpinnerModule,WorkspaceShell],templateUrl:'./atencion-fisica-view.html',styleUrl:'./atencion-fisica-view.css'})
export class AtencionFisicaView {
 readonly confirm=input(false);readonly store=inject(AtencionFisicaStore);private readonly router=inject(Router);private readonly dialog=inject(MatDialog);private readonly destroyRef=inject(DestroyRef);private readonly document=inject(DOCUMENT);private readonly auth=inject(AuthService);
 private focusRestored=false;private opened=false;private dialogRef?:MatDialogRef<OpReservasModuloConfirmarDialog>;
 constructor(){effect(()=>{this.store.session();untracked(()=>{if(!this.store.hasSession())this.dialogRef?.close(false);this.store.load();});});
 effect(()=>{const confirm=this.confirm(),ready=this.store.state()==='ready',data=this.store.data();if(confirm&&ready&&this.store.hasSession()&&data?.habilitado&&!this.opened)untracked(()=>this.askPause());});
 effect(()=>{const ready=this.store.state()==='ready',confirm=this.confirm();if(ready&&!confirm&&!this.focusRestored)untracked(()=>setTimeout(()=>{if(this.destroyRef.destroyed)return;const target=this.document.getElementById('atencion-action');target?.focus({preventScroll:true});this.focusRestored=!!target;},0));});}
 askPause():void {if(!this.store.canChange()||!this.store.data()?.habilitado)return;this.opened=true;
 this.dialogRef=this.dialog.open(OpReservasModuloConfirmarDialog,{data:this.store.data(),width:'32rem',maxWidth:'calc(100vw - 2rem)',restoreFocus:false,autoFocus:'first-tabbable',ariaLabel:'Confirmar pausa de atención física'});
 this.dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(ok=>{if(!this.store.hasSession())return;if(ok===true)this.store.change(false,()=>void this.router.navigate(['/operacion/atencion']));else void this.router.navigate(['/operacion/atencion']);});}
 enable():void {this.store.change(true,()=>{if(this.confirm())void this.router.navigate(['/operacion/atencion']);});}
 pause():void {void this.router.navigate(['/operacion/atencion/confirmar']);}
 logout():void {this.auth.logout();void this.router.navigate(['/auth/login']);}
}
