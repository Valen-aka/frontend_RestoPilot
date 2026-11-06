import {inject} from '@angular/core';
import {CanDeactivateFn} from '@angular/router';
import {MesasStore} from '../../pages/operacion/mesas-ui/mesas-store';
export const mesasPendingGuard:CanDeactivateFn<unknown>=()=>{const store=inject(MesasStore);return !store.hasSession()||!store.busy();};
