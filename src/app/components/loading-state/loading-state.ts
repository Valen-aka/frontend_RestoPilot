import {Component, Input} from '@angular/core';
@Component({selector:'rp-loading-state',templateUrl:'./loading-state.html',styleUrl:'./loading-state.css'})
export class LoadingState {
 @Input() count=6;
 @Input() label='Preparando tu espacio.';
 get placeholders(){return Array.from({length:Math.min(12,Math.max(1,Math.floor(Number(this.count)||1)))},(_,index)=>index);}
}
