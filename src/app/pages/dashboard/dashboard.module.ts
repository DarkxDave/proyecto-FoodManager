import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardPage } from './dashboard.page';
import { SharedModule } from 'src/app/shared/shared-module';

@NgModule({
  declarations: [DashboardPage],
  imports: [CommonModule, IonicModule, SharedModule, DashboardRoutingModule]
})
export class DashboardPageModule {}
