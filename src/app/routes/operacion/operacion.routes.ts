import {pedidoManagementPendingGuard} from '../../pages/operacion/pedido-management-ui/pedido-management.guard';
import {sessionGuard} from '../../core/guards/session.guard';
import {mesasPendingGuard} from '../../core/guards/mesas.guard';
import {agendaPendingGuard} from '../../core/guards/agenda.guard';

import {atencionPendingGuard} from '../../core/guards/atencion-fisica.guard';
import {reservaConsultaGuard} from '../../core/guards/reserva-consulta.guard';
import {reservaAtencionGuard, reservaPendingGuard} from '../../core/guards/reserva-atencion.guard';
import {Routes} from '@angular/router';
import {operacionCocinaGuard, cocinaPendingGuard} from '../../core/guards/operacion-cocina.guard';
import {AdminLayout} from '../../layouts/admin-layout/admin-layout';
const children:Routes=[
{path:"",pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/operacion"}},
{path:"categorias",pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/operacion/categorias"}},
{path:"categoria/nueva",pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/operacion/categoria/nueva"}},
{path:"categoria/editar",pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/operacion/categoria/editar"}},
{path:"categoria/eliminar",pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/operacion/categoria/eliminar"}},
  {path: 'platos', pathMatch: 'full', loadComponent: () => import('../../pages/operacion/op-platos/op-platos').then(m => m.OpPlatosPage)},
  {path: 'plato/nuevo', pathMatch: 'full', loadComponent: () => import('../../pages/operacion/op-plato-nuevo/op-plato-nuevo').then(m => m.OpPlatoNuevoPage)},
  {path: 'plato/editar/:id', pathMatch: 'full', loadComponent: () => import('../../pages/operacion/op-plato-editar/op-plato-editar').then(m => m.OpPlatoEditarPage)},
  {path: 'plato/disponibilidad/:id', pathMatch: 'full', loadComponent: () => import('../../pages/operacion/op-plato-disponibilidad/op-plato-disponibilidad').then(m => m.OpPlatoDisponibilidadPage)},
  {path: 'plato/eliminar/:id', pathMatch: 'full', loadComponent: () => import('../../pages/operacion/op-plato-eliminar/op-plato-eliminar').then(m => m.OpPlatoEliminarPage)},
{path:"pedidos",canActivate:[operacionCocinaGuard],canDeactivate:[cocinaPendingGuard],pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/operacion/pedidos"}},
{path:"cocina",canActivate:[operacionCocinaGuard],canDeactivate:[cocinaPendingGuard],pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/operacion/cocina"}},
{path:"pedido",canActivate:[operacionCocinaGuard],canDeactivate:[cocinaPendingGuard],pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/operacion/pedido"}},
{path:"pedido/listo",canActivate:[operacionCocinaGuard],canDeactivate:[cocinaPendingGuard],pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/operacion/pedido/listo"}},
{path:"pedido/entregar",canActivate:[operacionCocinaGuard],canDeactivate:[cocinaPendingGuard],pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/operacion/pedido/entregar"}},
{path:"pedido/editar",canDeactivate:[pedidoManagementPendingGuard],runGuardsAndResolvers:'paramsOrQueryParamsChange',pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/operacion/pedido/editar"}},
{path:"pedido/cancelar",canDeactivate:[pedidoManagementPendingGuard],runGuardsAndResolvers:'paramsOrQueryParamsChange',pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/operacion/pedido/cancelar"}},
{path:"pagos",pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/operacion/pagos"}},
{path:"pago/registrar",pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/operacion/pago/registrar"}},
{path:"reservas",canActivate:[operacionCocinaGuard],canDeactivate:[agendaPendingGuard],runGuardsAndResolvers:'paramsOrQueryParamsChange',pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/operacion/reservas"}},
{path:"mesas",canActivate:[operacionCocinaGuard],canDeactivate:[mesasPendingGuard],runGuardsAndResolvers:'paramsOrQueryParamsChange',pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/operacion/mesas"}},
{path:"mesas/lista",canActivate:[operacionCocinaGuard],canDeactivate:[mesasPendingGuard],runGuardsAndResolvers:'paramsOrQueryParamsChange',pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/operacion/mesas/lista"}},
{path:"mesa/nueva",canActivate:[operacionCocinaGuard],canDeactivate:[mesasPendingGuard],runGuardsAndResolvers:'paramsOrQueryParamsChange',pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/operacion/mesa/nueva"}},
{path:"mesa/editar",canActivate:[operacionCocinaGuard],canDeactivate:[mesasPendingGuard],runGuardsAndResolvers:'paramsOrQueryParamsChange',pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/operacion/mesa/editar"}},
{path:"mesa/desactivar",canActivate:[operacionCocinaGuard],canDeactivate:[mesasPendingGuard],runGuardsAndResolvers:'paramsOrQueryParamsChange',pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/operacion/mesa/desactivar"}},
{path:"reserva/nueva",pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/operacion/reserva/nueva"}},
{path:"reserva",canActivate:[operacionCocinaGuard,reservaAtencionGuard,reservaConsultaGuard],canDeactivate:[reservaPendingGuard,agendaPendingGuard],runGuardsAndResolvers:'paramsOrQueryParamsChange',pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/operacion/reserva"}},
{path:"reserva/rechazar",pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/operacion/reserva/rechazar"}},
{path:"reserva/llegada",canActivate:[reservaAtencionGuard],canDeactivate:[reservaPendingGuard],runGuardsAndResolvers:'paramsOrQueryParamsChange',pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/operacion/reserva/llegada"}},
{path:"reserva/atendiendo",canActivate:[reservaAtencionGuard],canDeactivate:[reservaPendingGuard],runGuardsAndResolvers:'paramsOrQueryParamsChange',pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/operacion/reserva/atendiendo"}},
{path:"reserva/editar",canActivate:[operacionCocinaGuard],canDeactivate:[agendaPendingGuard],runGuardsAndResolvers:'paramsOrQueryParamsChange',pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/operacion/reserva/editar"}},
{path:"reserva/cancelar",canActivate:[operacionCocinaGuard],canDeactivate:[agendaPendingGuard],runGuardsAndResolvers:'paramsOrQueryParamsChange',pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/operacion/reserva/cancelar"}},
{path:"reportes",canActivate:[operacionCocinaGuard],runGuardsAndResolvers:'paramsOrQueryParamsChange',pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/operacion/reportes"}},
{path:"reportes/pagos",canActivate:[operacionCocinaGuard],runGuardsAndResolvers:'paramsOrQueryParamsChange',pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/operacion/reportes/pagos"}},
{path:"atencion",canActivate:[operacionCocinaGuard],canDeactivate:[atencionPendingGuard],pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/operacion/atencion"}},
{path:"atencion/confirmar",canActivate:[operacionCocinaGuard],canDeactivate:[atencionPendingGuard],pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/operacion/atencion/confirmar"}},
{path:"notificaciones",pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/operacion/notificaciones"}},
{path:"asistente",pathMatch:'full',loadComponent:()=>import('../../screen-host').then(m=>m.ScreenHost),data:{base:"/operacion/asistente"}}
];

export const ROUTES:Routes=[{path:'',component:AdminLayout,canActivateChild:[sessionGuard],children}];
