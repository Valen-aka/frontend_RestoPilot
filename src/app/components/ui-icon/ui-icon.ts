import {Component, Input} from '@angular/core';
@Component({selector:'rp-ui-icon',templateUrl:'./ui-icon.html',styleUrl:'./ui-icon.css'})
export class UiIcon {
 @Input() name='';
 readonly paths:Record<string,string>={
 'Vista general':'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
 'Pedidos':'M6 3h12v18l-3-2-3 2-3-2-3 2z M9 8h6 M9 12h6',
 'Cocina':'M5 10a4 4 0 0 1 3-7 5 5 0 0 1 8 0 4 4 0 0 1 3 7v5H5z M5 19h14 M9 15v4 M15 15v4',
 'Carta':'M4 4h7a3 3 0 0 1 3 3v14a4 4 0 0 0-4-2H4z M14 7a3 3 0 0 1 3-3h4v15h-3a4 4 0 0 0-4 2',
 'Reservas':'M5 5h14v16H5z M8 3v4 M16 3v4 M5 10h14 M8 14h2 M14 14h2',
 'Mesas':'M3 7h18v9H3z M6 16v5 M18 16v5 M7 3v4 M17 3v4',
 'Pagos':'M3 5h18v14H3z M3 10h18 M7 15h4',
 'Reportes':'M4 3v18h17 M8 17v-5 M13 17V7 M18 17v-9',
 'Notificaciones':'M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9 M10 21h4',
 'Asistente de reportes':'m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3z',
 'Incorporar administrador':'M15 21H3v-3a6 6 0 0 1 12 0 M13 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M19 8v6 M16 11h6'
 };
}
