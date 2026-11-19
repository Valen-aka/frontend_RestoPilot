import {Component, computed, DestroyRef, inject, signal} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {ReactiveFormsModule, FormControl, FormGroup, Validators} from '@angular/forms';
import {RouterLink} from '@angular/router';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {WorkspaceShell} from '../../../components/workspace-shell/workspace-shell';
import {ClientePerfil, ClientePerfilService} from '../../../core/services/cliente-perfil.service';
import {AuthService} from '../../../core/services/auth.service';

@Component({
  selector:'rp-cliente-perfil',
  imports:[ReactiveFormsModule,RouterLink,MatButtonModule,MatCardModule,MatFormFieldModule,MatInputModule,WorkspaceShell],
  templateUrl:'./cliente-perfil.html',styleUrl:'./cliente-perfil.css'
})
export class ClientePerfilPage {
  private readonly service=inject(ClientePerfilService);
  private readonly auth=inject(AuthService);
  private readonly destroyRef=inject(DestroyRef);
  readonly profile=signal<ClientePerfil|null>(null);
  readonly editing=signal(false);
  readonly displayName=computed(()=>this.profile()?.nombreCompleto||this.auth.session()?.nombreCompleto||'Mi cuenta');
  readonly initials=computed(()=>this.displayName().trim().split(/\s+/).slice(0,2).map(part=>part[0]?.toLocaleUpperCase('es')||'').join(''));
  readonly state=signal<'loading'|'ready'|'error'>('loading');
  readonly saving=signal(false);
  readonly message=signal('');
  readonly error=signal('');
  readonly form=new FormGroup({nombreCompleto:new FormControl('',{nonNullable:true,validators:[Validators.required,Validators.maxLength(150)]})});

  constructor(){this.load();}
  openEdit():void {this.editing.set(true);}
  cancelEdit():void {this.editing.set(false);if(this.profile())this.form.controls.nombreCompleto.setValue(this.profile()!.nombreCompleto);this.error.set('');}
  load():void {
    if(this.saving())return;
    this.state.set('loading');this.error.set('');this.message.set('');
    this.service.consultar().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next:profile=>{this.profile.set(profile);this.form.controls.nombreCompleto.setValue(profile.nombreCompleto);this.state.set('ready');},
      error:cause=>{this.error.set(this.problem(cause));this.state.set('error');}
    });
  }
  save():void {
    if(this.saving()||this.state()!=='ready')return;
    this.form.markAllAsTouched();this.message.set('');this.error.set('');
    const nombre=this.form.controls.nombreCompleto.value.trim();
    if(this.form.invalid||!nombre){this.error.set('Indica un nombre completo de hasta 150 caracteres.');return;}
    if(nombre===this.profile()?.nombreCompleto){this.message.set('No hay cambios por guardar.');return;}
    this.saving.set(true);
    this.service.actualizar(nombre).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next:profile=>{this.profile.set(profile);this.form.controls.nombreCompleto.setValue(profile.nombreCompleto);this.saving.set(false);this.editing.set(false);this.message.set('Perfil actualizado correctamente.');},
      error:cause=>{this.saving.set(false);this.error.set(this.problem(cause));}
    });
  }
  private problem(cause:unknown):string {
    if(cause instanceof HttpErrorResponse){
      if(cause.status===401)return 'Tu sesión terminó. Inicia sesión nuevamente.';
      if(cause.status===403)return 'No tienes permiso para editar este perfil.';
      if(cause.status===404)return 'El perfil no está disponible.';
      if(cause.status===0)return 'No pudimos conectar con el backend. Comprueba que está iniciado y vuelve a intentar.';
      if(cause.status===400)return 'Revisa el nombre completo antes de guardar.';
      return 'No pudimos completar la consulta. Intenta nuevamente.';
    }
    return cause instanceof Error?cause.message:'No pudimos consultar tu perfil.';
  }
}
