import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ProductosService, AlertaStock } from 'src/app/shared/services/productos.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-alertas-stock-modal',
  templateUrl: './alertas-stock-modal.component.html',
  styleUrls: ['./alertas-stock-modal.component.scss'],
  standalone: false,
})
export class AlertasStockModalComponent implements OnInit {
  cargando = false;
  error: string | null = null;
  alertas: AlertaStock[] = [];

  constructor(
    private modalCtrl: ModalController,
    private productosSvc: ProductosService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarAlertas();
  }

  cargarAlertas(): void {
    this.cargando = true;
    this.error = null;
    this.productosSvc.alertas().subscribe({
      next: (data) => {
        // Ordenar por menor stock_actual primero
        this.alertas = [...data].sort((a, b) => a.stock_actual - b.stock_actual);
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar las alertas';
        this.cargando = false;
      },
    });
  }

  cerrar(): void {
    this.modalCtrl.dismiss();
  }

  verTodas(): void {
    this.modalCtrl.dismiss();
    this.router.navigateByUrl('/dashboard/alertas');
  }
}
