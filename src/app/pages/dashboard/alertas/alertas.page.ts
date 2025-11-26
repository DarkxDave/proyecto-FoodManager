import { Component, OnInit } from '@angular/core';
import { ProductosService, AlertaStock } from 'src/app/shared/services/productos.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-alertas',
  templateUrl: './alertas.page.html',
  styleUrls: ['./alertas.page.scss'],
  standalone: false
})
export class AlertasPage implements OnInit {
  cargando = false;
  error: string | null = null;
  alertas: AlertaStock[] = [];

  constructor(private svc: ProductosService, private router: Router) {}

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando = true;
    this.error = null;
    this.svc.alertas().subscribe({
      next: data => { this.alertas = data; this.cargando = false; },
      error: e => { this.error = e?.error?.mensaje || 'Error al cargar alertas'; this.cargando = false; }
    });
  }

  verProducto(id: number) {
    this.router.navigate(['/dashboard/productos', id]);
  }

  trackById(_i: number, a: AlertaStock) { return a.id_producto; }
}
