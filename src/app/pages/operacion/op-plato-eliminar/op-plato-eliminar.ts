import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { CatalogoService } from '../../../core/services/catalogo.service';
import { PlatoResponse } from '../../../core/models/catalogo-api.model';
import {
  OpPlatoEliminarDialog
} from '../../../dialogs/op-plato-eliminar/op-plato-eliminar-dialog';

@Component({
  selector: 'rp-op-plato-eliminar',
  standalone: true,
  imports: [RouterLink, OpPlatoEliminarDialog],
  templateUrl: './op-plato-eliminar.html',
  styleUrl: './op-plato-eliminar.css'
})
export class OpPlatoEliminarPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly catalogo = inject(CatalogoService);
  private readonly destroyRef = inject(DestroyRef);

  readonly plato = signal<PlatoResponse | null>(null);
  readonly cargando = signal(true);
  readonly eliminando = signal(false);
  readonly error = signal('');

  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get('id');
    const id = rawId === null ? NaN : Number(rawId);
    const restauranteId = this.auth.session()?.restauranteId;

    if (!Number.isSafeInteger(id) || id <= 0) {
      this.error.set('El identificador del plato no es válido.');
      this.cargando.set(false);
      return;
    }

    if (!restauranteId) {
      this.error.set('No tienes un restaurante asociado a tu sesión.');
      this.cargando.set(false);
      return;
    }

    this.catalogo.obtenerPlato(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargando.set(false))
      )
      .subscribe({
        next: plato => {
          if (
            plato.id !== id ||
            plato.restauranteId !== restauranteId
          ) {
            this.error.set(
              'El plato no pertenece al restaurante de tu sesión.'
            );
            return;
          }

          this.plato.set(plato);
        },
        error: (err: HttpErrorResponse) => {
          this.error.set(
            err.status === 404
              ? 'No se encontró el plato.'
              : err.status === 403
                ? 'No tienes autorización para consultar este plato.'
                : 'No se pudo cargar la información del plato.'
          );
        }
      });
  }

  volver(): void {
    if (this.eliminando()) return;

    void this.router.navigate(['/operacion/platos']);
  }

  confirmarEliminacion(): void {
    if (this.cargando() || this.eliminando()) return;

    const plato = this.plato();
    const session = this.auth.session();

    if (!plato || !session) {
      this.error.set('No se encontró información válida del plato.');
      return;
    }

    if (
      session.restauranteId !== plato.restauranteId ||
      !['ADMINISTRADOR', 'DUENO'].includes(session.role)
    ) {
      this.error.set('No tienes permisos para eliminar platos.');
      return;
    }

    this.error.set('');
    this.eliminando.set(true);

    this.catalogo.eliminarPlato(plato.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.eliminando.set(false))
      )
      .subscribe({
        next: () => {
          void this.router.navigate(['/operacion/platos']);
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 403) {
            this.error.set('No tienes permisos para eliminar este plato.');
          } else if (err.status === 404) {
            this.error.set('El plato ya no existe.');
          } else if (err.status === 409) {
            this.error.set(
              'No se puede eliminar porque el plato tiene registros relacionados. ' +
              'Puedes marcarlo como agotado.'
            );
          } else {
            this.error.set(
              'No se pudo confirmar la eliminación. ' +
              'Comprueba si el plato sigue en el listado antes de reintentar.'
            );
          }
        }
      });
  }
}
