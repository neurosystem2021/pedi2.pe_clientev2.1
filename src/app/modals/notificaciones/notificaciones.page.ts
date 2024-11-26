import { Component, OnInit } from '@angular/core';
import { ModalController, LoadingController, AlertController, ToastController } from '@ionic/angular';
import { DataService } from 'src/app/services/data.service';
import { Storage } from '@ionic/storage';
import { HerramientasService } from 'src/app/services/herramientas.service';
import * as moment from 'moment';

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.page.html',
  styleUrls: ['./notificaciones.page.scss'],
})
export class NotificacionesPage implements OnInit {
  loaderToShow: any;
  public existeNotificaciones: boolean = false;
  public notificaciones: any[] = [];
  constructor(private modalController: ModalController,
    public dataService: DataService,
    private storage: Storage,
    public loadingController: LoadingController,
    public alertController: AlertController,
    public herramientasService: HerramientasService,
    public toastController: ToastController
  ) { }

  ngOnInit() {
  }
  ionViewWillEnter() {
    this.cargarNotificaciones();
  }

  async cargarNotificaciones(){
    this.notificaciones = [];
    this.loaderToShow = await this.loadingController.create({
      message: 'Cargando notificaciones...',
      spinner: 'circular',
      backdropDismiss: false,
      mode: "ios",
    });
    this.loaderToShow.present();
    let cliente = await this.storage.get('cliente');
    if(cliente !== null){
      try {
        
        let respuestaNotificaciones = await this.dataService.getNotificaciones(cliente.IdCliente);
        if (respuestaNotificaciones.data.success == true) {
          this.existeNotificaciones = false;
          this.notificaciones = respuestaNotificaciones.data.data; 
        } else {
          this.notificaciones = [];
          this.existeNotificaciones = true;
        }

        if (this.herramientasService.obtenerNotificaciones() != 0) {
          let respuestaNotificaciones = await this.dataService.postNotificacionesActualizar(cliente.IdCliente);
          if(respuestaNotificaciones.data.success==true){
            this.herramientasService.setNotificaciones(0);
          }

        }

        this.loaderToShow.dismiss();

      } catch (error) {
        this.existeNotificaciones = false;
        this.notificaciones = [];
        this.loaderToShow.dismiss();
      }
    }
  }

  obtenerFecha(fecha: string) {
    const hoy = moment();
    moment.locale('es');
    const ayer = hoy.clone().subtract(1, 'days');
    const anteayer = hoy.clone().subtract(2, 'days');
    const hoyformateado = hoy.format('YYYY-MM-DD');
    const ayerformateado = ayer.format('YYYY-MM-DD');
    const anteayerformateado = anteayer.format('YYYY-MM-DD');
    if (hoyformateado == fecha.substring(0, 10)) {
      return "Hoy";
    } else if (ayerformateado == fecha.substring(0, 10)) {
      return "Ayer";
    } else if (anteayerformateado == fecha.substring(0, 10)) {
      return "Anteayer";
    } else {
      return moment(fecha).format('DD MMMM');
    }
  }
  async borrar(idNotificacion: number) {
    const alert = await this.alertController.create({
      header: '¿Desea borrar la notificación?',
      mode:"ios",
      buttons: [
        {
          cssClass: 'secondarybtn', 
          text: 'Cancelar',
          handler: () => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          cssClass: 'primarybtn', 
          text: 'Sí, borrar',
          handler: async () => {
            try {
              let respuesta = await this.dataService.postNotificacionesEliminar(idNotificacion);
              if(respuesta.data.success==true){
                this.mostrarMensajeBottom('Se borro la notificación.',3000,'success');
                  this.cargarNotificaciones();  
              }
            } catch (error) {
              console.log(error);
              this.mostrarMensajeBottom('Error, no se borro la notificación, intente luego.',3000,'danger')
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async mostrarMensajeBottom(mensaje:string,duracion:number,color:string){
    const toast = await this.toastController.create({
      message: ' '+mensaje+'  ',
      duration: duracion,
      position: 'bottom',
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

  async ionViewWillLeave() {

    try {
      const element = await this.loadingController.getTop();
      if (element) {
        this.loadingController.dismiss();
      }

    } catch (error) {

    }
  }

  async closeModal() {
    await this.modalController.dismiss(null);
  }
}
