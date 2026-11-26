import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MesaPlano} from '../../pages/cliente/reserva-ui/reserva.model';

export interface ZonaConfig {
  readonly id: 'Terraza' | 'Salón Principal' | 'Ventanal' | 'Zona VIP';
  readonly nombre: string;
  readonly subtitulo: string;
  readonly icono: string;
  readonly accentClass: string;
}

/**
 * Componente transversal y reutilizable para el plano interactivo de mesas.
 * Asignado a Cristian Condori (S2-TSK-001).
 * Utilizado en disponibilidad del cliente y vista de salón.
 */
@Component({
  selector: 'rp-floor-plan',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule],
  templateUrl: './floor-plan.html',
  styleUrl: './floor-plan.css'
})
export class FloorPlan {
  @Input() mesas: readonly MesaPlano[] = [];
  @Input() mesaSeleccionadaId: number | null | undefined = null;
  @Input() comensalesMinimos: number = 1;
  @Input() soloLectura: boolean = false;

  @Output() readonly mesaSeleccionada = new EventEmitter<MesaPlano>();

  readonly zonas: readonly ZonaConfig[] = [
    {
      id: 'Terraza',
      nombre: 'Terraza al Aire Libre',
      subtitulo: 'Exterior fresco con sombrillas y luz natural',
      icono: 'deck',
      accentClass: 'zone-terraza'
    },
    {
      id: 'Salón Principal',
      nombre: 'Salón Central',
      subtitulo: 'Ambiente climatizado en el corazón del local',
      icono: 'restaurant',
      accentClass: 'zone-salon'
    },
    {
      id: 'Ventanal',
      nombre: 'Ventanal Panorámico',
      subtitulo: 'Vista a la avenida y amplios ventanales',
      icono: 'window',
      accentClass: 'zone-ventanal'
    },
    {
      id: 'Zona VIP',
      nombre: 'Espacio VIP Privado',
      subtitulo: 'Lounge reservado para grupos o celebraciones',
      icono: 'workspace_premium',
      accentClass: 'zone-vip'
    }
  ];

  mesasPorZona(zonaId: string): MesaPlano[] {
    return this.mesas.filter(m => m.zona === zonaId);
  }

  conteoLibres(zonaId: string): number {
    return this.mesas.filter(m => m.zona === zonaId && m.disponible).length;
  }

  onSeleccionarMesa(mesa: MesaPlano): void {
    if (this.soloLectura || !mesa.disponible) return;
    this.mesaSeleccionada.emit(mesa);
  }

  esMesaInsuficiente(mesa: MesaPlano): boolean {
    return this.comensalesMinimos > 0 && mesa.capacidad < this.comensalesMinimos;
  }

  obtenerClaseForma(capacidad: number): string {
    if (capacidad <= 2) return 'shape-round';
    if (capacidad <= 4) return 'shape-square';
    return 'shape-rect';
  }

  obtenerPuntosSillas(capacidad: number): number[] {
    const cant = Math.min(Math.max(capacidad, 1), 8);
    return Array.from({length: cant}, (_, i) => i);
  }
}
