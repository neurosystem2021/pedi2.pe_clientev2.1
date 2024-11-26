import { Component, OnInit } from '@angular/core';
import { NavController, ModalController, LoadingController, AlertController, MenuController, ActionSheetController, ToastController } from '@ionic/angular';
import { CarritoService } from 'src/app/services/carrito.service';
import { NavegacionService } from '../../../services/navegacion.service';

import { DataService } from 'src/app/services/data.service';
import { PedidoModel } from 'src/app/modelos/pedido.model';
import { Storage } from '@ionic/storage';
import { AccionesService } from 'src/app/services/acciones.service';
import { PagoPage } from 'src/app/modals/pago/pago.page';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
import { UbicarPage } from 'src/app/modals/ubicar/ubicar.page';
interface AudioTrack {
  name: string;
  audio: HTMLAudioElement;
}

@Component({
  selector: 'app-realizar',
  templateUrl: './realizar.page.html',
  styleUrls: ['./realizar.page.scss'],
})
export class RealizarPage implements OnInit {
  mymap: any;
  loaderToShowUbi: any;
  loaderToShowPre: any;
  loaderToShowPed: any;
  clientelayer: any;
  empresa1layer: any;
  empresa2layer: any;
  empresa3layer: any;
  public direccion: any;
  public lat_cliente: any;
  public lon_cliente: any;
  public pais: any;
  public departamento: any;
  public provincia: any;
  public distrito: string = "";
  public subdistrito: any;
  public via: string = "Seleccione o actualice...";
  public subvia: any;
  public latprueba: any;
  public lonprueba: any;
  public costoDelivery: number = 0;
  public tipoPago: string = "no";
  base: any;
  public calculoCorrecto: boolean = false;
  public empresasPedido: string[] = [];
  public empresasCoord: any = [];
  banderaIcon: any;
  casaIcon: any;
  //pedidoHabilitado: boolean = false;
  public pedidos:PedidoModel[]=[];
  public costoProductos:number = 0;


  //Nuevas Variables
  public direccionPedido:string ='';
  public latitude: any = 0;
  public longitude: any = 0;
  public referencia:string = '';
  public coords: string = "";
  public metodoPago:string = "";
  public idMetodoPago: any = null;
  public idEmpresaPedido: any = null;
  public empresaPedido:any = null;
  public imagenEmpresa:any = null;
  public pedidoHabilitado: number = 0;
  public cambio: number = 0;
  public bloquearBotonRealizar: boolean = false;
  public mapaAlerta: boolean = false;
  public pagoAlerta: boolean = false;
  public direccionAlerta: boolean = false;
  public direccionesCliente:any = [];
  public disabledDirecciones:boolean = false;
  public disabledPago:boolean = false;
  public direccionesAlerta:boolean = false;
  public precioAlerta:boolean = false;
  public precioKm:number = 0;
  public kmArea:number = 0;
  public latitudEmpresa: any = null;
  public longitudEmpresa: any = null;
  public precioDeliveryCalculado: any = null;
  public distanciaKm:number=0;

  audioTracks: AudioTrack[] = [
    { name: 'errorDir', audio: new Audio('assets/audio/realizar/direccionerror.mp3') },
    { name: 'metodoPago',  audio: new Audio('assets/audio/realizar/metodopagoerror.mp3') },
    { name: 'realizado', audio: new Audio('assets/audio/realizar/realizado.mp3') },
    { name: 'agregue', audio: new Audio('assets/audio/realizar/agregue.mp3') },
    { name: 'seleccionado',  audio: new Audio('assets/audio/realizar/seleccionado.mp3') },
    { name: 'nodirecciones', audio: new Audio('assets/audio/realizar/nodirecciones.mp3') },
    { name: 'confirmeentrega', audio: new Audio('assets/audio/realizar/confirmeentrega.mp3') },
    { name: 'fueraarea', audio: new Audio('assets/audio/realizar/fueraarea.mp3') },
  ];

  constructor(public navController: NavController,
    public modalController: ModalController,
    public loadingController: LoadingController,
    public carritoService: CarritoService,
    public alertController: AlertController,
    public navegacionService: NavegacionService,
    public menuController: MenuController,
    public dataService: DataService,
    public storage: Storage,
    public accionesService:AccionesService,
    public statusBar: StatusBar,
    public toastController: ToastController,
    public actionSheetController:ActionSheetController) {
  }


  async ngOnInit() {
    this.statusBar.backgroundColorByHexString('#FBFBFB');
    this.statusBar.styleDefault();
    this.menuController.enable(false);
    this.pedidos = this.carritoService.obtenerPedidos();
    if(this.pedidos.length>0){
      this.empresaPedido = this.carritoService.obtenerPedidos()[0].RazonSocial;
      this.imagenEmpresa = this.carritoService.obtenerPedidos()[0].EmpresaImagenUrl;
      this.idEmpresaPedido = this.carritoService.obtenerPedidos()[0].IdEmpresa;
      this.latitudEmpresa = this.carritoService.obtenerPedidos()[0].Latitud;
      this.longitudEmpresa = this.carritoService.obtenerPedidos()[0].Longitud;
    }
 
    try {
      let cliente = await this.storage.get('cliente');
      if(cliente !== null){
        let respuestaDirecciones = await this.dataService.getDirecciones(cliente.IdCliente);
        if(respuestaDirecciones.data.success==true){
          this.direccionesCliente = respuestaDirecciones.data.data.reverse();
          this.direccionPedido = this.direccionesCliente[0].Direccion;
          this.latitude = this.direccionesCliente[0].Latitud;
          this.longitude = this.direccionesCliente[0].Longitud;
          this.referencia = this.direccionesCliente[0].Referencia;
         this.calcularPrecioDelivery();
          
        }else if(respuestaDirecciones.data.success==false){
          this.direccionesCliente = []
          this.precioDeliveryCalculado = null;
          try {
           this.playAudio('nodirecciones');
          } catch (error) {
            console.log("error");
          }
          this.mostrarMensajeBottom('No tiene direcciones porfavor agregue una',4000,'warning');
          this.mapaAlerta = true;
          setTimeout(() => {
            this.mapaAlerta = false;
          }, 4000);
        }
      }
    } catch (error) {
      this.direccionesCliente = []
      this.precioDeliveryCalculado = null;
    }
  }

  async calcularPrecioDelivery(){
    if(this.idEmpresaPedido!=null){
      try {
        let respuestaConfig = await this.dataService.getConfiguracionEmpresa(this.idEmpresaPedido);
        if(respuestaConfig.data.success==true){
          this.costoDelivery = parseFloat(respuestaConfig.data.data.PrecioDelivery);
          this.pedidoHabilitado = respuestaConfig.data.data.HabilitadoPedido;
          this.precioKm = parseFloat(respuestaConfig.data.data.PrecioKm);
          this.kmArea = respuestaConfig.data.data.KmArea;
          this.distanciaKm = this.calculoKM(this.latitudEmpresa,this.longitudEmpresa,this.latitude,this.longitude)
          let preciokmTotal = (this.distanciaKm * this.precioKm ) + this.costoDelivery;
          this.precioDeliveryCalculado = Math.round(Number(preciokmTotal)); 
          this.metodoPago = "";
          this.idMetodoPago = null;
          this.cambio = 0;
        }
      } catch (error) {
        this.precioDeliveryCalculado=null;
        this.mostrarMensajeBottom('Hubo un error, intente nuevamente',2000,'danger')
      }
    }

  }
  
  async cambiarDireccion(){

    try {
      this.disabledDirecciones = true;
      let cliente = await this.storage.get('cliente');
      if(cliente !== null){
        let respuestaDirecciones = await this.dataService.getDirecciones(cliente.IdCliente);
        if(respuestaDirecciones.data.success==true){
          this.direccionesCliente = respuestaDirecciones.data.data
          let buttons = [];
          this.direccionesCliente.map((dir: any)=>{
            let button = {
              text: dir.Direccion,
              icon: 'map-sharp',
              handler: async () => {
                this.direccionPedido = dir.Direccion;
                this.latitude = dir.Latitud;
                this.longitude = dir.Longitud;
                this.referencia = dir.Referencia;
                this.calcularPrecioDelivery()
                this.mostrarMensajeBottom("Dirección de entrega cambiada.",2000,"success")
              }
            }
            buttons.push(button);
          })

          let buttonNueva = {
              text: 'Agregar Nueva Dirección',
              icon: 'add-sharp',
              handler: async () => {
                this.nuevaUbicacion();
              }
            }

          buttons.push(buttonNueva);

          let buttonCerrar = {
            text: 'Cerrar',
            icon:'close-sharp',
            handler: async () => {

            }
          }
          buttons.push(buttonCerrar);
          
          let actionSheet = await this.actionSheetController.create({
            header: 'Seleccione la dirección de entrega.',
            backdropDismiss: false,
            cssClass: "headerAction",
            buttons: buttons
          });
          await actionSheet.present();
          this.disabledDirecciones = false;
        }else if(respuestaDirecciones.data.success==false){
          this.direccionesCliente = []
          this.precioDeliveryCalculado = null
          this.disabledDirecciones = false;
          try {
            this.playAudio('nodirecciones');
          } catch (error) {
            console.log("error");
          }
          this.mostrarMensajeBottom('No tiene direcciones porfavor agregue una.',4000,'warning');
          this.mapaAlerta = true;
          setTimeout(() => {
            this.mapaAlerta = false;
          }, 4000);
        }
      }

    } catch (error) {
      this.disabledDirecciones = false;
    }

  }

  async nuevaUbicacion() {
    const modal = await this.modalController.create({
      component: UbicarPage,
      cssClass: 'my-custom-class'
    });

    modal.onDidDismiss().then(async (modalDataResponse)=>{
      if (modalDataResponse.data !== null) {
        this.latitude = modalDataResponse.data.latitude;
        this.longitude = modalDataResponse.data.longitude;
        this.direccionPedido = modalDataResponse.data.direccion;
        this.calcularPrecioDelivery()
        this.mostrarMensajeBottom("Dirección agregada y seleccionada",3000,'success')
        setTimeout(async () => {
          try {
           this.playAudio('seleccionado');
          } catch (error) {
            console.log("error");
          }

          /*const alert = await this.alertController.create({
            header: 'Se ha seleccionado la dirección agregada',
            backdropDismiss: false,
            message: 'Se ha seleccionado la dirección agregada, puede cambiarla en el botón direcciones.',
            mode: "ios",
            buttons: [
              {
                cssClass: 'primarybtn',
                text: 'Entiendo',
                handler: () => {*/
                  this.direccionAlerta = true;
                  setTimeout(() => {
                    this.direccionAlerta = false;
                  }, 2000);
                  this.direccionesAlerta = true;
                  setTimeout(() => {
                    this.direccionesAlerta = false;
                  }, 5000);/*
                }
              }
            ]
          });
          await alert.present();*/
        }, 400);

        //this.coords = this.direccion + ", " + this.latitude + ", "+ this.longitude;
      }else{
        this.coords = "";
      }
    });
    return await modal.present();
  }

  //Inicio Funciones
  async onMostrarModalPago(){
    this.disabledPago=true;
    try {
      let respuestaConfig = await this.dataService.getConfiguracionEmpresa(this.idEmpresaPedido);
      if(respuestaConfig.data.success==true){
        this.costoDelivery = parseFloat(respuestaConfig.data.data.PrecioDelivery);
        this.pedidoHabilitado = respuestaConfig.data.data.HabilitadoPedido;
        this.precioKm = parseFloat(respuestaConfig.data.data.PrecioKm);
        this.kmArea = respuestaConfig.data.data.KmArea;
        this.distanciaKm = this.calculoKM(this.latitudEmpresa,this.longitudEmpresa,this.latitude,this.longitude)
        let preciokmTotal = (this.distanciaKm * this.precioKm ) + this.costoDelivery;
        this.precioDeliveryCalculado = Math.round(Number(preciokmTotal)); 
        this.metodoPago = "";
        this.idMetodoPago = null;
        this.cambio = 0;
        const modal = await this.modalController.create({
          component: PagoPage,
          componentProps: {
            PrecioProductos:this.carritoService.calcularSubtotal(),
            PrecioDelivery:this.precioDeliveryCalculado
          }
        });
    
        modal.onDidDismiss().then((dataReturned) => {
          if (dataReturned.data !== null) {
            this.metodoPago = dataReturned.data.texto;
            this.idMetodoPago = dataReturned.data.idPago;
            this.cambio = dataReturned.data.cambio;
          }
        });
        this.disabledPago=false;
        return await modal.present();
        //fin de modal
        
      }
    } catch (error) {
      this.disabledPago=false;
    }

  }

  async mostrarMensajeBottom(mensaje:string,duracion:number,color:string){
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
  //Fin funciones

  calculoKM(latStart: number, longStart: number, latEnd: number, longEnd: number) {

    const R = 6371; // Radius of the earth in km
    const dLat = this._deg2rad(latEnd - latStart);
    const dLong = this._deg2rad(longEnd - longStart);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this._deg2rad(latStart)) * Math.cos(this._deg2rad(latEnd)) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km

    return +d.toFixed(2);
  }

  _deg2rad(deg: any) {
    return deg * (Math.PI / 180);
  }



  async ionViewWillEnter() {

  }

  async ionViewWillLeave() {
    try {
      const element = await this.alertController.getTop();
      if (element) {
            element.dismiss();   
      }
      
    } catch (error) {
     

    }

    this.menuController.enable(true);
    //document.getElementById('weathermap').innerHTML = "";
    //document.getElementById('mapid').innerHTML = "";

  }

  verificarEmpresaCerrada() {
    let objIndex = this.pedidos.findIndex((pedido => this.verificarHora(pedido.HorarioInicio, pedido.HorarioFin) == false));
    return objIndex;
  }

  verificarHora(inicio: string, fin: string) {
    let hora_inicio = Number(inicio.split(':')[0]);
    let minutos_inicio = Number(inicio.split(':')[1]);
    let hora_fin = Number(fin.split(':')[0]);
    let minutos_fin = Number(fin.split(':')[1]);
    var start = hora_inicio * 60 + minutos_inicio;
    var end = hora_fin * 60 + minutos_fin;
    var now = new Date();
    var time = now.getHours() * 60 + now.getMinutes();
    return time >= start && time < end;
  }

  async OnRealizarPedido() {
      let index = this.verificarEmpresaCerrada();
      if (index !== -1) {
        const alert = await this.alertController.create({
          header: "¡" + this.pedidos[index].RazonSocial + ' ya cerró!',
          message: " " + this.pedidos[index].RazonSocial + "   ha cerrado, según su horario de atención...",
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
        await alert.present();   
        return;
      }



      if(this.latitude==0 && this.longitude==0 ){
        try {
          this.playAudio('agregue');
        } catch (error) {
          console.log("error");
        }
        const alert = await this.alertController.create({
          header: 'Sin Direcciones',
          backdropDismiss: false,
          message: 'Por favor, agregue una dirección de entrega.',
          mode: "ios",
          buttons: [
            {
              cssClass: 'primarybtn',
              text: 'Entiendo',
              handler: () => {
                this.mapaAlerta = true;
                setTimeout(() => {
                  this.mapaAlerta = false;
                }, 4000);
              }
            }
          ]
        });
        await alert.present();
        return;
      }

      if((this.direccionPedido+"").trim()==''){
        this.direccionAlerta = true;
        setTimeout(() => {
          this.direccionAlerta = false;
        }, 2000);
        this.mostrarMensajeBottom('Por favor, ingrese la dirección de entrega.',2000,'warning');
        try {
          this.playAudio('errorDir');
        } catch (error) {
          console.log("error");
        }
        return;
      }

      if(this.precioDeliveryCalculado==null){
        const alert = await this.alertController.create({
          header: 'Error',
          backdropDismiss: false,
          message: 'No se calculó el precio de delivery, por favor intente nuevamente con el boton amarillo',
          mode: "ios",
          buttons: [
            {
              cssClass: 'primarybtn',
              text: 'Entiendo',
              handler: () => {
                this.precioAlerta = true;
                setTimeout(() => {
                  this.precioAlerta = false;
                }, 4000);
              }
            }
          ]
        });
        await alert.present();
        return;
      }

      if(this.distanciaKm>this.kmArea){
        try {
          this.playAudio('fueraarea');
        } catch (error) {
          console.log("error");
        }
        const alert = await this.alertController.create({
          header: 'Sin cobertura de delivery',
          backdropDismiss: false,
          message: 'La dirección seleccionada está fuera del área de atención de la empresa.',
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
        await alert.present();
        return;
      }

      if(this.idMetodoPago == null){
            
        this.pagoAlerta=true;
        setTimeout(() => {
          this.pagoAlerta=false;
        }, 3000);

        this.mostrarMensajeBottom('Por favor, seleccione un método de pago.',3000,'warning');
        try {
          this.playAudio('metodoPago');
        } catch (error) {
          console.log("error");
        }
        return;
      }

      this.bloquearBotonRealizar = true;
      try {
       this.playAudio('confirmeentrega');
      } catch (error) {
        console.log("error");
      }
      const alert = await this.alertController.create({
        header: 'Confirmar Entrega',
        message: "Se entregará en  "+this.direccionPedido.toUpperCase()+"   ¿Es correcto?",
        backdropDismiss: false,
        mode:"ios",
        buttons: [
          {
            cssClass: 'primarybtn', 
            text: 'Sí, enviar pedido',
            handler: async () => {
              let pedidosFiltro = this.pedidos.map(a => ({"IdProducto":a.IdProducto,"Producto":a.Producto,"Descripcion":a.Descripcion,"Cantidad":a.Cantidad,"ProductoImagenUrl":a.FacturaUrl+'/resources/images/productos/'+a.ProductoImagenUrl ,"Precio":a.Precio,"Indicacion":a.Indicacion}) );
              let plataforma = this.pedidos[0].FacturaUrl;
              let idAlmacen = this.pedidos[0].IdAlmacen;
              this.costoProductos = this.carritoService.calcularSubtotal();
              let cliente = await this.storage.get('cliente');
              if(cliente !== null){
                let infoPedido = {
                  IdCliente: cliente.IdCliente,
                  IdEmpresa: this.idEmpresaPedido,
                  PrecioDelivery: this.precioDeliveryCalculado,
                  PrecioProductos:this.costoProductos,
                  Latitud: this.latitude,
                  Longitud: this.longitude,
                  Direccion: this.direccionPedido.toUpperCase(),
                  Referencia: this.referencia,
                  MetodoPago: this.metodoPago,
                  Cambio: this.cambio
                }
          
                try {
        
                  let respuestaConfig = await this.dataService.getConfiguracionEmpresa(this.idEmpresaPedido);
                  if(respuestaConfig.data.success==true){
                    this.pedidoHabilitado = respuestaConfig.data.data.HabilitadoPedido;
                    let tieneSistema = respuestaConfig.data.data.TieneSistema;
                    let idRegion = respuestaConfig.data.data.IdRegion;
                    if(this.pedidoHabilitado == 1){
                      let respuestaRealizar = await this.dataService.postRealizarPedido(infoPedido,pedidosFiltro);
                      if(respuestaRealizar.data.success==true){
                        this.carritoService.eliminarPedidos();
                        this.accionesService.emitirNuevoPedido(plataforma,idAlmacen,this.idEmpresaPedido,tieneSistema,idRegion);
                        this.navController.navigateRoot('/ruta', { animationDirection: 'forward' });
        
                         const alert = await this.alertController.create({
                           header: '¡Pedido realizado!',
                           backdropDismiss: false,
                           message: ' En breves momentos le llamaremos para confirmar su pedido, puede seguir el estado de su pedido en el mapa. Gracias por confiar en nosotros. :)  ',
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
                         await alert.present();
                        try {
                         this.playAudio('realizado');
                        } catch (error) {
                          console.log("error");
                        }
                      }else if(respuestaRealizar.data.success==false){
                        this.carritoService.eliminarPedidos();
                        this.navController.navigateRoot('/ruta', { animationDirection: 'forward' });
                        const alert = await this.alertController.create({
                          header: '¡Ya existe un pedido!',
                          backdropDismiss: false,
                          message: ' Ya existe un pedido se redirigio a la ruta.  ',
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
                        await alert.present();
                      }
                      this.bloquearBotonRealizar = false;
                    }else{
                      this.bloquearBotonRealizar = false;
                      const alert = await this.alertController.create({
                        header: '¡La empresa no esta recibiendo pedidos en este momento!',
                        backdropDismiss: false,
                        message: ' Por favor intente luego  ',
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
                      await alert.present();
                    }
        
                  }
                } catch (error) {
                  this.bloquearBotonRealizar = false;
                  const alert = await this.alertController.create({
                    header: '¡Hubo un error porfavor intente mas tarde!',
                    backdropDismiss: false,
                    message: ' No hay conexion con el servidor.  ',
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
                  await alert.present();
                }
              }
            }
          },
          {
            cssClass: 'secondarybtn', 
            text: 'Atrás',
            handler: () => {
              this.bloquearBotonRealizar = false;
            }
          },
        ]
      });
  
      await alert.present();

    //FIN DE NUEVA FUNCIONALIDAD REALIZAR PEDIDO Descripcion

 }

  onIrPrincipal() {
    this.menuController.enable(true);
    this.navController.navigateRoot(this.navegacionService.getNavegacionAnteriorCarrito(), { animationDirection: 'back' });
  }

  playAudio(name: string) {
    const track = this.audioTracks.find(t => t.name === name);
    if (track) {
      track.audio.play();
    }
  }

}
