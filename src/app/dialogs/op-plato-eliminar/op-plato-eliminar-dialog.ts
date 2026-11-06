import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'rp-op-plato-eliminar-dialog',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './op-plato-eliminar-dialog.html',
  styleUrl: './op-plato-eliminar-dialog.css'
})
export class OpPlatoEliminarDialog {
  @Input({ required: true }) nombre = '';
  @Input() eliminando = false;

  @Output() confirmar = new EventEmitter<void>();
  @Output() volver = new EventEmitter<void>();

  confirmarEliminacion(): void {
    if (!this.eliminando) {
      this.confirmar.emit();
    }
  }
}
