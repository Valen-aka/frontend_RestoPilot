import {Component, DestroyRef, Input, inject, signal, computed} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {takeUntilDestroyed, toObservable} from '@angular/core/rxjs-interop';
import {catchError, map, of, startWith, switchMap} from 'rxjs';
import {MatButtonModule} from '@angular/material/button';
import {RouterLink} from '@angular/router';
import {WorkspaceShell} from '../../components/workspace-shell/workspace-shell';
import {AuthService} from '../../core/services/auth.service';
import {environment} from '../../../environments/environment';

interface Notificacion {id: number; mensaje: string; fechaCreacion: string}
type Estado = {tipo: 'sin-sesion' | 'cargando' | 'error'; items: Notificacion[]} | {tipo: 'listo'; items: Notificacion[]};

@Component({selector: 'rp-notificaciones-view', imports: [WorkspaceShell, RouterLink, MatButtonModule], templateUrl: './notificaciones-view.html', styleUrl: './notificaciones-view.css'})
export class NotificacionesView {
  @Input() role: 'client' | 'operation' = 'client';
  private readonly auth = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly destroy = inject(DestroyRef);
  private readonly revision = signal(0);
  readonly pagina = signal(0);
  readonly paginas = signal(0);
  private readonly consulta = computed(() => ({revision: this.revision(), pagina: this.pagina()}));
  private readonly revision$ = toObservable(this.consulta);
  readonly estado = signal<Estado>({tipo: 'cargando', items: []});

  constructor() {
    toObservable(this.auth.session).pipe(switchMap(session => {
      this.pagina.set(0);
      this.paginas.set(0);
      if (!session) return of<Estado>({tipo: 'sin-sesion', items: []});
      return this.revision$.pipe(switchMap(query => this.http.get<unknown>(environment.apiUrl.replace(/\/$/, '') + '/notificaciones/me', {timeout: 20000, params: {page: query.pagina, size: 20}}).pipe(
        map(value => {
          const content = (value as {content?: unknown})?.content;
          if (!Array.isArray(content) || !content.every(item => item && Number.isSafeInteger(item.id) && item.id > 0 && typeof item.mensaje === 'string' && typeof item.fechaCreacion === 'string')) throw new Error('Respuesta inválida');
          const total = (value as {totalPages?: unknown}).totalPages;
          if (!Number.isSafeInteger(total) || (total as number) < 0) throw new Error('Paginación inválida');
          this.paginas.set(total as number);
          return {tipo: 'listo', items: content as Notificacion[]} as Estado;
        }),
        startWith({tipo: 'cargando', items: []} as Estado),
        catchError(() => of<Estado>({tipo: 'error', items: []}))
      )));
    }), takeUntilDestroyed(this.destroy)).subscribe(value => this.estado.set(value));
  }

  reintentar(): void { this.revision.update(value => value + 1); }
  mover(delta: number): void {
    const siguiente = this.pagina() + delta;
    if (this.estado().tipo === 'listo' && siguiente >= 0 && siguiente < this.paginas()) this.pagina.set(siguiente);
  }
}
