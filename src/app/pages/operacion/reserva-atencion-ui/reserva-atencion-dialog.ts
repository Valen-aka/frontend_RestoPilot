import {Component, inject, signal} from '@angular/core';
import {A11yModule} from '@angular/cdk/a11y';
import {MatButtonModule} from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {AttendanceCommand, ReservationStatus, attendanceDate} from './reserva-atencion.model';

export interface AttendanceDialogData {
  readonly command: AttendanceCommand;
  readonly status: ReservationStatus;
  readonly now: string;
}
@Component({selector: 'rp-reserva-atencion-dialog', imports: [A11yModule, MatButtonModule, MatDialogModule],
  templateUrl: './reserva-atencion-dialog.html', styleUrl: './reserva-atencion-dialog.css'})
export class ReservaAtencionDialog {
  readonly data = inject<AttendanceDialogData>(MAT_DIALOG_DATA);
  private readonly dialog = inject(MatDialogRef<ReservaAtencionDialog, boolean>);
  readonly submitted = signal(false);
  readonly label = this.data.command.action === 'arrival' ? 'Simular llegada' : 'Simular finalización';
  readonly date = attendanceDate;
  confirm(): void {
    if (this.submitted()) return;
    this.submitted.set(true); this.dialog.close(true);
  }
}
