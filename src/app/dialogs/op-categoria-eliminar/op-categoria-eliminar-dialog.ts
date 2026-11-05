import {
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  Output,
  inject
} from '@angular/core';

import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';

import {
  MatSnackBar,
  MatSnackBarModule
} from '@angular/material/snack-bar';

import { MatButtonModule } from '@angular/material/button';

import { CategoriasStore } from '../../pages/operacion/categorias-ui/categorias-store';

@Component({
  selector: 'rp-op-categoria-eliminar-dialog',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './op-categoria-eliminar-dialog.html',
  styleUrls: [
    './op-categoria-eliminar-dialog.css',
    './op-categoria-eliminar-dialog.scss'
  ]
})
export class OpCategoriaEliminarDialog {
  @Input() context?: CategoriasStore;
  @Output() finished = new EventEmitter<void>();

  private readonly data = inject<CategoriasStore | null>(
    MAT_DIALOG_DATA,
    { optional: true }
  );

  private readonly ref = inject(
    MatDialogRef<OpCategoriaEliminarDialog>,
    { optional: true }
  );

  private readonly snack = inject(MatSnackBar);
  private alive = true;

  get store(): CategoriasStore {
    const store = this.context ?? this.data;

    if (!store) {
      throw new Error('No se proporcionó el contexto de categorías.');
    }

    return store;
  }

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.alive = false;
    });

    if (this.ref) {
      this.ref.disableClose = true;
    }
  }

  back(): void {
    if (this.store.busy()) return;

    if (this.ref) {
      this.ref.close(false);
    } else {
      this.finished.emit();
    }
  }

  async confirm(): Promise<void> {
    if (
      !this.alive ||
      this.store.busy() ||
      this.store.uncertain() ||
      !this.store.selected()
    ) {
      return;
    }

    const ok = await this.store.remove(true);

    if (!this.alive) return;

    if (ok) {
      this.snack.open(
        'Categoría eliminada correctamente.',
        'Cerrar',
        { duration: 5000 }
      );

      if (this.ref) {
        this.ref.close(true);
      } else {
        this.finished.emit();
      }
    }
  }
}
