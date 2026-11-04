import {Injectable, computed, signal} from '@angular/core';
import {EstadoReserva, MesaPlano, ReservaDraft, ReservaItem} from './reserva.model';

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
  readonly mesas = signal<MesaPlano[]>(MESAS_INICIALES);
  readonly reservas = signal<ReservaItem[]>(RESERVAS_MUESTRA);

  readonly draft = signal<ReservaDraft>({
    fecha: '2026-11-04',
    horaInicio: '13:30',
    horaFin: '15:00',
    comensales: 4,
    mesaId: 4,
    mesaNumero: 'Mesa 04',
    zona: 'Salón Principal',
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
    this.draft.update(d => ({ ...d, ...criteria }));
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

  obtenerReservaPorId(id: number): ReservaItem | undefined {
    return this.reservas().find(r => r.id === id);
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
}
