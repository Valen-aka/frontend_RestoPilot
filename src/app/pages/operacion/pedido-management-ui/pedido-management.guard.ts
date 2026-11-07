import {inject} from '@angular/core';
import {CanDeactivateFn} from '@angular/router';
import {PedidoManagementStore} from './pedido-management.store';
export const pedidoManagementPendingGuard:CanDeactivateFn<unknown>=()=>!inject(PedidoManagementStore).busy();
