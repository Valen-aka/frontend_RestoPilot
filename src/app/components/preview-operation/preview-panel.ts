import {Component, Input} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {PreviewOperation, PreviewResult} from './preview-operation';

@Component({selector: 'rp-preview-panel', imports: [MatButtonModule, MatSelectModule, MatFormFieldModule, MatProgressBarModule], templateUrl: './preview-panel.html', styleUrl: './preview-panel.css'})
export class PreviewPanel {
  @Input({required: true}) operation!: PreviewOperation;
  @Input() outcomes: PreviewResult[] = ['success', 'error'];
  @Input() successText = 'Vista previa del resultado satisfactorio. No se guardaron datos.';
  readonly labels: Record<PreviewResult, string> = {success: 'Resultado satisfactorio', error: 'Error y recuperación', duplicate: 'Correo duplicado', forbidden: 'Sin permisos', empty: 'Sin resultados', expired: 'Sesión expirada'};
}
