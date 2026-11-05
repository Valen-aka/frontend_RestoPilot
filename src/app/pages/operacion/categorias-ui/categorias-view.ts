import {Component,DestroyRef,ElementRef,computed,effect,inject,input,signal,untracked} from '@angular/core';
import {ActivatedRoute,Router,RouterLink,NavigationStart,NavigationCancel,NavigationError} from '@angular/router';
import {FormControl,FormGroup,ReactiveFormsModule,Validators} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatSnackBar,MatSnackBarModule} from '@angular/material/snack-bar';
import {MatTableModule} from '@angular/material/table';
import {MatDialog,MatDialogModule,MatDialogRef} from '@angular/material/dialog';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Subscription} from 'rxjs';
import {WorkspaceShell} from '../../../components/workspace-shell/workspace-shell';
import {API_SESSION,activeOperationSession} from '../../../core/auth/api-session';
import {AuthService} from '../../../core/services/auth.service';
import {CatalogoService} from '../../../core/services/catalogo.service';
import {RestauranteResponse} from '../../../core/models/catalogo-api.model';
import {CategoriasStore} from './categorias-store';
import {OpCategoriaEliminarDialog} from '../../../dialogs/op-categoria-eliminar/op-categoria-eliminar-dialog';

@Component({selector:'rp-categorias-view',imports:[WorkspaceShell,RouterLink,ReactiveFormsModule,MatInputModule,MatButtonModule,MatTableModule,MatSnackBarModule,MatDialogModule,OpCategoriaEliminarDialog],providers:[CategoriasStore],templateUrl:'./categorias-view.html',styleUrls:['./categorias-view.css','./categorias-material.scss']})
export class CategoriasView {
 readonly mode=input<'list'|'create'|'edit'|'delete'>('list');
 readonly store=inject(CategoriasStore);
 readonly session=inject(API_SESSION);
 readonly restaurant=signal<RestauranteResponse|null>(null);
 readonly form=new FormGroup({nombre:new FormControl('',{nonNullable:true,validators:[Validators.required,Validators.maxLength(100),c=>c.value.trim()?null:{blank:true}]}),descripcion:new FormControl('',{nonNullable:true})});
 readonly title=computed(()=>({list:'Una carta bien organizada',create:'Nueva categoría',edit:'Editar categoría',delete:'Eliminar categoría'})[this.mode()]);
 readonly subtitle=computed(()=>this.mode()==='list'?'Ordena la experiencia desde el primer vistazo.':this.mode()==='delete'?'Esta acción requiere confirmación.':'Solo se gestionan categorías de tu restaurante.');
 readonly columns=['nombre','descripcion','acciones'];
 readonly selectedId=(()=>{const raw=inject(ActivatedRoute).snapshot.queryParamMap.get('categoriaId');return raw && /^[1-9]\d*$/.test(raw) && Number.isSafeInteger(Number(raw))?Number(raw):0;})();
 private readonly router=inject(Router);
 private readonly api=inject(CatalogoService);
 private readonly auth=inject(AuthService);
 private readonly dialog=inject(MatDialog);
 private readonly snack=inject(MatSnackBar);
 private readonly destroyRef=inject(DestroyRef);
 private readonly host=inject<ElementRef<HTMLElement>>(ElementRef);
 private restaurantQuery?:Subscription;
 private modal?:MatDialogRef<OpCategoriaEliminarDialog>;
 private alive=true;
 private version=0;
 constructor(){
  effect(()=>{const session=this.session(),mode=this.mode();untracked(()=>{
   this.version++;this.modal?.close();this.form.reset();this.store.reset();this.restaurant.set(null);this.restaurantQuery?.unsubscribe();
   if(!this.alive)return;
   this.load();
   if(activeOperationSession(session)){
    const token=session.accessToken;
    this.restaurantQuery=this.api.restaurante(session.restauranteId).subscribe({next:r=>{if(this.alive&&this.session()?.accessToken===token)this.restaurant.set(r);},error:()=>{}});
   }
  });});
  effect(()=>{const category=this.store.selected();if(this.mode()==='edit'&&category)untracked(()=>this.form.reset({nombre:category.nombre,descripcion:category.descripcion??''}));});
  this.router.events.pipe(takeUntilDestroyed()).subscribe(event=>{
   if(event instanceof NavigationStart){this.alive=false;this.version++;this.modal?.close();this.store.reset();this.restaurantQuery?.unsubscribe();}
   if(event instanceof NavigationCancel||event instanceof NavigationError){this.alive=true;this.load();}
  });
  this.destroyRef.onDestroy(()=>{this.alive=false;this.version++;this.modal?.close();this.restaurantQuery?.unsubscribe();});
 }
 load():void {if(this.alive)this.store.load(this.mode()==='edit'||this.mode()==='delete'?this.selectedId:null);}
 async submit():Promise<void> {
  if(this.store.busy()||!this.alive)return;
  this.form.markAllAsTouched();
  if(this.form.invalid){this.host.nativeElement.querySelector<HTMLInputElement>('#categoria-nombre')?.focus();return;}
  const version=this.version,token=this.session()?.accessToken;
  const ok=await (this.mode()==='create'?this.store.create(this.form.getRawValue()):this.store.update(this.form.getRawValue()));
  if(ok&&this.alive&&version===this.version&&token===this.session()?.accessToken){this.snack.open(this.store.notice(),'Cerrar',{duration:5000});await this.router.navigate(['/operacion/categorias']);}
 }
 openDelete(id:number):void {
  if(this.modal||this.store.busy()||!this.alive)return;
  this.store.selectedId.set(id);
  this.modal=this.dialog.open(OpCategoriaEliminarDialog,{data:this.store,width:'480px',maxWidth:'calc(100vw - 32px)',autoFocus:'first-tabbable',restoreFocus:true,ariaLabel:'Confirmar eliminación de categoría'});
  this.modal.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(result=>{
   this.modal=undefined;
   if(!this.alive)return;
   if(this.store.busy()||this.store.uncertain()){this.store.reset();this.load();}
   else {this.store.selectedId.set(null);if(result===true)this.host.nativeElement.querySelector<HTMLElement>('#categorias-title')?.focus();}
  });
 }
 back():void {void this.router.navigate(['/operacion/categorias']);}
 logout():void {this.auth.logout();void this.router.navigate(['/auth/login']);}
}
