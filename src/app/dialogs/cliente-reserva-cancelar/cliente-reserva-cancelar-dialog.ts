import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';

export interface CancelarDialogData {
  codigo?: string;
}

/**
 * Diálogo modal para confirmación de anulación voluntaria de reserva (US09).
 */
@Component({
  selector: 'rp-cliente-reserva-cancelar-dialog',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './cliente-reserva-cancelar-dialog.html',
  styleUrl: './cliente-reserva-cancelar-dialog.css'
})
export class ClienteReservaCancelarDialog {
  readonly dialogRef = inject(MatDialogRef<ClienteReservaCancelarDialog>);
  readonly data = inject<CancelarDialogData | null>(MAT_DIALOG_DATA, { optional: true });
}
