import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { CatalogoService } from '../../../core/services/catalogo.service';
import { PlatoResponse } from '../../../core/models/catalogo-api.model';

import {
  OpPlatoDisponibilidadDialog
} from '../../../dialogs/op-plato-disponibilidad/op-plato-disponibilidad-dialog';

@Component({
  selector: 'rp-op-plato-disponibilidad',
  standalone: true,
  imports: [RouterLink, OpPlatoDisponibilidadDialog],
  templateUrl: './op-plato-disponibilidad.html',
  styleUrl: './op-plato-disponibilidad.css'
})
export class OpPlatoDisponibilidadPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly catalogo = inject(CatalogoService);
  private readonly destroyRef = inject(DestroyRef);

  readonly plato = signal<PlatoResponse | null>(null);
  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly error = signal('');

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
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
              'El plato no corresponde al restaurante de tu sesión.'
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
                ? 'No tienes autorización para consultar el plato.'
                : 'No se pudo cargar el plato.'
          );
        }
      });
  }

  volver(): void {
    if (this.guardando()) return;

    void this.router.navigate(['/operacion/platos']);
  }

  confirmarCambio(): void {
    if (this.guardando() || this.cargando()) return;

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
      this.error.set('No tienes permisos para modificar este plato.');
      return;
    }

    const nuevoEstado = !plato.disponible;

    this.error.set('');
    this.guardando.set(true);

    this.catalogo.cambiarDisponibilidadPlato(
      plato.id,
      nuevoEstado
    )
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.guardando.set(false))
      )
      .subscribe({
        next: actualizado => {
          if (
            actualizado.id !== plato.id ||
            actualizado.restauranteId !== plato.restauranteId ||
            actualizado.disponible !== nuevoEstado
          ) {
            this.error.set(
              'No se pudo verificar el nuevo estado del plato.'
            );
            return;
          }

          this.plato.set(actualizado);
          void this.router.navigate(['/operacion/platos']);
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 403) {
            this.error.set('No tienes permisos para cambiar el estado.');
          } else if (err.status === 404) {
            this.error.set('El plato ya no existe.');
          } else {
            this.error.set(
              'No se pudo confirmar el cambio. ' +
              'Consulta el listado antes de volver a intentarlo.'
            );
          }
        }
      });
  }
}
