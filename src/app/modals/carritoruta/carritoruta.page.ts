import { Component, OnInit, Input } from '@angular/core';
import { ModalController, LoadingController } from '@ionic/angular';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-carritoruta',
  templateUrl: './carritoruta.page.html',
  styleUrls: ['./carritoruta.page.scss'],
})
export class CarritorutaPage implements OnInit {
  @Input() public dataPedido:any;
  @Input() public DeliveryPrecio: any;
  @Input() public ProductosPrecio: any;
  @Input() public Cambio: any;

  //public detallePedido:DetallepedidoInterface[]=[];
  constructor(public modalController:ModalController,
    public dataService:DataService,public loadingController:LoadingController) { }

  ngOnInit() {
    
  }

  async ionViewWillEnter() {
    /*
    try {
      this.loaderToShow = await this.loadingController.create({
        message: 'Cargando mi compra...',
        spinner: 'dots',
        mode:"ios",
        backdropDismiss: false,
      });
      this.loaderToShow.present();
      let respuesta = await this.dataService.traerDetallePedido(this.dataPedido.idpedido).toPromise();
      if(respuesta['success']==false){
        this.estadoObtener=false;
        console.log("no hay detalle pedido");
        this.loaderToShow.dismiss();
      }else{
        this.estadoObtener=false;
        this.detallePedido = respuesta;
        this.empresasPedido = this.detallePedido.map(dp => dp.razon_social).filter((v, i, a) => a.indexOf(v) === i);
        this.loaderToShow.dismiss();
        
      }
      
    } catch (error) {
      this.estadoObtener=true;
      this.loaderToShow.dismiss();
      console.log(error);
    }*/
  }
  async closeModal() {
    await this.modalController.dismiss();
  }
}
