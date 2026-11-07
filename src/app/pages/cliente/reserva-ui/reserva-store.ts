import {Injectable, computed, inject, signal} from '@angular/core';
import {catchError, map, Observable, of} from 'rxjs';
import {EstadoReserva, MesaPlano, ReservaDraft, ReservaItem} from './reserva.model';
import {MesaDisponible} from '../../../core/models/reserva-query.model';
import {ReservaResponse} from '../../../core/models/reserva-api.model';
import {ReservaService} from '../../../core/services/reserva.service';

function inferirZona(numero: number, coordX?: number): 'Terraza' | 'Salón Principal' | 'Ventanal' | 'Zona VIP' {
  if (coordX !== undefined && coordX !== null) {
    if (coordX <= 30) return 'Terraza';
    if (coordX <= 60) return 'Salón Principal';
    if (coordX <= 80) return 'Ventanal';
    return 'Zona VIP';
  }
  if (numero <= 2) return 'Terraza';
  if (numero <= 5) return 'Salón Principal';
  if (numero <= 7) return 'Ventanal';
  return 'Zona VIP';
}

import {getFechaLima} from './reserva-date.util';

const MESAS_INICIALES: MesaPlano[] = [
  { id: 1, numero: 'Mesa 01', capacidad: 2, zona: 'Terraza', disponible: true, x: 10, y: 15 },
  { id: 2, numero: 'Mesa 02', capacidad: 2, zona: 'Terraza', disponible: true, x: 30, y: 15 },
  { id: 3, numero: 'Mesa 03', capacidad: 4, zona: 'Salón Principal', disponible: false, motivoNoDisponible: 'Ocupada en este turno', x: 55, y: 15 },
  { id: 4, numero: 'Mesa 04', capacidad: 4, zona: 'Salón Principal', disponible: true, x: 80, y: 15 },
  { id: 5, numero: 'Mesa 05', capacidad: 4, zona: 'Ventanal', disponible: true, x: 10, y: 55 },
  { id: 6, numero: 'Mesa 06', capacidad: 6, zona: 'Ventanal', disponible: false, motivoNoDisponible: 'Reserva confirmada', x: 40, y: 55 },
  { id: 7, numero: 'Mesa 07', capacidad: 6, zona: 'Salón Principal', disponible: true, x: 65, y: 55 },
  { id: 8, numero: 'Mesa 08', capacidad: 8, zona: 'Zona VIP', disponible: true, x: 90, y: 55 }
];

const RESERVAS_MUESTRA: ReservaItem[] = [
  {
    id: 201,
    codigo: 'RES-201',
    fecha: '2026-11-04',
    horaInicio: '13:30',
    horaFin: '15:00',
    comensales: 4,
    mesaId: 4,
    mesaNumero: 'Mesa 04',
    zona: 'Salón Principal',
    estado: 'PENDIENTE',
    solicitadaEn: '2026-11-03 18:30',
    notas: 'Celebración de cumpleaños familiar.',
    nombreCliente: 'Ana Pérez',
    telefonoCliente: '+51 987 654 321'
  },
  {
    id: 198,
    codigo: 'RES-198',
    fecha: '2026-11-05',
    horaInicio: '20:00',
    horaFin: '21:30',
    comensales: 2,
    mesaId: 1,
    mesaNumero: 'Mesa 01',
    zona: 'Terraza',
    estado: 'CONFIRMADA',
    solicitadaEn: '2026-11-02 10:15',
    notas: 'Cena en pareja, preferencia mesa exterior.',
    nombreCliente: 'Ana Pérez',
    telefonoCliente: '+51 987 654 321'
  },
  {
    id: 192,
    codigo: 'RES-192',
    fecha: '2026-10-31',
    horaInicio: '21:00',
    horaFin: '22:30',
    comensales: 6,
    mesaId: 6,
    mesaNumero: 'Mesa 06',
    zona: 'Ventanal',
    estado: 'RECHAZADA',
    solicitadaEn: '2026-10-30 15:40',
    motivoRechazo: 'Capacidad máxima de cocina y salón alcanzada para el turno nocturno.',
    nombreCliente: 'Ana Pérez',
    telefonoCliente: '+51 987 654 321'
  },
  {
    id: 190,
    codigo: 'RES-190',
    fecha: '2026-10-24',
    horaInicio: '19:00',
    horaFin: '20:30',
    comensales: 4,
    mesaId: 4,
    mesaNumero: 'Mesa 04',
    zona: 'Salón Principal',
    estado: 'EXPIRADA',
    solicitadaEn: '2026-10-23 11:20',
    motivoRechazo: 'Superado el tiempo de tolerancia de 15 minutos sin registro de llegada.',
    nombreCliente: 'Ana Pérez',
    telefonoCliente: '+51 987 654 321'
  },
  {
    id: 185,
    codigo: 'RES-185',
    fecha: '2026-10-20',
    horaInicio: '14:00',
    horaFin: '15:30',
    comensales: 4,
    mesaId: 5,
    mesaNumero: 'Mesa 05',
    zona: 'Ventanal',
    estado: 'COMPLETADA',
    solicitadaEn: '2026-10-19 12:00',
    notas: 'Almuerzo de trabajo completado.',
    nombreCliente: 'Ana Pérez',
    telefonoCliente: '+51 987 654 321'
  },
  {
    id: 178,
    codigo: 'RES-178',
    fecha: '2026-10-15',
    horaInicio: '13:00',
    horaFin: '14:30',
    comensales: 2,
    mesaId: 2,
    mesaNumero: 'Mesa 02',
    zona: 'Terraza',
    estado: 'CANCELADA',
    solicitadaEn: '2026-10-14 09:10',
    motivoRechazo: 'Cancelada por el cliente con más de 24 horas de anticipación.',
    nombreCliente: 'Ana Pérez',
    telefonoCliente: '+51 987 654 321'
  }
];

@Injectable({ providedIn: 'root' })
export class ReservaStore {
  // El plano inicia sin mesas de muestra para mostrar únicamente la búsqueda vigente (US05 - 024)
  readonly mesas = signal<MesaPlano[]>([]);
  readonly busquedaVigente = signal<boolean>(false);
  readonly reservas = signal<ReservaItem[]>(RESERVAS_MUESTRA);

  // Inicializa sin mesa preseleccionada de muestra (US06 - 026)
  readonly draft = signal<ReservaDraft>({
    fecha: getFechaLima(),
    horaInicio: '13:30',
    horaFin: '15:00',
    comensales: 4,
    mesaId: undefined,
    mesaNumero: undefined,
    zona: undefined,
    notas: '',
    nombreCliente: 'Ana Pérez',
    emailCliente: 'ana.perez@ejemplo.com',
    telefonoCliente: '+51 987 654 321'
  });

  // Filtro activo en el listado
  readonly filtroEstado = signal<string>('TODAS');

  readonly mesaSeleccionada = computed(() => {
    const mesaId = this.draft().mesaId;
    if (!mesaId) return null;
    return this.mesas().find(m => m.id === mesaId) ?? null;
  });

  readonly mesasFiltradas = computed(() => {
    const minCap = this.draft().comensales;
    return this.mesas().filter(m => m.capacidad >= minCap);
  });

  readonly hayDisponibilidad = computed(() => {
    return this.mesasFiltradas().some(m => m.disponible);
  });

  // Reservas filtradas para la vista de cliente-reservas
  readonly reservasFiltradas = computed(() => {
    const filtro = this.filtroEstado();
    const list = this.reservas();
    if (filtro === 'TODAS') return list;
    return list.filter(r => r.estado === filtro);
  });

  setFiltro(filtro: string) {
    this.filtroEstado.set(filtro);
  }

  setSearchCriteria(criteria: Partial<ReservaDraft>) {
    this.draft.update(d => {
      const cambioParametros =
        (criteria.fecha !== undefined && criteria.fecha !== d.fecha) ||
        (criteria.horaInicio !== undefined && criteria.horaInicio !== d.horaInicio) ||
        (criteria.horaFin !== undefined && criteria.horaFin !== d.horaFin) ||
        (criteria.comensales !== undefined && criteria.comensales !== d.comensales) ||
        (criteria.restauranteId !== undefined && criteria.restauranteId !== d.restauranteId);

      if (cambioParametros) {
        // Al alterar los criterios de búsqueda, invalidamos la búsqueda anterior y limpiamos la mesa
        this.mesas.set([]);
        this.busquedaVigente.set(false);
        return {
          ...d,
          ...criteria,
          mesaId: undefined,
          mesaNumero: undefined,
          zona: undefined
        };
      }
      return { ...d, ...criteria };
    });
  }

  selectMesa(mesa: MesaPlano) {
    if (!mesa.disponible) return;
    this.draft.update(d => ({
      ...d,
      mesaId: mesa.id,
      mesaNumero: mesa.numero,
      zona: mesa.zona
    }));
  }

  actualizarMesasDesdeDisponibilidad(mesasDisponibles: readonly MesaDisponible[]) {
    const mapeadas: MesaPlano[] = mesasDisponibles.map(m => ({
      id: m.mesaId,
      numero: `Mesa ${String(m.numero).padStart(2, '0')}`,
      capacidad: m.capacidad,
      zona: inferirZona(m.numero, m.coordenadaX),
      disponible: m.disponible,
      motivoNoDisponible: m.disponible ? undefined : 'Ocupada en este horario',
      x: m.coordenadaX ?? ((m.numero * 18) % 85 + 5),
      y: m.coordenadaY ?? ((m.numero * 22) % 65 + 15)
    }));
    this.mesas.set(mapeadas);
    this.busquedaVigente.set(true);

    // Asegurar que si la mesa seleccionada previamente ya no está disponible, se deseleccione
    const currentMesaId = this.draft().mesaId;
    if (currentMesaId) {
      const match = mapeadas.find(m => m.id === currentMesaId);
      if (!match || !match.disponible) {
        this.draft.update(d => ({
          ...d,
          mesaId: undefined,
          mesaNumero: undefined,
          zona: undefined
        }));
      }
    }
  }

  incorporarReservaCreada(res: ReservaResponse): ReservaItem {
    const d = this.draft();
    const nueva: ReservaItem = {
      id: res.id,
      codigo: `RES-${res.id}`,
      restauranteId: res.restauranteId,
      fecha: res.fecha,
      horaInicio: res.horaInicio.length >= 5 ? res.horaInicio.slice(0, 5) : res.horaInicio,
      horaFin: res.horaFin.length >= 5 ? res.horaFin.slice(0, 5) : res.horaFin,
      comensales: res.numeroComensales,
      mesaId: res.mesaId,
      mesaNumero: `Mesa ${String(res.mesaNumero).padStart(2, '0')}`,
      zona: d.zona ?? 'Salón Principal',
      estado: res.estado,
      solicitadaEn: res.creadoEn ? res.creadoEn.replace('T', ' ').slice(0, 16) : new Date().toISOString().replace('T', ' ').slice(0, 16),
      notas: res.notas ?? '',
      nombreCliente: res.clienteNombre || d.nombreCliente || 'Cliente',
      telefonoCliente: d.telefonoCliente || ''
    };
    this.reservas.update(list => [nueva, ...list.filter(item => item.id !== nueva.id)]);
    return nueva;
  }

  confirmarReservaActual(): ReservaItem {
    const d = this.draft();
    const newId = Math.max(200, ...this.reservas().map(r => r.id)) + 1;
    const now = new Date();
    const nuevaReserva: ReservaItem = {
      id: newId,
      codigo: `RES-${newId}`,
      fecha: d.fecha,
      horaInicio: d.horaInicio,
      horaFin: d.horaFin,
      comensales: d.comensales,
      mesaId: d.mesaId ?? 4,
      mesaNumero: d.mesaNumero ?? 'Mesa 04',
      zona: d.zona ?? 'Salón Principal',
      estado: 'PENDIENTE',
      solicitadaEn: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      notas: d.notas,
      nombreCliente: d.nombreCliente,
      telefonoCliente: d.telefonoCliente
    };

    this.reservas.update(list => [nuevaReserva, ...list]);
    return nuevaReserva;
  }

  private readonly reservaService = inject(ReservaService);

  obtenerReservaPorId(id: number): ReservaItem | undefined {
    return this.reservas().find(r => r.id === id);
  }

  cargarReservaPorId(id: number): Observable<ReservaItem | null> {
    const local = this.obtenerReservaPorId(id);
    if (local) return of(local);
    return this.reservaService.obtener(id).pipe(
      map(res => this.incorporarReservaCreada(res)),
      catchError(() => of(null))
    );
  }

  cargarMisReservas(): Observable<ReservaItem[]> {
    return this.reservaService.propias().pipe(
      map(list => {
        const mapeadas = list.reservas.map(res => {
          const item: ReservaItem = {
            id: res.id,
            codigo: `RES-${res.id}`,
            restauranteId: res.restauranteId,
            fecha: res.fecha,
            horaInicio: res.horaInicio.length >= 5 ? res.horaInicio.slice(0, 5) : res.horaInicio,
            horaFin: res.horaFin.length >= 5 ? res.horaFin.slice(0, 5) : res.horaFin,
            comensales: res.numeroComensales,
            mesaId: res.mesaId,
            mesaNumero: `Mesa ${String(res.mesaNumero).padStart(2, '0')}`,
            zona: inferirZona(res.mesaNumero),
            estado: res.estado,
            solicitadaEn: res.creadoEn ? res.creadoEn.replace('T', ' ').slice(0, 16) : '',
            notas: res.notas ?? '',
            motivoRechazo: res.motivoRechazo ?? undefined,
            nombreCliente: res.clienteNombre,
            telefonoCliente: ''
          };
          return item;
        });
        if (mapeadas.length > 0) {
          this.reservas.set(mapeadas);
        }
        return mapeadas;
      }),
      catchError(() => of(this.reservas()))
    );
  }

  obtenerReservaActiva(preferId?: number): ReservaItem {
    if (preferId) {
      const encontrada = this.obtenerReservaPorId(preferId);
      if (encontrada) return encontrada;
    }
    return this.reservas()[0];
  }

  reprogramarReserva(id: number, fecha: string, horaInicio: string, horaFin: string, comensales: number, notas?: string): boolean {
    let actualizada = false;
    this.reservas.update(list =>
      list.map(r => {
        if (r.id === id) {
          actualizada = true;
          return {
            ...r,
            fecha,
            horaInicio,
            horaFin,
            comensales,
            notas: notas !== undefined ? notas : r.notas,
            estado: 'PENDIENTE' // Conforme SPEC.md: vuelve a Pendiente para nueva evaluación
          };
        }
        return r;
      })
    );
    return actualizada;
  }

  cancelarReserva(id: number, motivo?: string): boolean {
    let cancelada = false;
    this.reservas.update(list =>
      list.map(r => {
        if (r.id === id) {
          cancelada = true;
          return {
            ...r,
            estado: 'CANCELADA',
            motivoRechazo: motivo || 'Cancelada por el cliente.'
          };
        }
        return r;
      })
    );
    return cancelada;
  }

  actualizarEstado(id: number, nuevoEstado: EstadoReserva, motivo?: string): boolean {
    let ok = false;
    this.reservas.update(list =>
      list.map(r => {
        if (r.id === id) {
          ok = true;
          return {
            ...r,
            estado: nuevoEstado,
            motivoRechazo: motivo !== undefined ? motivo : r.motivoRechazo
          };
        }
        return r;
      })
    );
    return ok;
  }

  crearReservaOperativa(datos: {
    nombreCliente: string;
    telefonoCliente: string;
    fecha: string;
    horaInicio: string;
    horaFin: string;
    comensales: number;
    mesaId: number;
    mesaNumero: string;
    zona: string;
    notas?: string;
  }): ReservaItem {
    const newId = Math.max(200, ...this.reservas().map(r => r.id)) + 1;
    const now = new Date();
    const nueva: ReservaItem = {
      id: newId,
      codigo: `RES-${newId}`,
      fecha: datos.fecha,
      horaInicio: datos.horaInicio,
      horaFin: datos.horaFin,
      comensales: datos.comensales,
      mesaId: datos.mesaId,
      mesaNumero: datos.mesaNumero,
      zona: datos.zona,
      estado: 'PENDIENTE',
      solicitadaEn: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      notas: datos.notas || '',
      nombreCliente: datos.nombreCliente,
      telefonoCliente: datos.telefonoCliente
    };

    this.reservas.update(list => [nueva, ...list]);
    return nueva;
  }

  confirmarReservaOperativa(id: number): boolean {
    let confirmada = false;
    this.reservas.update(list =>
      list.map(r => {
        if (r.id === id) {
          confirmada = true;
          return { ...r, estado: 'CONFIRMADA' };
        }
        return r;
      })
    );
    return confirmada;
  }

  rechazarReservaOperativa(id: number, motivo: string): boolean {
    let rechazada = false;
    this.reservas.update(list =>
      list.map(r => {
        if (r.id === id) {
          rechazada = true;
          return {
            ...r,
            estado: 'RECHAZADA',
            motivoRechazo: motivo
          };
        }
        return r;
      })
    );
    return rechazada;
  }
}
