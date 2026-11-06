import {Injectable,signal} from '@angular/core';
@Injectable({providedIn:'root'})
export class RegistrationBusy {readonly busy=signal(false);}
