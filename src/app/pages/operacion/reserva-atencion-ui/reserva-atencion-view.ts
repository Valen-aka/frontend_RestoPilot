import {Component, DestroyRef, DOCUMENT, afterNextRender, computed, inject, input} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Router, RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {CocinaShell} from '../cocina-ui/cocina-shell';
import {ReservaAtencionStore} from './reserva-atencion-store';
import {AttendanceAction, AttendanceCommand, AttendanceReservation, attendanceDate, attendanceDestination,
  attendanceProblem, attendanceTime, reservationVersion} from './reserva-atencion.model';
import {ReservaAtencionDialog} from './reserva-atencion-dialog';

@Component({selector: 'rp-reserva-atencion-view',
  imports: [RouterLink, MatButtonModule, MatCardModule, MatProgressSpinnerModule, CocinaShell],
  templateUrl: './reserva-atencion-view.html', styleUrl: './reserva-atencion-view.css'})
export class ReservaAtencionView {
  readonly mode = input<'arrival' | 'attending' | 'completed'>('arrival');
  readonly store = inject(ReservaAtencionStore);
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  private dialogRef?: MatDialogRef<ReservaAtencionDialog, boolean>;
  readonly reservation = computed(() => this.store.queryState() === 'loading' || this.store.queryState() === 'error' ? undefined : this.store.selected());
  readonly stageMatches = computed(() => {
    const reservation = this.reservation();
    return !!reservation && (this.mode() === 'completed' ? reservation.status === 'Completada' :
      reservation.status === 'Confirmada' && (this.mode() === 'arrival' ? !reservation.arrivedAt : !!reservation.arrivedAt));
  });
  readonly title = computed(() => !this.stageMatches() || this.store.problem() ? 'Consulta de la reserva' :
    this.mode() === 'arrival' ? 'Tu mesa ya está confirmada' : this.mode() === 'attending' ? 'Disfrutando del servicio' : 'Una experiencia completada');
  readonly action = computed<AttendanceAction>(() => this.mode() === 'arrival' ? 'arrival' : 'complete');
  readonly actionLabel = computed(() => this.action() === 'arrival' ? 'Simular llegada' : 'Simular finalización');
  readonly actionProblem = computed(() => {
    const reservation = this.reservation();
    return reservation ? attendanceProblem(reservation, this.action(), this.store.now()) : '';
  });
  readonly feedback = computed(() => {const message = this.store.feedback(); return message?.id === this.store.selectedId() ? message : undefined;});
  readonly date = attendanceDate;
  readonly time = attendanceTime;
  readonly destination = attendanceDestination;

  constructor() {
    const navigation = this.document.defaultView?.history.state;
    if (navigation && Object.hasOwn(navigation, 'us25ReservationId')) {
      const id = navigation.us25ReservationId;
      this.store.selectedId.set(Number.isSafeInteger(id) && id > 0 ? id : undefined);
    }
    afterNextRender(() => {
      if (navigation?.us25Focus === true) this.document.getElementById('attendance-title')?.focus();
    });
    this.destroyRef.onDestroy(() => {
      if (this.dialogRef) {this.dialogRef.close(false);this.store.busy.set(false);}
    });
  }

  request(event: Event): void {
    if (this.store.busy() || this.store.queryState() !== 'ready') return;
    const reservation = this.reservation();
    if (!reservation || !this.stageMatches() || this.mode() === 'completed') return;
    if (this.actionProblem()) {
      this.store.feedback.set({id: reservation.id, kind: 'error', text: this.actionProblem()});
      this.focusFeedback(); return;
    }
    const trigger = event.currentTarget as HTMLButtonElement;
    const command: AttendanceCommand = {id: reservation.id, action: this.action(), expectedVersion: reservationVersion(reservation)};
    this.store.busy.set(true);
    this.dialogRef = this.dialog.open(ReservaAtencionDialog, {data: {command, status: reservation.status, now: this.store.now()},
      width: '480px', maxWidth: 'calc(100vw - 32px)', autoFocus: 'first-tabbable', restoreFocus: false});
    this.dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(confirmed => {
      this.dialogRef = undefined;
      if (!confirmed) {this.store.busy.set(false);setTimeout(() => trigger.isConnected ? trigger.focus() : this.document.getElementById('attendance-title')?.focus(), 0);return;}
      const result = this.store.apply(command);
      this.store.busy.set(false);
      if (!result.ok) {this.focusFeedback();return;}
      this.goTo(result.reservation);
    });
  }

  openSample(): void {
    this.store.selectedId.set(208);this.store.feedback.set(undefined);
    const reservation = this.store.selected();
    if (reservation) this.goTo(reservation);
  }
  private goTo(reservation: AttendanceReservation): void {
    const destination = attendanceDestination(reservation);
    void this.router.navigate([destination.path], {queryParams: destination.vista ? {vista: destination.vista} : {},
      state: {us25ReservationId: reservation.id, us25Focus: true}});
  }
  private focusFeedback(): void {setTimeout(() => this.document.getElementById('attendance-feedback')?.focus(), 0);}
}
