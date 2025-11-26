import { Component, OnInit } from '@angular/core';
import { OrdenesService, OrdenResumen } from 'src/app/shared/services/ordenes.service';
import { ModalController } from '@ionic/angular';
import { CrearPedidoModalComponent } from 'src/app/shared/components/crear-pedido-modal/crear-pedido-modal.component';

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.page.html',
  styleUrls: ['./pedidos.page.scss'],
  standalone: false
})
export class PedidosPage implements OnInit {
  pendientes: OrdenResumen[] = [];
  borrador: OrdenResumen[] = [];
  cargandoPend = false;
  cargandoBorr = false;

  constructor(private ordenes: OrdenesService, private modalCtrl: ModalController) {}

  ngOnInit(): void {
    this.cargarPendientes();
    this.cargarBorrador();
  }

  cargarPendientes(): void {
    this.cargandoPend = true;
    this.ordenes.listarPendientes().subscribe({
      next: d => { this.pendientes = d; this.cargandoPend = false; },
      error: _ => { this.cargandoPend = false; }
    });
  }

  cargarBorrador(): void {
    this.cargandoBorr = true;
    this.ordenes.listarBorrador().subscribe({
      next: d => { this.borrador = d; this.cargandoBorr = false; },
      error: _ => { this.cargandoBorr = false; }
    });
  }

  async abrirCrear() {
    const modal = await this.modalCtrl.create({
      component: CrearPedidoModalComponent,
      breakpoints: [0, 0.6, 0.9],
      initialBreakpoint: 0.9,
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data?.creado) {
      this.cargarBorrador();
    }
  }
}
