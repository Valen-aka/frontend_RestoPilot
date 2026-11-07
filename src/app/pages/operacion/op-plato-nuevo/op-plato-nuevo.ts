import {WorkspaceShell} from '../../../components/workspace-shell/workspace-shell';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { CatalogoService } from '../../../core/services/catalogo.service';
import {
  CategoriaResponse,
  PlatoRequest
} from '../../../core/models/catalogo-api.model';

@Component({
  selector: 'rp-op-plato-nuevo',
  standalone: true,
  imports: [WorkspaceShell,ReactiveFormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatCheckboxModule],
  templateUrl: './op-plato-nuevo.html',
  styleUrl: './op-plato-nuevo.css'
})
export class OpPlatoNuevoPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly catalogo = inject(CatalogoService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly categorias = signal<readonly CategoriaResponse[]>([]);
  readonly cargandoCategorias = signal(false);
  readonly guardando = signal(false);
  readonly error = signal('');

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
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    const restauranteId = this.auth.session()?.restauranteId;

    if (!restauranteId) {
      this.error.set('No tienes un restaurante asociado a tu sesión.');
      return;
    }

    this.cargandoCategorias.set(true);
    this.error.set('');

    this.catalogo.categorias(restauranteId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargandoCategorias.set(false))
      )
      .subscribe({
        next: categorias => this.categorias.set(categorias),
        error: () => {
          this.error.set('No se pudieron cargar las categorías.');
        }
      });
  }

  guardar(): void {
    if (this.guardando()) return;

    this.form.markAllAsTouched();

    if (this.form.invalid) return;

    const session = this.auth.session();
    const restauranteId = session?.restauranteId;

    if (!restauranteId ||
      !session ||
      !['ADMINISTRADOR', 'DUENO'].includes(session.role)) {
      this.error.set('No tienes permisos para registrar platos.');
      return;
    }

    const valores = this.form.getRawValue();

    if (!this.categorias().some(c =>
      c.id === valores.categoriaId &&
      c.restauranteId === restauranteId
    )) {
      this.error.set('Selecciona una categoría válida del restaurante.');
      return;
    }

    const nombre = valores.nombre.trim();
    const precio = Number(valores.precio);
    const tiempo = Number(valores.tiempoPreparacionMinutos);

    if (!nombre ||
      !Number.isFinite(precio) ||
      precio <= 0 ||
      !Number.isInteger(tiempo) ||
      tiempo < 5 ||
      tiempo > 15) {
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
      categoriaId: Number(valores.categoriaId),
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
    this.guardando.set(true);

    this.catalogo.crearPlato(datos)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.guardando.set(false))
      )
      .subscribe({
        next: plato => {
          if (plato.restauranteId !== restauranteId) {
            this.error.set('La respuesta no corresponde al restaurante.');
            return;
          }

          void this.router.navigate(['/operacion/platos']);
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 403) {
            this.error.set('No tienes autorización para crear platos.');
          } else if (err.status === 400) {
            this.error.set('El servidor rechazó los datos del plato.');
          } else {
            this.error.set(
              'No se pudo confirmar el registro. Revisa el listado antes de volver a intentarlo.'
            );
          }
        }
      });
  }
}
