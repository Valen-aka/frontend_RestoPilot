import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, finalize } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { CatalogoService } from '../../../core/services/catalogo.service';
import {
  CategoriaResponse,
  PlatoRequest
} from '../../../core/models/catalogo-api.model';

@Component({
  selector: 'rp-op-plato-editar',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './op-plato-editar.html',
  styleUrl: './op-plato-editar.css'
})
export class OpPlatoEditarPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly catalogo = inject(CatalogoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly categorias = signal<readonly CategoriaResponse[]>([]);
  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly error = signal('');
  readonly exito = signal('');
  readonly platoId = signal<number | null>(null);

  readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(150)]],
    categoriaId: [0, [Validators.required, Validators.min(1)]],
    descripcion: [''],
    precio: [0, [Validators.required, Validators.min(0.01)]],
    ingredientes: [''],
    alergenos: [''],
    complejidad: ['MEDIA', [Validators.required]],
    tiempoPreparacionMinutos: [
      10,
      [Validators.required, Validators.min(5), Validators.max(15)]
    ],
    disponible: [true],
    imagenUrl: ['']
  });

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

    this.platoId.set(id);
    this.cargarDatos(id, restauranteId);
  }

  private cargarDatos(id: number, restauranteId: number): void {
    this.cargando.set(true);
    this.error.set('');

    forkJoin({
      plato: this.catalogo.obtenerPlato(id),
      categorias: this.catalogo.categorias(restauranteId)
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargando.set(false))
      )
      .subscribe({
        next: ({ plato, categorias }) => {
          if (plato.id !== id || plato.restauranteId !== restauranteId) {
            this.error.set(
              'El plato no pertenece al restaurante de tu sesión.'
            );
            return;
          }

          this.categorias.set(categorias);

          this.form.patchValue({
            nombre: plato.nombre,
            categoriaId: plato.categoriaId,
            descripcion: plato.descripcion ?? '',
            precio: plato.precio,
            ingredientes: plato.ingredientes ?? '',
            alergenos: plato.alergenos ?? '',
            complejidad: plato.complejidad ?? 'MEDIA',
            tiempoPreparacionMinutos:
              plato.tiempoPreparacionMinutos ?? 10,
            disponible: plato.disponible,
            imagenUrl: plato.imagenUrl ?? ''
          });
        },
        error: (err: HttpErrorResponse) => {
          this.error.set(
            err.status === 404
              ? 'No se encontró el plato solicitado.'
              : err.status === 403
                ? 'No tienes autorización para consultar este plato.'
                : 'No se pudieron cargar los datos del plato.'
          );
        }
      });
  }

  guardar(): void {
    if (this.guardando() || this.cargando()) return;

    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.error.set('Completa correctamente los campos obligatorios.');
      return;
    }

    const session = this.auth.session();
    const restauranteId = session?.restauranteId;
    const id = this.platoId();

    if (
      !session ||
      !restauranteId ||
      !id ||
      !['ADMINISTRADOR', 'DUENO'].includes(session.role)
    ) {
      this.error.set('No tienes permisos para editar platos.');
      return;
    }

    const valores = this.form.getRawValue();
    const nombre = valores.nombre.trim();
    const precio = Number(valores.precio);
    const tiempo = Number(valores.tiempoPreparacionMinutos);
    const categoriaId = Number(valores.categoriaId);

    if (
      !this.categorias().some(
        categoria =>
          categoria.id === categoriaId &&
          categoria.restauranteId === restauranteId
      )
    ) {
      this.error.set('Selecciona una categoría válida.');
      return;
    }

    if (
      !nombre ||
      !Number.isFinite(precio) ||
      precio <= 0 ||
      !Number.isInteger(tiempo) ||
      tiempo < 5 ||
      tiempo > 15
    ) {
      this.error.set('Revisa el nombre, precio y tiempo de preparación.');
      return;
    }

    const complejidad = valores.complejidad as
      'BAJA' | 'MEDIA' | 'ALTA';

    if (!['BAJA', 'MEDIA', 'ALTA'].includes(complejidad)) {
      this.error.set('Selecciona una complejidad válida.');
      return;
    }

    const opcional = (valor: string): string | null =>
      valor.trim() || null;

    const datos: PlatoRequest = {
      restauranteId,
      categoriaId,
      nombre,
      descripcion: opcional(valores.descripcion),
      precio,
      ingredientes: opcional(valores.ingredientes),
      alergenos: opcional(valores.alergenos),
      complejidad,
      tiempoPreparacionMinutos: tiempo,
      disponible: valores.disponible,
      imagenUrl: opcional(valores.imagenUrl)
    };

    this.error.set('');
    this.exito.set('');
    this.guardando.set(true);

    this.catalogo.actualizarPlato(id, datos)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.guardando.set(false))
      )
      .subscribe({
        next: plato => {
          if (plato.id !== id || plato.restauranteId !== restauranteId) {
            this.error.set(
              'La respuesta del servidor no corresponde al plato.'
            );
            return;
          }

          this.exito.set('Plato actualizado correctamente.');
          void this.router.navigate(['/operacion/platos']);
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 403) {
            this.error.set('No tienes permisos para editar este plato.');
          } else if (err.status === 404) {
            this.error.set('El plato ya no existe.');
          } else if (err.status === 400) {
            this.error.set('El servidor rechazó los datos enviados.');
          } else {
            this.error.set(
              'No se pudo confirmar la actualización. ' +
              'Revisa el plato antes de volver a intentarlo.'
            );
          }
        }
      });
  }
}
