import {Component, computed, inject} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {ReservaStore} from '../reserva-ui/reserva-store';
import {ReservaItem} from '../reserva-ui/reserva.model';
import {ClienteReservaCancelarDialog} from '../../../dialogs/cliente-reserva-cancelar/cliente-reserva-cancelar-dialog';

/**
 * Frame: cliente-reserva-cancelar | "¿Seguro que deseas cancelar?"
 * Responsable: Cristian Condori
 * US09: Anulación voluntaria de reserva con motivo opcional (hasta 300 caracteres).
 * Regla de negocio: Permitida si faltan más de 2 horas. Si faltan <= 2 horas, se bloquea y deriva a recepción.
 */
@Component({
  selector: 'rp-cliente-reserva-cancelar',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatIconModule
  ],
  templateUrl: './cliente-reserva-cancelar.html',
  styleUrls: ['../reserva-ui/reserva-view.css', './cliente-reserva-cancelar.css']
})
export class ClienteReservaCancelarPage {
  readonly store = inject(ReservaStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);

  readonly form0 = new FormGroup({
    motivo: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(300)]
    })
  });

  readonly reserva = computed<ReservaItem>(() => {
    const nav = this.router.getCurrentNavigation();
    const stateId = (nav?.extras.state as { reservaId?: number })?.reservaId;
    const qId = Number(this.route.snapshot.queryParamMap.get('id'));
    const targetId = stateId || qId;

    if (targetId) {
      const encontrada = this.store.obtenerReservaPorId(targetId);
      if (encontrada) return encontrada;
    }

    const cancelable = this.store.reservas().find(r => r.estado === 'PENDIENTE' || r.estado === 'CONFIRMADA');
    return cancelable || this.store.reservas()[0];
  });

  /**
   * Determina si la reserva cumple la regla de más de 2 horas de anticipación.
   */
  readonly esAnticipacionValida = computed<boolean>(() => {
    const r = this.reserva();
    if (!r) return false;
    // Si la reserva es de hoy o fecha futura, calculamos la diferencia
    try {
      const [year, month, day] = r.fecha.split('-').map(Number);
      const [hours, minutes] = r.horaInicio.split(':').map(Number);
      const targetTime = new Date(year, month - 1, day, hours, minutes).getTime();
      const now = new Date().getTime();
      const diffHoras = (targetTime - now) / (1000 * 60 * 60);
      return diffHoras > 2;
    } catch {
      return true;
    }
  });

  abrirDialogoCancelacion() {
    const r = this.reserva();
    if (!r) return;

    // Regla US09: Si faltan 2 horas o menos, derivar a vista de bloqueo
    if (!this.esAnticipacionValida()) {
      this.router.navigate(['/cliente/reserva/cancelar'], {
        queryParams: { vista: 'cliente-reserva-cancelacion-bloqueada', id: r.id }
      });
      return;
    }

    const dialogRef = this.dialog.open(ClienteReservaCancelarDialog, {
      width: '440px',
      data: { codigo: r.codigo }
    });

    dialogRef.afterClosed().subscribe((confirmado: boolean) => {
      if (confirmado) {
        const motivo = this.form0.controls.motivo.value.trim();
        this.store.cancelarReserva(r.id, motivo);
        this.router.navigate(['/cliente/reserva'], {
          queryParams: { vista: 'cliente-reserva-cancelada', id: r.id },
          state: { reservaId: r.id }
        });
      }
    });
  }

  simularBloqueo2Horas() {
    const r = this.reserva();
    this.router.navigate(['/cliente/reserva/cancelar'], {
      queryParams: { vista: 'cliente-reserva-cancelacion-bloqueada', id: r?.id }
    });
  }
}
