import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MesaPlano} from '../../pages/cliente/reserva-ui/reserva.model';

/**
 * Componente transversal y reutilizable para el plano interactivo del salón.
 * Responsable: Cristian Condori (S2-TSK-001).
 * Implementa la distribución estándar común solicitada (US05, US06):
 * - Salón principal unificado
 * - Ventana con vista al jardín (superior)
 * - Cuadrícula simétrica de 3 columnas de mesas
 * - Puesto de recepción y entrada principal (inferior)
 * - Estados visuales: Disponible (verde), No disponible (gris), Seleccionada (azul marino)
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
  @Input() fecha: string = '';
  @Input() horario: string = '';

  @Output() readonly mesaSeleccionada = new EventEmitter<MesaPlano>();

  readonly windowPanes = Array.from({length: 16}, (_, i) => i);

  get mesasOrdenadas(): MesaPlano[] {
    return [...this.mesas].sort((a, b) => {
      const numA = parseInt(a.numero.replace(/\D/g, ''), 10) || a.id;
      const numB = parseInt(b.numero.replace(/\D/g, ''), 10) || b.id;
      return numA - numB;
    });
  }

  get fechaFormateada(): string {
    if (!this.fecha) return '';
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'dic'];
    const partes = this.fecha.split('-');
    if (partes.length === 3) {
      const dia = parseInt(partes[2], 10);
      const mesIdx = parseInt(partes[1], 10) - 1;
      if (mesIdx >= 0 && mesIdx < 12) {
        return `${dia} ${meses[mesIdx]}`;
      }
    }
    return this.fecha;
  }

  get headerSubtitle(): string {
    const parts: string[] = [];
    if (this.fechaFormateada) parts.push(this.fechaFormateada);
    if (this.horario) parts.push(this.horario);
    return parts.length > 0 ? parts.join(' · ') : 'Disponibilidad en tiempo real';
  }

  obtenerNumeroDosDigitos(numero: string): string {
    const digits = numero.replace(/\D/g, '');
    if (!digits) return numero;
    return digits.padStart(2, '0');
  }

  onSeleccionarMesa(mesa: MesaPlano): void {
    if (this.soloLectura || !mesa.disponible) return;
    this.mesaSeleccionada.emit(mesa);
  }

  esMesaInsuficiente(mesa: MesaPlano): boolean {
    return this.comensalesMinimos > 0 && mesa.capacidad < this.comensalesMinimos;
  }
}
