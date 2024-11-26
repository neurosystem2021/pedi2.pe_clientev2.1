import { Component, OnInit } from '@angular/core';
import { NavController, ModalController, LoadingController, AlertController } from '@ionic/angular';
import { CarritoPage } from 'src/app/modals/carrito/carrito.page';
import { CuentaPage } from 'src/app/modals/cuenta/cuenta.page';
import { PromocionesPage } from 'src/app/modals/promociones/promociones.page';
import { NotificacionesPage } from 'src/app/modals/notificaciones/notificaciones.page';
import { FavoritosPage } from 'src/app/modals/favoritos/favoritos.page';
import { HablanosPage } from 'src/app/modals/hablanos/hablanos.page';
import { CarritoService } from '../../services/carrito.service';
import { Storage } from '@ionic/storage';
import { HerramientasService } from 'src/app/services/herramientas.service';
import { WebsocketService } from 'src/app/services/websocket.service';

@Component({
  selector: 'app-principal',
  templateUrl: './principal.page.html',
  styleUrls: ['./principal.page.scss'],
})
export class PrincipalPage implements OnInit {
  loaderToShow: any;
  public nombres:string="";
  public telefono:string="";
  constructor(public navCtrl: NavController,
    public modalController: ModalController,
    public loadingController: LoadingController,
    public carritoService: CarritoService,
    public alertController: AlertController,
    private storage: Storage,
    public herramientasService:HerramientasService,
    public wbSocket: WebsocketService) {}

  ngOnInit() {
    this.wbSocket.conectarSocket();
  }
  ionViewWillEnter() {

    this.storage.get('cliente').then((val)=>{
     this.nombres = val.Nombres;
     this.telefono = val.Telefono;
    });
    
  }

  ionViewDidEnter() {

  }

  onIrCarrito() {
    //this.navCtrl.navigateRoot('/principal/categoria', { animationDirection: 'back' });      
    console.log("carrito");
  }

  async onIrSidemenu(accion: string) {
    switch (accion) {
      case "principal": {

        this.navCtrl.navigateRoot('/principal/menu', { animationDirection: 'back' });
        break;
      }

      case "cerrarsesion": {

        if (this.carritoService.obtenerPedidos().length != 0) {
          const alert = await this.alertController.create({
            header: 'Cerrar sesión',
            message: "¿Esta seguro de cerrar sesión? Se borrará los productos del  carrito  ,",
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
                text: 'Aceptar',
                handler: async () => {
                  this.carritoService.eliminarPedidos();
                  this.loaderToShow = await this.loadingController.create({
                    message: 'Cerrando Sesión...',
                    spinner: 'bubbles',
                    backdropDismiss: false,
                    mode:"ios"
                  });
                  this.loaderToShow.present();
                  await this.storage.remove('cliente');
                  this.navCtrl.navigateRoot('/login', { animationDirection: 'back' }).then(() => {
                    setTimeout(() => {
                      this.wbSocket.desconectarSocket();
                      this.loaderToShow.dismiss();
                    }, 500);
                  });
                }
              }
            ]
          });

          await alert.present();

        } else {
          this.carritoService.eliminarPedidos();
          this.loaderToShow = await this.loadingController.create({
            message: 'Cerrando Sesión...',
            spinner: 'bubbles',
            backdropDismiss: false,
            mode:"ios"
          });
          this.loaderToShow.present();
          await this.storage.remove('cliente');
          this.navCtrl.navigateRoot('/login', { animationDirection: 'back' }).then(() => {
            setTimeout(() => {
              this.wbSocket.desconectarSocket();
              this.loaderToShow.dismiss();
            }, 200);
          });
        }

        break;
      }

      case "carrito": {
        //abrir modal
        const modal = await this.modalController.create({
          component: CarritoPage,
          componentProps: {
          }
        });

        modal.onDidDismiss().then((dataReturned) => {
          if (dataReturned !== null) {

            // console.log('Modal Sent Data :' + dataReturned.data);
          }
        });

        return await modal.present();
        //fin de modal


        break;
      }
      case "hablanos": {
        //abrir modal
        const modal = await this.modalController.create({
          component: HablanosPage,
          componentProps: {
            "paramID": 123,
          }
        });

        modal.onDidDismiss().then((dataReturned) => {
          if (dataReturned !== null) {

            console.log('Modal Sent Data :' + dataReturned.data);
          }
        });

        return await modal.present();
        //fin de modal


        break;
      }
      case "favoritos": {
        //abrir modal
        const modal = await this.modalController.create({
          component: FavoritosPage,
          componentProps: {
            "paramID": 123,
          }
        });

        modal.onDidDismiss().then((dataReturned) => {
          if (dataReturned !== null) {

            console.log('Modal Sent Data :' + dataReturned.data);
          }
        });

        return await modal.present();
        //fin de modal


        break;
      }
      case "notificaciones": {
        //abrir modal
        const modal = await this.modalController.create({
          component: NotificacionesPage,
          componentProps: {
            "paramID": 123,
          }
        });

        modal.onDidDismiss().then((dataReturned) => {
          if (dataReturned !== null) {

            console.log('Modal Sent Data :' + dataReturned.data);
          }
        });

        return await modal.present();
        //fin de modal


        break;
      }
      case "promociones": {
        //abrir modal
        const modal = await this.modalController.create({
          component: PromocionesPage,
          componentProps: {
            "paramID": 123,
          }
        });

        modal.onDidDismiss().then((dataReturned) => {
          if (dataReturned !== null) {

            console.log('Modal Sent Data :' + dataReturned.data);
          }
        });

        return await modal.present();
        //fin de modal


        break;
      }
      case "cuenta": {
        //abrir modal
        const modal = await this.modalController.create({
          component: CuentaPage,
          componentProps: {
            "paramID": 123,
          }
        });

        modal.onDidDismiss().then((dataReturned) => {
          if (dataReturned !== null) {

            console.log('Modal Sent Data :' + dataReturned.data);
          }
        });

        return await modal.present();
        //fin de modal


        break;
      }
    }
  }

}
