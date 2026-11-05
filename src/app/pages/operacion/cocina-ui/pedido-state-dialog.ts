import {Component, inject, signal} from '@angular/core';
import {A11yModule} from '@angular/cdk/a11y';
import {MatButtonModule} from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {KitchenCommand, kitchenActionLabel} from './cocina.model';

@Component({selector: 'rp-pedido-state-dialog', imports: [A11yModule, MatButtonModule, MatDialogModule],
  templateUrl: './pedido-state-dialog.html', styleUrl: './pedido-state-dialog.css'})
export class PedidoStateDialog {
  readonly command = inject<KitchenCommand>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<PedidoStateDialog, boolean>);
  readonly submitted = signal(false);
  readonly label = kitchenActionLabel(this.command.target);

  confirm(): void {
    if (this.submitted()) return;
    this.submitted.set(true);
    this.dialogRef.close(true);
  }
}
