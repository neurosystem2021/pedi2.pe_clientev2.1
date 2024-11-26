import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, LoadingController, ToastController, MenuController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { DataService } from 'src/app/services/data.service';
import { NavegacionService } from 'src/app/services/navegacion.service';
import { environment } from 'src/environments/environment';
import { Market } from '@awesome-cordova-plugins/market/ngx';
import { App } from '@capacitor/app';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
})
export class InicioPage implements OnInit {
  public titulo: string = "";
  loaderToShowPed: any;
  loaderToShow!: HTMLIonLoadingElement;
  public cargando:boolean=false;
  constructor(public navCtrl: NavController,
    public alertController: AlertController,
    private storage: Storage,
    public dataService: DataService,
    public loadingController: LoadingController,
    public toastController:ToastController,
    public menuController: MenuController,
    public navegacionService:NavegacionService,
    private market: Market,) { }

  ngOnInit() {

  }

  async ionViewDidEnter() {

    try {
       setTimeout(() => {
         this.cargando=true
       }, 200);
       let respuesta = await this.dataService.getConfiguracionApp();
       if(respuesta.data.success == true){
          if(respuesta.data.data.VersionApp == environment.versionApp){
            /*let presentacion = await this.storage.get('presentacion');
            if(presentacion === null){
              setTimeout(() => {
                this.navCtrl.navigateRoot('/presentacion', { animationDirection: 'forward' });
              }, 1000);
            }else{*/
        
              // Logica de cliente
              let cliente = await this.storage.get('cliente');
              if(cliente === null){
                setTimeout(() => {
                  this.navCtrl.navigateRoot('/login', { animationDirection: 'forward' });
                }, 2000);
              }else{
        
                  let respuestaPedido = await this.dataService.getPedidoExiste(cliente.IdCliente);
                  if(respuestaPedido.data.success==true){
                    this.mostrarMensajeBottom(respuestaPedido.data.msg,1000,'success')
                    setTimeout(() => {
                      this.cargando=false;
                      this.navCtrl.navigateRoot('/ruta', { animationDirection: 'forward' });
                    }, 2000);
                  }else if(respuestaPedido.data.success==false){
                  
                    setTimeout(() => {
                      this.cargando=false;
                      //Cargar La promicion
                      let notificacionPromo: any = this.navegacionService.getNotificationPromo();
                      if(notificacionPromo!=null){
                        let empresa = JSON.parse(notificacionPromo.empresa)
                        this.navegacionService.setEmpresa(empresa)
                        this.navegacionService.setCategoria(Number(empresa.IdEmpresaCategoria), empresa.EmpresaCategoria)
                        this.navegacionService.initNotificacionPromo();
                        this.navCtrl.navigateRoot(notificacionPromo.actionUrl, { animationDirection: 'forward' }).then(() => {
                          // this.menuController.toggle();
                          });
                      }else{                 
                      this.navCtrl.navigateRoot('/principal/menu', { animationDirection: 'forward' }).then(() => {
                        // this.menuController.toggle();
                        });
                      }

                    }, 2000);
                  }
        
              }
        
            //}

          }else{
            this.cargando=false;
            const alert = await this.alertController.create({
              header: '¡Nueva versión del app!',
              backdropDismiss: false,
              message: 'Existe una nueva   versión del app   porfavor actualice desde PlayStore.',
              mode: "ios",
              buttons: [
                {
                  cssClass: 'primarybtn',
                  text: 'Ir a PlayStore',
                  handler: () => {
                    this.market.open('io.neurosoft.pedi2');
                    App.exitApp();
                  }
                }
              ]
            });
            await alert.present();
          }
       } else {
        this.cargando=false;
        const alert = await this.alertController.create({
          header: '¡No hay configuración inicial!',
          backdropDismiss: false,
          message: 'No se pudo obtener   la versión del app   porfavor cierre y vuelva a entrar',
          mode: "ios",
          buttons: [
            {
              cssClass: 'primarybtn',
              text: 'Salir',
              handler: () => {
                App.exitApp();
              }
            }
          ]
        });
        await alert.present();
       }
    } catch (error) {
      this.cargando=false;
      const alert = await this.alertController.create({
        header: '¡Sin conexión!',
        backdropDismiss: false,
        message: 'No se pudo obtener su usuario por favor  conectese a internet y renicie la aplicación.  ',
        mode: "ios",
        buttons: [
          {
            cssClass: 'primarybtn',
            text: 'Salir',
            handler: () => {
              App.exitApp();
            }
          }
        ]
      });
      await alert.present();
    }


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

  ionViewWillLeave() {
    let logo = document.getElementById('logo')
    if (logo) {
      logo.innerHTML = "";
    }

  }


}
