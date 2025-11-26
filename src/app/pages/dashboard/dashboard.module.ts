import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardPage } from './dashboard.page';
import { BodegasPage } from './bodegas.page';
import { GondolasPage } from './gondolas.page';
import { PedidosPage } from './pedidos/pedidos.page';
import { UsuariosPage } from './usuarios.page';
import { AlmacenDashboardComponent } from './almacen-dashboard.component';
import { ProductosPage } from './productos/productos.page';
import { SharedModule } from 'src/app/shared/shared-module';

@NgModule({
  declarations: [DashboardPage, BodegasPage, GondolasPage, PedidosPage, UsuariosPage, AlmacenDashboardComponent, ProductosPage],
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule, SharedModule, DashboardRoutingModule]
})
export class DashboardPageModule {}
