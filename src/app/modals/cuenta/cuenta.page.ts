import { Component, OnInit } from '@angular/core';
import { ModalController, LoadingController, AlertController, NavController, ActionSheetController, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { CarritoService } from 'src/app/services/carrito.service';
import { DataService } from 'src/app/services/data.service';
import { HerramientasService } from 'src/app/services/herramientas.service';
import { WebsocketService } from 'src/app/services/websocket.service';
@Component({
  selector: 'app-cuenta',
  templateUrl: './cuenta.page.html',
  styleUrls: ['./cuenta.page.scss'],
})
export class CuentaPage implements OnInit {
  public celular:string="";
  public dni:string="";
  public nombres:string="";
  public apellidos:string="";
  loaderToShow: any;
  public departamentoSelect:any = null;
  public cliente:any={
    Apellidos: null,
    Direccion: null,
    Direccion2: null,
    Direccion3: null,
    Dni: null,
    Email: null,
    FechaMod: null,
    FechaReg: null,
    IdCliente: null,
    Latitud: null,
    Longitud: null,
    Nombres: null,
    Puntos: null,
    Telefono: null,
  };
  public mostrarDirecciones:boolean = false;
  public direccionesCliente:any = [];
  public disabledDirecciones:boolean = false;

  public mostrarHistorial:boolean = false;
  public historialCliente:any = [];
  public disabledHistorial:boolean = false;
  constructor(private modalController: ModalController,
    private storage: Storage,
    public loadingController:LoadingController,
    public herramientasService:HerramientasService,
    public carritoService: CarritoService,
    public alertController: AlertController,
    public navController: NavController,
    public wbSocket: WebsocketService,
    private dataService:DataService,
    public actionSheetController:ActionSheetController,
    public toastController:ToastController) { }
  async ionViewWillEnter() {

    let cliente = await this.storage.get('cliente');

    if(cliente != null || cliente != undefined){
      this.cliente = cliente;
    }

    let departamento = await this.storage.get("departamento");
    if(departamento != null){
      this.departamentoSelect = departamento.DepartamentoUbicacion;
    }


    /*
    this.loaderToShow = await this.loadingController.create({
      message: 'Cargando mi información...',
      spinner: 'dots',
      backdropDismiss: false,
      mode:"ios"
    });
    this.loaderToShow.present();
    this.storage.get('usuario').then((val) => {
      this.celular=val['celular'];
      this.dni=val['dni'];
      this.nombres=val['nombres'];
      this.apellidos=val['apellidos'];
      this.loaderToShow.dismiss();
      this.herramientasService.consultaPuntosApi();
    },(error)=>{
      this.loaderToShow.dismiss();
    });*/

  }

  async onMostrarHistorial(){
    this.onCerrarDirecciones();
      this.loaderToShow = await this.loadingController.create({
        message: 'Cargando historial',
        spinner: 'crescent',
        backdropDismiss: false,
        mode: "ios"
      });
      this.loaderToShow.present();

      this.disabledHistorial = true;
      setTimeout(async () => {
        let cliente = await this.storage.get('cliente');
        
        if(cliente !== null){
          try {
            let respuestaHistorial = await this.dataService.getHistorialPedidos(cliente.IdCliente);
            if(respuestaHistorial.data.success==true){
              this.historialCliente = respuestaHistorial.data.data
              this.disabledHistorial = false;
              this.mostrarHistorial = true;
              this.loaderToShow.dismiss()
            }else if(respuestaHistorial.data.success==false){
              this.historialCliente = []
              this.disabledHistorial = false;
              this.mostrarHistorial = true;
              this.loaderToShow.dismiss()
            }
          } catch (error) {
            this.loaderToShow.dismiss()
            this.historialCliente = [];
            this.disabledHistorial = false;
            this.mostrarHistorial = false;
            this.mostrarMensajeBottom("Error No hay conexion.",2000,'danger');
          }
        }  
      }, 500);


  }

  onCerrarHistorial(){
    this.mostrarHistorial = false;
    this.historialCliente = [];
  }

  async onMostrarDirecciones(){
      this.onCerrarHistorial();
      this.loaderToShow = await this.loadingController.create({
        message: 'Cargando direcciones',
        spinner: 'crescent',
        backdropDismiss: false,
        mode: "ios"
      });
      this.loaderToShow.present();

      this.disabledDirecciones = true;
      setTimeout(async () => {
        let cliente = await this.storage.get('cliente');
        
        if(cliente !== null){
          try {
            let respuestaDirecciones = await this.dataService.getDirecciones(cliente.IdCliente);
              if(respuestaDirecciones.data.success==true){
                this.direccionesCliente = respuestaDirecciones.data.data
                this.disabledDirecciones = false;
                this.mostrarDirecciones = true;
              }else if(respuestaDirecciones.data.success==false){
                this.direccionesCliente = []
                this.disabledDirecciones = false;
                this.mostrarDirecciones = true;
              } 
              this.loaderToShow.dismiss()   
            } catch (error) {
              this.loaderToShow.dismiss()
              this.direccionesCliente = [];
              this.mostrarDirecciones = false;
              this.disabledDirecciones = false;
              this.mostrarMensajeBottom("Error No hay conexion.",2000,'danger');
            }
        }  
      }, 500);




  }

  onCerrarDirecciones(){
    this.mostrarDirecciones = false;
    this.direccionesCliente = [];
  }


  async onEliminarDireccion(idDireccionCliente: any,Direccion: any){

    const alert = await this.alertController.create({
      header: 'Eliminar dirección',
      message: "Se eliminará la dirección  "+Direccion+"   ¿está seguro?",
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
          text: 'Sí, eliminar',
          handler: async () => {
            try {
              let respuesta = await this.dataService.postEliminarDireccion(idDireccionCliente);
              if(respuesta.data.success==true){
                this.mostrarMensajeBottom('Se eliminó la direccioón.',3000,'success');
                  this.onMostrarDirecciones();  
              }
            } catch (error) {
              console.log(error);
              this.mostrarMensajeBottom('Error, no se eliminó la dirección.',3000,'danger')
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


  ngOnInit() {
  }

  async closeModal() {
    await this.modalController.dismiss(null);
  }

  async onCerrarSesion(){
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
              await this.modalController.dismiss("Cuenta");
              this.loaderToShow.present();
              await this.storage.remove('cliente');
              this.navController.navigateRoot('/login', { animationDirection: 'back' }).then(() => {
                setTimeout(() => {
                  this.wbSocket.desconectarSocket();
                  this.loaderToShow.dismiss();
                }, 200);
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
      await this.modalController.dismiss("Cuenta");
      await this.storage.remove('cliente');
      this.navController.navigateRoot('/login', { animationDirection: 'back' }).then(() => {
        setTimeout(() => {
          this.wbSocket.desconectarSocket();
          this.loaderToShow.dismiss();
        }, 200);
      });
    }
  }
}
