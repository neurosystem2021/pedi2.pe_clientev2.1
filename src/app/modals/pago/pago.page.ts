import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { IonInput,AlertController, ModalController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-pago',
  templateUrl: './pago.page.html',
  styleUrls: ['./pago.page.scss'],
})
export class PagoPage implements OnInit {
  @Input() PrecioProductos: any;
  @Input() PrecioDelivery: any;
  contenidoA: boolean = false;
  contenidoB: boolean = false;
  contenidoC: boolean = false;
  contenidoD: boolean = false;
  subcontenido: boolean = false;
  valor: number = 0;
  valor2: number = 0;
  monto:any = null;
  cambio:number = 0;

  @ViewChild('input',{static:false}) myInput: any ;
  constructor(public alertController: AlertController,
    public modalController: ModalController,
    public toastController:ToastController) { }

  ngOnInit() {
  }

  radioGroupChange(event: any) {
    if(event.detail.value=="radio_1"){
      this.contenidoA = true;
      this.contenidoD = false;
      this.contenidoB = false;
      this.contenidoC = false;
      this.valor = 1;
      this.valor2 = 0;
      this.monto = null;
      this.subcontenido = false;
    } else if(event.detail.value=="radio_2"){
      this.contenidoB = true;
      this.contenidoA = false;
      this.contenidoC = false;
      this.contenidoD = false;
      this.valor = 2;
      this.valor2 = 0;
      this.monto = null;
      this.subcontenido = false;
    }else if(event.detail.value=="radio_3"){
      this.contenidoC = true;
      this.contenidoA = false;
      this.contenidoB = false;
      this.contenidoD = false;
      this.valor = 3;
      this.valor2 = 0;
      this.monto = null;
      this.subcontenido = false;
    }else if(event.detail.value=="radio_4"){
      this.contenidoD = true;
      this.contenidoC = false;
      this.contenidoA = false;
      this.contenidoB = false;
      this.valor = 4;
      this.valor2 = 0;
      this.monto = null;
      this.subcontenido = false;
    }
    //console.log("Valor: "+this.valor);
  }

  async closeModal() {
    await this.modalController.dismiss(null);
  }

  radioGroupTwoChange(event: any){
    if(event.detail.value=="subradio_2"){
      this.subcontenido = true;
      this.valor2 = 2;
      this.monto = null;
      setTimeout(() => {
        this.myInput.setFocus();
      },150);
    } else{
      this.subcontenido = false;
      this.valor2 = 1;
      this.monto = null;
    }
    //console.log("Valor dos: "+this.valor2)
  }

  async aceptarMetodoPago(){
    if(this.valor==0){
      this.presentAlert();
      return;
    }
    if(this.valor==4 && this.valor2==0){
      console.log("seleccione un metodo");
      return;
    }

    if(this.valor2==2 && (this.monto==null || this.monto==0 )){
      console.log("ingrese monto");
      return;
    }
    let metodoPago=null;
    switch (this.valor) {
      case 1:
        metodoPago="Pago con Yape";
        this.cambio = 0;
        break;
      case 2:
        metodoPago="Pago con Plin";
        this.cambio = 0;
        break;
      case 3:
        metodoPago="Pago con Tarjeta";
        this.cambio = 0;
        break;

      case 4:
          if(this.valor2==1){
            metodoPago = "Efectivo (exacto)";
            this.cambio = (parseFloat(this.PrecioDelivery) + parseFloat(this.PrecioProductos));
          }else if(this.valor2==2){
            metodoPago = "Efectivo (cambio para S/ "+this.monto+")";
            this.cambio = this.monto;
            if(this.monto<=(parseFloat(this.PrecioDelivery) + parseFloat(this.PrecioProductos))){
              await this.mostrarMensajeTop("El cambio debe ser mayor al monto de pago, sino seleccione pago exacto",2500,"danger");
              return;
            }
          }
        break;
    
      default:
        break;
    }
    await this.modalController.dismiss({texto:metodoPago,idPago:this.valor,cambio:this.cambio});
    this.mostrarMensajeTop("Metodo de pago actualizado...",2000,"success");
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Alerta',
      message: 'Selecione un método de pago.',
      buttons: ['OK']
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }

  async mostrarMensajeTop(mensaje:string,duracion:number,color:string){
    const toast = await this.toastController.create({
      message: ' '+mensaje+'  ',
      duration: duracion,
      position: 'top',
      mode: "ios",
      color: color,
      buttons: [
        {
          icon: "close",
          role: 'cancel',
          handler: () => {
            // console.log('Cancel clicked');
          }
        }
      ]
    });
    await toast.present();
  }
}
