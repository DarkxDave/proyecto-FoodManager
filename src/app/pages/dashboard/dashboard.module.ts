import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardPage } from './dashboard.page';
import { BodegasPage } from './bodegas.page';
import { GondolasPage } from './gondolas.page';
import { PedidosPage } from './pedidos.page';
import { UsuariosPage } from './usuarios.page';
import { SharedModule } from 'src/app/shared/shared-module';

@NgModule({
  declarations: [DashboardPage, BodegasPage, GondolasPage, PedidosPage, UsuariosPage],
  imports: [CommonModule, IonicModule, SharedModule, DashboardRoutingModule]
})
export class DashboardPageModule {}
