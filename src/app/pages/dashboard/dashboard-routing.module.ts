import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardPage } from './dashboard.page';
import { BodegasPage } from './bodegas.page';
import { GondolasPage } from './gondolas.page';
import { PedidosPage } from './pedidos.page';
import { UsuariosPage } from './usuarios.page';
import { AuthGuard } from 'src/app/shared/guards/auth.guard';

const routes: Routes = [
  { path: '', component: DashboardPage, canActivate: [AuthGuard] },
  { path: 'bodegas', component: BodegasPage, canActivate: [AuthGuard] },
  { path: 'gondolas', component: GondolasPage, canActivate: [AuthGuard] },
  { path: 'pedidos', component: PedidosPage, canActivate: [AuthGuard] },
  { path: 'usuarios', component: UsuariosPage, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {}
