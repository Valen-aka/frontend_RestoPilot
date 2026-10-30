import {Component, EventEmitter, Input, Output} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
@Component({selector:'rp-empty-state',imports:[RouterLink,MatButtonModule],templateUrl:'./empty-state.html',styleUrl:'./empty-state.css'})
export class EmptyState {
 @Input() icon='!';
 @Input() title='';
 @Input() description='';
 @Input() actionLabel='';
 @Input() actionUrl:string|null=null;
 @Output() action=new EventEmitter<void>();
}
