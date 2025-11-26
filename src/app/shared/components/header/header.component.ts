import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AlertasStockModalComponent } from '../alertas-stock-modal/alertas-stock-modal.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone:false,
})
export class HeaderComponent  implements OnInit {


  @Input() title!: String;
  @Input() alertCount: number | null = null;
  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {}

  async openAlertasModal() {
    const modal = await this.modalCtrl.create({
      component: AlertasStockModalComponent,
      breakpoints: [0, 0.5, 0.9],
      initialBreakpoint: 0.9,
    });
    await modal.present();
  }

}
