import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController, LoadingController, ToastController } from '@ionic/angular';
import { DataService } from 'src/app/services/data.service';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-hablanos',
  templateUrl: './hablanos.page.html',
  styleUrls: ['./hablanos.page.scss'],
})
export class HablanosPage implements OnInit {
  loaderToShow: any;
  public opc: string = "1";
  public correo: string = "";
  public mensaje: string = "";
  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    public dataService: DataService,
    public storage: Storage,
    public loadingController: LoadingController,
    public toastController: ToastController
  ) { }

  ngOnInit() {

  }
  ionViewWillEnter() {

  }
  async closeModal() {
    await this.modalController.dismiss();
  }
  radioGroupChange(event: any) {
    this.opc = event.detail.value;
  }

  async onEnviar() {
    if ((this.mensaje + "").trim().length != 0) {
      this.loaderToShow = await this.loadingController.create({
        message: 'Enviado mensaje...',
        spinner: 'bubbles',
        backdropDismiss: false,
        mode:'ios'
      });
      this.loaderToShow.present();

      let cliente = await this.storage.get('cliente');
      if(cliente === null){
        this.loaderToShow.dismiss();
        return;
      }
        try {
          let respuesta = await this.dataService.postHablanos(cliente.IdCliente, this.correo,this.opc, this.mensaje);
          if (respuesta.data.success == true) {
            this.loaderToShow.dismiss();
            const alert = await this.alertController.create({
              header: '¡Mensaje enviado!',
              message: "Gracias por contactarnos! Nos con comunicaremos con usted lo más pronto posible!.",
              mode: "ios",
              buttons: [
                {
                  cssClass: 'primarybtn', 
                  text: 'Entiendo',
                  handler: () => {

                  }
                }
              ]
            });
            this.modalController.dismiss();
            await alert.present();
          }else{
            this.loaderToShow.dismiss();
          }
        } catch (error) {
          this.loaderToShow.dismiss();
          const toast = await this.toastController.create({
            message: "Error no se envió el mensaje porfavor intente más tarde.",
            duration: 2000,
            position: 'bottom',
            mode:'ios',
            color:'danger'
          });
          await toast.present();
        }

    } else {
      const toast = await this.toastController.create({
        message: "El mensaje no debe estar vacio, por favor rellenelo.",
        duration: 2000,
        position: 'bottom',
        mode:'ios',
        color:'warning'
      });
      await toast.present();
    }



  }

  async ionViewWillLeave() {
    try {
      const element = await this.loadingController.getTop();
      if (element) {
        this.loadingController.dismiss();
      }

    } catch (error) {

    }
  }

}
