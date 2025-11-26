import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { CustomInputComponent } from './components/custom-input/custom-input.component';
import { LogoComponent } from './components/logo/logo.component';
import { IonicModule } from '@ionic/angular';
import { AdminSidebarComponent } from './components/admin-sidebar/admin-sidebar.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertasStockModalComponent } from './components/alertas-stock-modal/alertas-stock-modal.component';
import { CrearPedidoModalComponent } from './components/crear-pedido-modal/crear-pedido-modal.component';



@NgModule({
  declarations: [
   HeaderComponent,
   CustomInputComponent,
  LogoComponent,
  AdminSidebarComponent,
  AlertasStockModalComponent 
  ,CrearPedidoModalComponent
  ],
  exports: [
   HeaderComponent,
   CustomInputComponent,
  LogoComponent,
  AdminSidebarComponent,   
   ReactiveFormsModule
  ],
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class SharedModule { }
