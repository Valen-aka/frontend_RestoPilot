import {Component, DestroyRef, DOCUMENT, afterNextRender, computed, effect, inject, input, untracked} from '@angular/core';
import {toSignal, takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {CocinaShell} from '../cocina-ui/cocina-shell';
import {ReservaAtencionStore} from './reserva-atencion-store';
import {parseReservaId} from '../../../core/models/reserva-api.model';
import {AttendanceAction, AttendanceCommand, AttendanceReservation, attendanceDate, attendanceDestination,
  attendanceTime, reservationVersion} from './reserva-atencion.model';
import {ReservaAtencionDialog} from './reserva-atencion-dialog';

@Component({selector:'rp-reserva-atencion-view',
  imports:[RouterLink,MatButtonModule,MatCardModule,MatProgressSpinnerModule,CocinaShell],
  templateUrl:'./reserva-atencion-view.html',styleUrl:'./reserva-atencion-view.css'})
export class ReservaAtencionView {
  readonly mode=input<'arrival'|'attending'|'completed'>('arrival');
  readonly store=inject(ReservaAtencionStore);
  private readonly document=inject(DOCUMENT);
  readonly router=inject(Router);
  private readonly route=inject(ActivatedRoute);
  private readonly params=toSignal(this.route.queryParamMap,{initialValue:this.route.snapshot.queryParamMap});
  private readonly navigation=this.document.defaultView?.history.state;
  readonly selectedId=computed(()=>this.params().has('reservaId')?parseReservaId(this.params().get('reservaId')):parseReservaId(this.navigation?.us25ReservationId));
  private readonly dialog=inject(MatDialog);
  private readonly destroyRef=inject(DestroyRef);
  private dialogRef?:MatDialogRef<ReservaAtencionDialog,boolean>;
  private dialogSession='';
  readonly reservation=computed(()=>['loading','error'].includes(this.store.queryState())?undefined:this.store.selected());
  readonly stageMatches=computed(()=>{
    const r=this.reservation();return !!r&&(this.mode()==='completed'?r.status==='Completada':r.status==='Confirmada'&&(this.mode()==='arrival'?!r.arrivedAt:!!r.arrivedAt));
  });
  readonly title=computed(()=>!this.stageMatches()?'Consulta de la reserva':this.mode()==='arrival'?'Tu mesa ya está confirmada':this.mode()==='attending'?'Disfrutando del servicio':'Una experiencia completada');
  readonly action=computed<AttendanceAction>(()=>this.mode()==='arrival'?'arrival':'complete');
  readonly actionLabel=computed(()=>this.action()==='arrival'?'Registrar llegada':'Completar atención');
  readonly actionProblem=computed(()=>this.store.actionProblem(this.action()));
  readonly feedback=computed(()=>{const message=this.store.feedback();return message?.id===this.store.selectedId()?message:undefined;});
  readonly date=attendanceDate;
  readonly time=attendanceTime;
  readonly destination=attendanceDestination;

  constructor(){
    effect(()=>{const id=this.selectedId(),key=this.store.sessionKey();untracked(()=>this.store.load(id));});
    effect(()=>{const key=this.store.sessionKey();untracked(()=>{if(this.dialogRef&&this.dialogSession!==key)this.dialogRef.close(false);});});
    afterNextRender(()=>{if(this.navigation?.us25Focus===true)this.document.getElementById('attendance-title')?.focus();});
    this.destroyRef.onDestroy(()=>{if(this.dialogRef){this.dialogRef.close(false);this.store.busy.set(false);}});
  }
  request(event:Event):void {
    if(this.store.busy()||this.store.refreshing()||this.store.verificationId()!==null||this.store.queryState()!=='ready')return;
    const r=this.reservation();if(!r||!this.stageMatches()||this.mode()==='completed'||this.actionProblem())return;
    const trigger=event.currentTarget as HTMLButtonElement;
    const command:AttendanceCommand={id:r.id,action:this.action(),expectedVersion:reservationVersion(r)};
    this.dialogSession=this.store.sessionKey();this.store.busy.set(true);
    this.dialogRef=this.dialog.open(ReservaAtencionDialog,{data:{command,status:r.status,now:this.store.now(),table:r.table,startsAt:r.startsAt,endsAt:r.endsAt},
      width:'480px',maxWidth:'calc(100vw - 32px)',autoFocus:'first-tabbable',restoreFocus:false});
    this.dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(confirmed=>{
      this.dialogRef=undefined;
      if(!confirmed){this.store.busy.set(false);setTimeout(()=>trigger.isConnected?trigger.focus():this.document.getElementById('attendance-title')?.focus(),0);return;}
      const key=this.store.sessionKey(),url=this.router.url;
      void this.store.apply(command).then(result=>{
        if(key!==this.store.sessionKey()||url!==this.router.url)return;
        if(!result.ok){setTimeout(()=>this.document.getElementById('attendance-feedback')?.focus(),0);return;}
        this.goTo(result.reservation);
      });
    });
  }
  private goTo(reservation:AttendanceReservation):void {
    const target=attendanceDestination(reservation);
    void this.router.navigate([target.path],{queryParams:{vista:target.vista,reservaId:reservation.id},state:{us25ReservationId:reservation.id,us25Focus:true}});
  }
}
