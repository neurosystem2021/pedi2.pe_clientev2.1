import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  ModalController,
  NavController,
  AlertController,
  IonFab,
  LoadingController,
  ToastController,
} from '@ionic/angular';
import { ChatPage } from 'src/app/modals/chat/chat.page';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { Storage } from '@ionic/storage';

import { AccionesService } from 'src/app/services/acciones.service';
import { HerramientasService } from 'src/app/services/herramientas.service';
import { Router } from '@angular/router';
import { WebsocketService } from 'src/app/services/websocket.service';
import { CarritorutaPage } from 'src/app/modals/carritoruta/carritoruta.page';
//import { ChatService } from 'src/app/services/chat.service';
//import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { environment } from 'src/environments/environment';
import { App } from '@capacitor/app';
import { AudioTrack } from 'src/app/interface/audioTrack.interface';

declare let L: any;
@Component({
  selector: 'app-ruta',
  templateUrl: './ruta.page.html',
  styleUrls: ['./ruta.page.scss'],
})
export class RutaPage implements OnInit, OnDestroy {
  mymap2: any;
  clientelayer: any;
  motorizadolayer: any;
  loaderToShow: any;
  ubi_lat_cliente = '';
  ubi_lon_cliente = '';
  idpedido = '';
  empresasCoord: any = {};
  motorizadoid: string = '';
  precio_delivery: string = '';
  precio_productos: string = '';
  ubi_referencia: string = '';
  lat = -9.940175;
  lng = -76.2417719;
  banderaIcon: any;
  casaIcon: any;
  motoIcon: any;
  mensajesSinLeer: number = 0;
  mensajesSubscription?: Subscription;
  estadoPedidoSubscription?: Subscription;
  escucharMotorizadoSubscription?: Subscription;
  escucharPedidoCanceladoSubscription?: Subscription;

  mensajes: any[] = [];
  @ViewChild('fab', { static: false }) fab?: IonFab;
  //logica pedido
  //E , PA , PE ,PC, PU, F ,C
  loaderToShowPed: any;
  empresa1layer: any;
  empresa2layer: any;
  empresa3layer: any;
  //-- logica pedido!

  //Nuevas variables
  idPedido: number | null = null;
  idCliente: number | null = null;
  vehiculo: string = '';
  nombreMotorizado: string = '';
  telefonoMotorizado: string = '';
  vehiculoColor: string = '';
  vehiculoPlaca: string = '';
  dataPedido: any;
  mensajeNuevo: string = '';
  tieneSistema: number = 0;

  audioTracks: AudioTrack[] = [
    { name: 'preparado', audio: new Audio('assets/audio/ruta/preparado.mp3') },
    { name: 'camino', audio: new Audio('assets/audio/ruta/camino.mp3') },
    { name: 'llegado', audio: new Audio('assets/audio/ruta/llegado.mp3') },
    {
      name: 'completado',
      audio: new Audio('assets/audio/ruta/completado.mp3'),
    },
    { name: 'cancelado', audio: new Audio('assets/audio/ruta/cancelado.mp3') },
    { name: 'aceptado', audio: new Audio('assets/audio/ruta/aceptado.mp3') },
    { name: 'comprando', audio: new Audio('assets/audio/ruta/comprando.mp3') },
  ];
  updateOrderInterval: any;
  currentStatus: any;

  constructor(
    private modalController: ModalController,
    public navCtrl: NavController,
    public alertController: AlertController,
    private storage: Storage,
    public dataService: DataService,
    public loadingController: LoadingController,
    public toastController: ToastController,
    public accionesService: AccionesService,
    public herramientasService: HerramientasService,
    private router: Router,
    public wsservice: WebsocketService
  ) {}

  ngOnInit() {
    this.wsservice.conectarSocket();

    this.mensajesSubscription = this.accionesService
      .mensajeEscuchar()
      .subscribe({
        next: async (payload: any) => {
          console.log(payload);
          try {
            let resp = await this.dataService.getMensajes(this.idPedido);
            this.mensajes =
              resp.data.chat != null && resp.data.chat != ''
                ? JSON.parse(resp.data.chat)
                : [];
            console.log('mensaje recibido');
            this.mensajeNuevo =
              ('' + payload.msg).length > 25
                ? ('' + payload.msg).substring(0, 25).concat('...')
                : '' + payload.msg;
            this.mensajesSinLeer++;
          } catch (error) {}

          /*
            Schedule a single notification
          this.localNotifications.schedule({
            id: 1,
          text: 'Motorizado envio un mensaje:'+msg['cuerpo'],
            sound: 'file://assets/sound/just-saying.mp3',
            vibrate:true,
            lockscreen:true,
            foreground:true,
            priority:2,
            data: { secret: '744774' }
          });
        */
        },
        error: (err: any) => {
          console.log(err);
        },
      });

    this.escucharMotorizadoSubscription = this.accionesService
      .escucharUbicacionMotorizado()
      .subscribe((resp: any) => {
        console.log(resp);
        this.cargarUbicacionMotorizado(resp['Latitud'], resp['Longitud']);
      });

    this.estadoPedidoSubscription = this.accionesService
      .estadoPedidoEscuchar()
      .subscribe(async (resp: any) => {
        this.actualizar();
        if (resp['estado'] == 'F') {
          try {
            console.log('completado');
            this.playAudio('completado');
          } catch (error) {
            console.log('error');
          }
        }
        if (resp['Estado'] == 'C') {
          try {
            console.log('finalizado');
            this.playAudio('cancelado');
          } catch (error) {
            console.log('error');
          }
        }
        try {
          let respuestaEstado = await this.dataService.getEstadoPedidoActivo(
            this.idPedido
          );
          if (respuestaEstado.data.success == true) {
            this.herramientasService.setEstado(respuestaEstado.data.estado);
            if (
              respuestaEstado.data.estado == 'F' ||
              respuestaEstado.data.estado == 'C'
            ) {
              if (
                this.router.isActive('/ruta', true) &&
                this.router.url === '/ruta'
              ) {
                if (respuestaEstado.data.estado == 'C') {
                  try {
                    this.playAudio('cancelado');
                  } catch (error) {
                    console.log('error');
                  }
                } else if (respuestaEstado.data.estado == 'F') {
                  try {
                    this.playAudio('completado');
                  } catch (error) {
                    console.log('error');
                  }
                }

                this.navCtrl.navigateRoot('/principal/menu', {
                  animationDirection: 'back',
                });
              }
            }
            if (respuestaEstado.data.estado == 'PU') {
              try {
                let respuestaMotorizado =
                  await this.dataService.getMotorizadoInfo(
                    respuestaEstado.data.idMotorizado
                  );
                let respuestaMotorizadoInfo = respuestaMotorizado.data.data;
                this.motorizadoid = respuestaMotorizadoInfo.IdMotorizado;
                this.nombreMotorizado =
                  respuestaMotorizadoInfo.Nombres +
                  ' ' +
                  respuestaMotorizadoInfo.Apellidos;
                this.vehiculo = respuestaMotorizadoInfo.Vehiculo;
                this.vehiculoColor = respuestaMotorizadoInfo.VehiculoColor;
                this.vehiculoPlaca = respuestaMotorizadoInfo.VehiculoPlaca;
                this.telefonoMotorizado = respuestaMotorizadoInfo.Telefono;
                this.OnMostrarMotorizado();
              } catch (error) {}
            }

            switch (respuestaEstado.data.estado) {
              case 'PE': {
                try {
                  if (this.tieneSistema == 1) {
                    this.playAudio('preparado');
                  } else {
                    this.playAudio('aceptado');
                  }
                } catch (error) {
                  console.log('error');
                }
                break;
              }
              case 'PU': {
                try {
                  if (this.tieneSistema == 1) {
                    this.playAudio('camino');
                  } else {
                    this.playAudio('comprando');
                  }
                } catch (error) {
                  console.log('error');
                }
                break;
              }
              case 'UC': {
                try {
                  this.playAudio('llegado');
                } catch (error) {
                  console.log('error');
                }
                break;
              }
              default:
                break;
            }
          } else if (respuestaEstado.data.success == false) {
            this.navCtrl.navigateRoot('/principal', {
              animationDirection: 'forward',
            });
          }
        } catch (error) {
          const alert = await this.alertController.create({
            header: '¡Sin conexión!',
            backdropDismiss: false,
            message:
              'No se pudo obtener informacion por favor  conectese a internet y renicie la aplicación.  ',
            mode: 'ios',
            buttons: [
              {
                cssClass: 'primarybtn',
                text: 'Salir',
                handler: () => {
                  App.exitApp();
                },
              },
            ],
          });
          await alert.present();
        }
      });

    this.escucharPedidoCanceladoSubscription = this.accionesService
      .estadoPedidoCancelar()
      .subscribe((resp: any) => {
        if (resp['Estado'] || resp['Estado'] == 'C') {
          if (
            this.router.isActive('/ruta', true) &&
            this.router.url === '/ruta'
          ) {
            try {
              this.playAudio('cancelado');
            } catch (error) {
              console.log('error');
            }
            this.herramientasService.setEstado(null);
            this.navCtrl.navigateRoot('/principal/menu', {
              animationDirection: 'back',
            });
          }
        }
      });
  }

  cargarUbicacionMotorizado(lat: string, lon: string) {
    if (this.motorizadolayer !== undefined) {
      this.motorizadolayer.clearLayers();

      L.marker([Number(lat), Number(lon)], { icon: this.motoIcon })
        .addTo(this.motorizadolayer)
        .bindPopup('<b>Motorizado!</b>');
    }
  }

  actualizar() {
    this.fab?.close();
  }

  onSalir() {
    App.exitApp();
  }

  async abrirCarritoRuta() {
    const modal = await this.modalController.create({
      component: CarritorutaPage,
      componentProps: {
        dataPedido: this.dataPedido,
        DeliveryPrecio: parseFloat(this.dataPedido.PrecioDelivery),
        ProductosPrecio: parseFloat(this.dataPedido.PrecioProductos),
        Cambio: parseFloat(this.dataPedido.Cambio),
      },
      showBackdrop: true,
      animated: true,
      backdropDismiss: false,
    });

    modal.onWillDismiss().then((r) => {});

    return await modal.present();
  }

  async OnMostrarMotorizado() {
    const alert = await this.alertController.create({
      header: 'Motorizado',
      subHeader:
        this.vehiculo +
        ' : ' +
        this.vehiculoColor +
        ' (' +
        this.vehiculoPlaca +
        ')',
      backdropDismiss: false,
      message:
        'Hola mi nombre es  ' +
        this.nombreMotorizado +
        '   y estoy a cargo de su pedido, cualquier duda use el  CHAT   para comunicarnos. Gracias...',
      mode: 'ios',
      buttons: [
        {
          cssClass: 'primarybtn',
          text: 'Entendido',
        },
      ],
    });

    await alert.present();
  }

  async onCancelarPedido() {
    const alert = await this.alertController.create({
      header: 'Cancelar pedido',
      message:
        '¿Esta seguro de cancelar el pedido? Recuerde puede cancelar, cuando aun no se confirma con llamada.',
      backdropDismiss: false,
      mode: 'ios',
      buttons: [
        {
          cssClass: 'secondarybtn',
          text: 'No',
          handler: () => {
            console.log('Confirm Cancel: blah');
          },
        },
        {
          cssClass: 'primarybtn',
          text: 'Sí, lo cancelaré',
          handler: async () => {
            try {
              let respuestaCancelar = await this.dataService.postCancelarPedido(
                this.idPedido
              );

              if (respuestaCancelar.data.success == true) {
                this.accionesService.emitirCanceladoPedido(
                  this.idPedido,
                  respuestaCancelar.data.idEmpresa
                );
                this.herramientasService.setEstado(null);
                try {
                  this.playAudio('cancelado');
                } catch (error) {
                  console.log('error');
                }
                this.navCtrl.navigateRoot('/principal/menu', {
                  animationDirection: 'back',
                });
                this.mostrarMensajeBottom(
                  respuestaCancelar.data.msg,
                  2000,
                  'success'
                );
              } else if (respuestaCancelar.data.success == false) {
                this.mostrarMensajeBottom(
                  respuestaCancelar.data.msg,
                  2000,
                  'danger'
                );
              }
            } catch (error) {
              this.mostrarMensajeBottom(
                'No se puedo conectar, no tiene internet',
                4000,
                'danger'
              );
            }
          },
        },
      ],
    });

    await alert.present();
  }

  ionViewWillLeave() {
    this.estadoPedidoSubscription?.unsubscribe();
    this.escucharMotorizadoSubscription?.unsubscribe();
    this.mensajesSubscription?.unsubscribe();
    let doc = document.getElementById('weathermap');
    if (doc) {
      doc.innerHTML = '';
    }
  }

  ionViewDidEnter() {
    setTimeout(async () => {
      this.mymap2 = new L.map('mapid', {
        scrollWheelZoom: false,
        attributionControl: false,
        tap: false,
        doubleClickZoom: false,
      }).setView(new L.LatLng(-9.940175, -76.2417719), 5);
      new L.tileLayer(
        'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=' +
          environment.tokenMapa,
        {
          maxZoom: 19,
          id: 'mapbox/streets-v11',
          accessToken:
            'pk.eyJ1IjoicmVuem85MjIxIiwiYSI6ImNraDRhZ2NxbzA5eHEycW92d2Y1cGhldWUifQ.1zWCqGLtZfq_VSSWJx23Pg',
        }
      ).addTo(this.mymap2);
      this.clientelayer = L.layerGroup().addTo(this.mymap2);
      this.motorizadolayer = L.layerGroup().addTo(this.mymap2);
      this.empresa1layer = L.layerGroup().addTo(this.mymap2);
      this.empresa2layer = L.layerGroup().addTo(this.mymap2);
      this.empresa3layer = L.layerGroup().addTo(this.mymap2);

      this.banderaIcon = new L.Icon({
        iconUrl: '../assets/img/bandera2.png',
        shadowUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      this.casaIcon = new L.Icon({
        iconUrl: '../assets/img/casa.png',
        shadowUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      this.motoIcon = new L.Icon({
        iconUrl: '../assets/img/moto.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      let cliente = await this.storage.get('cliente');
      if (cliente == null) {
        this.navCtrl.navigateRoot('/login', { animationDirection: 'forward' });
        return;
      }

      try {
        let respuestaPedido = await this.dataService.getPedidoExisteDetalle(
          Number(cliente.IdCliente)
        );
        this.updateStateOrder(respuestaPedido);
        this.updateOrderInterval = setInterval(async () => {
          let respuestaPedido = await this.dataService.getPedidoExisteDetalle(
            Number(cliente.IdCliente)
          );
          this.updateStateOrder(respuestaPedido, true);
        }, 30000);
      } catch (error) {
        const alert = await this.alertController.create({
          header: '¡Sin conexión!',
          backdropDismiss: false,
          message:
            'No se pudo obtener informacion por favor  conectese a internet y renicie la aplicación.  ',
          mode: 'ios',
          buttons: [
            {
              cssClass: 'primarybtn',
              text: 'Salir',
              handler: () => {
                App.exitApp();
              },
            },
          ],
        });
        await alert.present();
      }
    }, 500);
  }

  updateStateOrder(respuestaPedido: any, newCurrentStatus = false) {
    if (respuestaPedido.data.success == true) {
      let respuestaPedidoInfo = respuestaPedido.data.data;
      this.motorizadoid = respuestaPedidoInfo.IdMotorizado;
      this.idPedido = respuestaPedidoInfo.IdPedido;
      this.idCliente = respuestaPedidoInfo.IdCliente;
      this.nombreMotorizado =
        respuestaPedidoInfo.Motorizado.Nombres +
        ' ' +
        respuestaPedidoInfo.Motorizado.Apellidos;
      this.vehiculo = respuestaPedidoInfo.Motorizado.Vehiculo;
      this.vehiculoColor = respuestaPedidoInfo.Motorizado.VehiculoColor;
      this.vehiculoPlaca = respuestaPedidoInfo.Motorizado.VehiculoPlaca;
      this.telefonoMotorizado = respuestaPedidoInfo.Motorizado.Telefono;
      this.mensajes =
        respuestaPedidoInfo.Chat != null && respuestaPedidoInfo.Chat != ''
          ? JSON.parse(respuestaPedidoInfo.Chat)
          : [];
      this.dataPedido = respuestaPedidoInfo;
      this.herramientasService.setEstado(respuestaPedidoInfo.Estado);

      this.ubi_lat_cliente = respuestaPedidoInfo.Latitud;
      this.ubi_lon_cliente = respuestaPedidoInfo.Longitud;
      this.idpedido = respuestaPedidoInfo.IdPedido;
      this.precio_delivery = respuestaPedidoInfo.PrecioDelivery;
      this.precio_productos = respuestaPedidoInfo.PrecioProductos;
      this.ubi_referencia = respuestaPedidoInfo.Referencia;
      this.cargarMapaEmpresa(respuestaPedidoInfo.Empresa);
      this.cargarUbicacionCliente(this.ubi_lat_cliente, this.ubi_lon_cliente);

      this.empresasCoord = respuestaPedidoInfo.Empresa;
      this.tieneSistema = respuestaPedidoInfo.Empresa.TieneSistema;
      this.cargarEmpresasMapa();

      if (newCurrentStatus) {
        if (this.currentStatus !== respuestaPedidoInfo.Estado) {
          this.currentStatus = respuestaPedidoInfo.Estado
        } else {
          return
        }
      }

      switch (respuestaPedidoInfo.Estado) {
        case 'PE': {
          try {
            if (this.tieneSistema == 1) {
              this.playAudio('preparado');
            } else {
              this.playAudio('aceptado');
            }
          } catch (error) {
            console.log('error');
          }
          break;
        }
        case 'PU': {
          try {
            if (this.tieneSistema == 1) {
              this.playAudio('camino');
            } else {
              this.playAudio('comprando');
            }
          } catch (error) {
            console.log('error');
          }
          break;
        }
        case 'UC': {
          try {
            this.playAudio('llegado');
          } catch (error) {
            console.log('error');
          }
          break;
        }
        default:
          break;
      }
    } else if (respuestaPedido.data.success == false) {
      this.navCtrl.navigateRoot('/principal', {
        animationDirection: 'forward',
      });
    }
  }

  cargarMapaEmpresa(empresa: any) {
    try {
      this.mymap2.flyTo(
        new L.LatLng(Number(empresa.Latitud), Number(empresa.Longitud)),
        13.5
      );
    } catch (error) {
      console.log('error');
    }
  }

  async getPedidoExistente() {
    let cliente = await this.storage.get('cliente');
    if (cliente == null) {
      this.navCtrl.navigateRoot('/login', { animationDirection: 'forward' });
      return;
    }

    try {
      let respuestaPedido = await this.dataService.getPedidoExisteDetalle(
        Number(cliente.IdCliente)
      );
      if (respuestaPedido.data.success == true) {
        let respuestaPedidoInfo = respuestaPedido.data.data;
        this.motorizadoid = respuestaPedidoInfo.IdMotorizado;
        this.idPedido = respuestaPedidoInfo.IdPedido;
        this.idCliente = respuestaPedidoInfo.IdCliente;
        this.nombreMotorizado =
          respuestaPedidoInfo.Motorizado.Nombres +
          ' ' +
          respuestaPedidoInfo.Motorizado.Apellidos;
        this.vehiculo = respuestaPedidoInfo.Motorizado.Vehiculo;
        this.vehiculoColor = respuestaPedidoInfo.Motorizado.VehiculoColor;
        this.vehiculoPlaca = respuestaPedidoInfo.Motorizado.VehiculoPlaca;
        this.telefonoMotorizado = respuestaPedidoInfo.Motorizado.Telefono;
        this.mensajes =
          respuestaPedidoInfo.Chat != null && respuestaPedidoInfo.Chat != ''
            ? JSON.parse(respuestaPedidoInfo.Chat)
            : [];
        this.dataPedido = respuestaPedidoInfo;
        this.precio_delivery = respuestaPedidoInfo.PrecioDelivery;
        this.precio_productos = respuestaPedidoInfo.PrecioProductos;
        this.ubi_referencia = respuestaPedidoInfo.Referencia;
        this.tieneSistema = respuestaPedidoInfo.Empresa.TieneSistema;
        this.herramientasService.setEstado(respuestaPedidoInfo.Estado);
        switch (respuestaPedidoInfo.Estado) {
          case 'PE': {
            try {
              if (this.tieneSistema == 1) {
                this.playAudio('preparado');
              } else {
                this.playAudio('aceptado');
              }
            } catch (error) {
              console.log('error');
            }
            break;
          }
          case 'PU': {
            try {
              if (this.tieneSistema == 1) {
                this.playAudio('camino');
              } else {
                this.playAudio('comprando');
              }
            } catch (error) {
              console.log('error');
            }
            break;
          }
          case 'UC': {
            try {
              this.playAudio('llegado');
            } catch (error) {
              console.log('error');
            }
            break;
          }
          default:
            break;
        }
      } else if (respuestaPedido.data.success == false) {
        this.navCtrl.navigateRoot('/principal', {
          animationDirection: 'forward',
        });
      }
    } catch (error) {
      console.log('error');
    }
  }

  async mostrarLoader(mensaje: string) {
    this.loaderToShow = await this.loadingController.create({
      message: mensaje,
      spinner: 'circles',
      backdropDismiss: false,
      mode: 'ios',
    });
    this.loaderToShow.present();
  }

  ocultarLoader() {
    this.loaderToShow.dismiss();
  }

  cargarUbicacionCliente(lat: string, lon: string) {
    //this.mymap2.flyTo(new L.LatLng(-9.940175, -76.2417719), 13.5);
    if (this.clientelayer !== undefined) {
      this.clientelayer.clearLayers();

      L.marker([Number(lat), Number(lon)], { icon: this.casaIcon })
        .addTo(this.clientelayer)
        .bindPopup('<b>Mi Ubicacion!</b>');
    }
  }

  cargarEmpresasMapa() {
    if (this.empresa1layer !== undefined) {
      this.empresa1layer.clearLayers();
      L.marker([this.empresasCoord.Latitud, this.empresasCoord.Longitud])
        .addTo(this.empresa1layer)
        .bindTooltip('<b>' + this.empresasCoord.RazonSocial + '</b>')
        .openTooltip();
    }
  }

  async abrirChat() {
    const modal = await this.modalController.create({
      component: ChatPage,
      componentProps: {
        mensajes: this.mensajes,
        idMotorizado: this.motorizadoid,
        idPedido: this.idPedido,
        nombreMotorizado: this.nombreMotorizado,
        mensajesSinLeer: this.mensajesSinLeer,
        telefonoMotorizado: this.telefonoMotorizado,
      },
      showBackdrop: true,
      animated: true,
      backdropDismiss: false,
    });

    modal.onWillDismiss().then((r) => {
      this.mensajesSinLeer = 0;
    });

    return await modal.present();
  }

  async mostrarMensajeBottom(mensaje: string, duracion: number, color: string) {
    const toast = await this.toastController.create({
      message: ' ' + mensaje + '  ',
      duration: duracion,
      position: 'bottom',
      mode: 'ios',
      color: color,
      buttons: [
        {
          icon: 'close',
          role: 'cancel',
          handler: () => {
            // console.log('Cancel clicked');
          },
        },
      ],
    });
    await toast.present();
  }

  playAudio(name: string) {
    const track = this.audioTracks.find((t) => t.name === name);
    if (track) {
      track.audio.play();
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.updateOrderInterval);
  }
}
