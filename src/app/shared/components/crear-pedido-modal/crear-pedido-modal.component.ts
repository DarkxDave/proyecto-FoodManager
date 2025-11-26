import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormBuilder, Validators } from '@angular/forms';
import { OrdenesService } from 'src/app/shared/services/ordenes.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-crear-pedido-modal',
  templateUrl: './crear-pedido-modal.component.html',
  styleUrls: ['./crear-pedido-modal.component.scss'],
  standalone: false,
})
export class CrearPedidoModalComponent {
  cargando = false;
  error: string | null = null;
  okMsg: string | null = null;

  form = this.fb.group({
    id_proveedor: [null as number | null, [Validators.required]],
    codigo: [null as string | null],
    subtotal: [0, [Validators.required, Validators.min(0)]],
    impuestos: [0, [Validators.required, Validators.min(0)]],
    total: [0, [Validators.required, Validators.min(0)]],
  });

  proveedores: { id_proveedor: number; nombre: string }[] = [];

  constructor(private modal: ModalController, private fb: FormBuilder, private ordenes: OrdenesService, private http: HttpClient) {
    this.cargarProveedores();
  }

  cargarProveedores() {
    const url = environment.apiBaseUrl + '/api/proveedores/list';
    this.http.get<{ id_proveedor: number; nombre: string }[]>(url)
      .subscribe({
        next: d => this.proveedores = d,
        error: _ => this.proveedores = []
      });
  }

  cerrar() { this.modal.dismiss(); }

  guardar() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.cargando = true; this.error = null; this.okMsg = null;
    const dto = this.form.getRawValue();
    this.ordenes.crearBorrador({
      id_proveedor: dto.id_proveedor!,
      codigo: dto.codigo || null,
      subtotal: dto.subtotal!,
      impuestos: dto.impuestos!,
      total: dto.total!,
    }).subscribe({
      next: (resp) => { this.okMsg = 'Pedido creado'; this.cargando = false; this.modal.dismiss({ creado: true, id_oc: resp.id_oc }); },
      error: (err) => { this.error = err?.error?.mensaje || 'Error al crear pedido'; this.cargando = false; }
    });
  }
}
