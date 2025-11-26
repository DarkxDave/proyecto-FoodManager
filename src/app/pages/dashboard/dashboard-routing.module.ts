import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardPage } from './dashboard.page';
import { BodegasPage } from './bodegas.page';
import { GondolasPage } from './gondolas.page';
import { PedidosPage } from './pedidos/pedidos.page';
import { UsuariosPage } from './usuarios.page';
import { ProductosPage } from './productos/productos.page';
import { AlmacenDashboardComponent } from './almacen-dashboard.component';
import { AuthGuard } from 'src/app/shared/guards/auth.guard';

const routes: Routes = [
  { path: '', component: DashboardPage, canActivate: [AuthGuard] },
  { path: 'bodegas', component: BodegasPage, canActivate: [AuthGuard] },
  { path: 'bodegas/:id', component: AlmacenDashboardComponent, canActivate: [AuthGuard] },
  { path: 'gondolas', component: GondolasPage, canActivate: [AuthGuard] },
  { path: 'pedidos', component: PedidosPage, canActivate: [AuthGuard] },
  { path: 'usuarios', component: UsuariosPage, canActivate: [AuthGuard] },
  { path: 'productos', component: ProductosPage, canActivate: [AuthGuard] },
  { path: 'alertas', loadChildren: () => import('./alertas/alertas.module').then(m => m.AlertasPageModule), canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {}
