import {inject} from '@angular/core';
import {CanDeactivateFn} from '@angular/router';
import {AgendaStore} from '../../pages/operacion/agenda-ui/agenda-store';
export const agendaPendingGuard:CanDeactivateFn<unknown>=()=>{const s=inject(AgendaStore);return !s.hasSession()||!s.busy();};
