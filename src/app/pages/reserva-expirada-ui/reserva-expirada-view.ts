import {afterNextRender, Component, computed, DestroyRef, DOCUMENT, effect, inject, input, untracked} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {NgTemplateOutlet} from '@angular/common';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTableModule} from '@angular/material/table';
import {CocinaShell} from '../operacion/cocina-ui/cocina-shell';
import {ExpiredClientShell} from './expired-client-shell';
import {ReservaExpiradaStore} from './reserva-expirada-store';
import {parseReservaId} from '../../core/models/reserva-api.model';
import {attendanceDestination} from '../operacion/reserva-atencion-ui/reserva-atencion.model';
import {ExpiryContext, expirationDate, expirationIssue, expirationReason, formatExpiryDate} from './reserva-expirada.model';

@Component({selector:'rp-reserva-expirada-view',
  imports:[NgTemplateOutlet,RouterLink,MatButtonModule,MatCardModule,MatProgressSpinnerModule,MatTableModule,CocinaShell,ExpiredClientShell],
  templateUrl:'./reserva-expirada-view.html',styleUrls:['./reserva-expirada-view.css','./restaurant-map.css']})
export class ReservaExpiradaView {
  readonly context=input<ExpiryContext>('client');
  readonly mode=input<'detail'|'history'>('detail');
  readonly store=inject(ReservaExpiradaStore);
  readonly router=inject(Router);
  private readonly document=inject(DOCUMENT);
  private readonly destroyRef=inject(DestroyRef);
  private focusRestored=false;
  private readonly route=inject(ActivatedRoute);
  private readonly params=toSignal(this.route.queryParamMap,{initialValue:this.route.snapshot.queryParamMap});
  private readonly navigationState=this.document.defaultView?.history.state??{};
  readonly selectedId=computed(()=>this.params().has('reservaId')?parseReservaId(this.params().get('reservaId')):parseReservaId(this.navigationState.expiredReservationId));
  readonly selected=this.store.selected;
  readonly rows=this.store.rows;
  readonly attendanceRows=computed(()=>this.context()==='operation'?this.rows().filter(r=>['Confirmada','Completada'].includes(r.status)):[]);
  readonly attendanceDestination=attendanceDestination;
  readonly problem=this.store.problem;
  readonly historyPath=computed(()=>this.context()==='client'?'/cliente/reservas':'/operacion/reservas');
  readonly detailPath=computed(()=>this.context()==='client'?'/cliente/reserva':'/operacion/reserva');
  readonly detailQuery=computed(()=>({vista:this.context()==='client'?'cliente-reserva-expirada':'op-reserva-expirada'}));
  readonly title=computed(()=>this.mode()==='history'?(this.context()==='operation'?'Reservas del restaurante':'Mis reservas'):
    this.selected()?.status==='Expirada'?(this.context()==='client'?'Tu reserva expirada':'Reserva expirada'):'Consulta de la reserva');
  readonly columns=['id','startsAt','table','guests','status','expiredAt','action'];
  readonly date=formatExpiryDate;
  readonly expirationDate=expirationDate;
  readonly expirationIssue=expirationIssue;
  readonly reason=expirationReason;
  constructor(){
    effect(()=>{const context=this.context(),mode=this.mode(),id=this.selectedId(),key=this.store.sessionKey();untracked(()=>this.store.load(context,mode,id));});
    effect(()=>{
      const state=this.store.queryState(),refreshing=this.store.refreshing(),rows=this.rows(),mode=this.mode();
      const id=this.navigationState.expiredReturnId;
      if(mode==='history'&&state==='ready'&&!refreshing&&!this.focusRestored&&Number.isSafeInteger(id)){
        untracked(()=>setTimeout(()=>{
          if(this.destroyRef.destroyed||this.focusRestored)return;
          (this.document.getElementById('expiry-row-'+id)??this.document.getElementById('expiry-heading'))?.focus();this.focusRestored=true;
        },0));
      }
    });
    afterNextRender(()=>{const id=this.navigationState.expiredReturnId;
      if(this.mode()==='history'&&Number.isSafeInteger(id))(this.document.getElementById('expiry-row-'+id)??this.document.getElementById('expiry-heading'))?.focus();
      else if(this.selectedId())this.document.getElementById('expiry-heading')?.focus();
    });
  }
}
