import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink} from '@angular/router';
import {finalize} from 'rxjs';
import {AuthService} from '../../../core/services/auth.service';
import {CatalogoService} from '../../../core/services/catalogo.service';
import {PlatoResponse} from '../../../core/models/catalogo-api.model';

@Component({
  selector: 'rp-op-platos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './op-platos.html',
  styleUrl: './op-platos.css'
})
export class OpPlatosPage implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly catalogo = inject(CatalogoService);

  readonly platos = signal<readonly PlatoResponse[]>([]);
  readonly cargando = signal(false);
  readonly error = signal('');
  readonly busqueda = signal('');
  readonly categoria = signal('TODAS');

  readonly restauranteId = computed(
    () => this.auth.session()?.restauranteId ?? null
  );

  readonly categorias = computed(() =>
    [...new Set(this.platos().map(plato => plato.categoriaNombre))]
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b))
  );

  readonly platosFiltrados = computed(() => {
    const texto = this.busqueda().trim().toLocaleLowerCase();
    const categoria = this.categoria();

    return this.platos().filter(plato => {
      const coincideTexto =
        plato.nombre.toLocaleLowerCase().includes(texto) ||
        plato.categoriaNombre.toLocaleLowerCase().includes(texto);

      const coincideCategoria =
        categoria === 'TODAS' ||
        plato.categoriaNombre === categoria;

      return coincideTexto && coincideCategoria;
    });
  });

  readonly disponibles = computed(() =>
    this.platos().filter(plato => plato.disponible).length
  );

  readonly agotados = computed(() =>
    this.platos().filter(plato => !plato.disponible).length
  );

  ngOnInit(): void {
    this.cargarPlatos();
  }

  cargarPlatos(): void {
    const restauranteId = this.restauranteId();

    if (restauranteId === null) {
      this.error.set('No se encontró un restaurante asociado a tu sesión.');
      this.platos.set([]);
      return;
    }

    this.cargando.set(true);
    this.error.set('');

    this.catalogo.platos(restauranteId)
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: platos => this.platos.set(platos),
        error: () => {
          this.platos.set([]);
          this.error.set('No fue posible cargar los platos. Intenta nuevamente.');
        }
      });
  }

  actualizarBusqueda(valor: string): void {
    this.busqueda.set(valor);
  }

  actualizarCategoria(valor: string): void {
    this.categoria.set(valor);
  }

  precio(valor: number): string {
    return `S/ ${valor.toFixed(2)}`;
  }
}
