import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'rp-op-plato-disponibilidad-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './op-plato-disponibilidad-dialog.html',
  styleUrl: './op-plato-disponibilidad-dialog.css'
})
export class OpPlatoDisponibilidadDialog {
  @Input({ required: true }) nombre = '';
  @Input() disponible = true;
  @Input() guardando = false;

  @Output() confirmar = new EventEmitter<void>();
  @Output() volver = new EventEmitter<void>();

  get nuevoEstado(): boolean {
    return !this.disponible;
  }

  confirmarCambio(): void {
    if (!this.guardando) {
      this.confirmar.emit();
    }
  }
}
