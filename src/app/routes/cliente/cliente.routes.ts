import {sessionGuard} from '../../core/guards/session.guard';
import {reservaFisicaGuard} from '../../core/guards/atencion-fisica.guard';
import {reservaConsultaGuard} from '../../core/guards/reserva-consulta.guard';
import {Routes} from '@angular/router';
import {ClienteLayout} from '../../layouts/cliente-layout/cliente-layout';
const children:Routes=[
{path:"",pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/cliente"}},
{path:"carta",pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/cliente/carta"}},
{path:"plato",pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/cliente/plato"}},
{path:"carrito",pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/cliente/carrito"}},
{path:"entrega",pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/cliente/entrega"}},
{path:"pedidos",pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/cliente/pedidos"}},
{path:"pedido",pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/cliente/pedido"}},
{path:"pago",pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/cliente/pago"}},
{path:"reservar",canActivate:[reservaFisicaGuard],runGuardsAndResolvers:'paramsOrQueryParamsChange',pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/cliente/reservar"}},
{path:"plano",canActivate:[reservaFisicaGuard],runGuardsAndResolvers:'paramsOrQueryParamsChange',pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/cliente/plano"}},
{path:"reserva/revisar",canActivate:[reservaFisicaGuard],runGuardsAndResolvers:'paramsOrQueryParamsChange',pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/cliente/reserva/revisar"}},
{path:"reservas",canActivate:[reservaConsultaGuard],pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/cliente/reservas"}},
{path:"reserva",canActivate:[reservaConsultaGuard],runGuardsAndResolvers:'paramsOrQueryParamsChange',pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/cliente/reserva"}},
{path:"reserva/editar",pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/cliente/reserva/editar"}},
{path:"reserva/cancelar",pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/cliente/reserva/cancelar"}},
{path:"notificaciones",pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/cliente/notificaciones"}},
{path:"asistente",pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/cliente/asistente"}},
{path:"notificaciones/ia",pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/cliente/notificaciones/ia"}}
];

export const ROUTES:Routes=[{path:'',component:ClienteLayout,canActivateChild:[sessionGuard],children}];
