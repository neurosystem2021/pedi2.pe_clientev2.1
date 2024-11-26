import { Component, OnInit } from '@angular/core';
import {
  AlertController,
  LoadingController,
  ModalController,
  ToastController,
} from '@ionic/angular';
import { Storage } from '@ionic/storage';
import {
  NativeGeocoder,
  NativeGeocoderResult,
  NativeGeocoderOptions,
} from '@awesome-cordova-plugins/native-geocoder/ngx';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { LocationAccuracy } from '@awesome-cordova-plugins/location-accuracy/ngx';
import { Geolocation } from '@capacitor/geolocation';

import { PedidoModel } from 'src/app/modelos/pedido.model';
import { CarritoService } from 'src/app/services/carrito.service';
import { DataService } from 'src/app/services/data.service';
import { environment } from 'src/environments/environment';
import { AudioTrack } from 'src/app/interface/audioTrack.interface';
declare let L: any;

@Component({
  selector: 'app-ubicar',
  templateUrl: './ubicar.page.html',
  styleUrls: ['./ubicar.page.scss'],
})
export class UbicarPage implements OnInit {
  mymap: any;
  casaIcon: any;
  cliente: any;
  longitude: any = null;
  latitude: any = null;
  options = {
    timeout: 10000,
    enableHighAccuracy: true,
    maximumAge: 0,
  };
  ciudadBusqueda: string = '';
  direccion: string = '';
  referencia: string = '';
  empresalayer: any;
  clientelayer: any;
  loaderToShow!: HTMLIonLoadingElement;
  public pedidos: PedidoModel[] = [];
  latitudEmpresa: number | null = null;
  longitudEmpresa: number | null = null;
  razonSocialEmpresa: string | null = null;
  public direccionAlerta: boolean = false;
  public referenciaAlerta: boolean = false;
  public latlonAlerta: boolean = false;
  public distrito: string = '';
  public provincia: string = '';
  public departamento: string = '';
  audioTracks: AudioTrack[] = [
    { name: 'inicioubicar', audio: new Audio('assets/audio/ubicar/inicioubicar.mp3') },
    { name: 'latlon', audio: new Audio('assets/audio/ubicar/latlon.mp3') },
    { name: 'completedir', audio: new Audio('assets/audio/ubicar/completedir.mp3') },
    { name: 'indiqueref', audio: new Audio('assets/audio/ubicar/indiqueref.mp3') },
    { name: 'confirmedir', audio: new Audio('assets/audio/ubicar/confirmedir.mp3') },
  ];

  constructor(
    private modalController: ModalController,
    private nativeGeocoder: NativeGeocoder,
    public toastController: ToastController,
    private androidPermissions: AndroidPermissions,
    private locationAccuracy: LocationAccuracy,
    public loadingController: LoadingController,
    public alertController: AlertController,
    public carritoService: CarritoService,
    private dataService: DataService,
    private storage: Storage,
  ) {}

  ngOnInit() {}

  async ionViewWillEnter() {}

  //Inicio de Ubicacion
  getCurrentCoordinates() {
    this.checkGPSPermission();
  }

  async cargarMiUbicacion() {
    this.loaderToShow = await this.loadingController.create({
      message: 'Buscando ubicación...',
      spinner: 'crescent',
      backdropDismiss: false,
      mode: 'ios',
    });
    this.loaderToShow.present();
    try {
      const coordinates = await Geolocation.getCurrentPosition({enableHighAccuracy: true});
      this.latitude = coordinates.coords.latitude;
      this.longitude = coordinates.coords.longitude;
      this.mymap.flyTo(new L.LatLng(this.latitude, this.longitude), 18, {
        animate: true,
        duration: 2,
      });
      this.cargarMapa(this.latitude, this.longitude);
      this.obtenerDireccionforLatLng();
      this.loaderToShow.dismiss();
      setTimeout(() => {
        this.verificarUbicacion();
      }, 200);
    } catch (error) {
      this.latitude = null;
      this.longitude = null;
      this.loaderToShow.dismiss();
    }
  }

  async verificarUbicacion() {
    this.loaderToShow = await this.loadingController.create({
      message: 'Verificando ubicación...',
      spinner: 'crescent',
      backdropDismiss: false,
      mode: 'ios',
    });
    this.loaderToShow.present();

    try {
      const coordinates = await Geolocation.getCurrentPosition({enableHighAccuracy: true});
      this.latitude = coordinates.coords.latitude;
      this.longitude = coordinates.coords.longitude;
      this.mymap.flyTo(new L.LatLng(this.latitude, this.longitude), 18, {
        animate: true,
        duration: 2,
      });
      this.cargarMapa(this.latitude, this.longitude);
      this.obtenerDireccionforLatLng();
      setTimeout(() => {
        this.loaderToShow.dismiss();
      }, 500);
    } catch (error) {
      this.latitude = null;
      this.longitude = null;
      this.loaderToShow.dismiss();
    }
  }

  checkGPSPermission() {
    this.androidPermissions
      .checkPermission(
        this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION
      )
      .then(
        (result) => {
          if (result.hasPermission) {
            //If having permission show 'Turn On GPS' dialogue
            this.askToTurnOnGPS();
          } else {
            //If not having permission ask for permission
            this.requestGPSPermission();
          }
        },
        (err) => {
          // alert(err);
        }
      )
      .catch((error) => {
        this.verificacionGPS();
      });
  }

  requestGPSPermission() {
    this.locationAccuracy.canRequest().then((canRequest: boolean) => {
      if (canRequest) {
      } else {
        //Show 'GPS Permission Request' dialogue
        this.androidPermissions
          .requestPermission(
            this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION
          )
          .then(
            () => {
              // call method to turn on GPS
              this.askToTurnOnGPS();
            },
            (error) => {
              this.verificacionGPS();
              //Show alert if user click on 'No Thanks'
              //alert('requestPermission Error requesting location permissions ' + error)
            }
          )
          .catch((error) => {
            this.verificacionGPS();
          });
      }
    });
  }

  askToTurnOnGPS() {
    this.locationAccuracy
      .request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY)
      .then(
        () => {
          this.cargarMiUbicacion();
        },

        (error: any) => {
          this.verificacionGPS();
        }
      )
      .catch((error: any) => {
        this.verificacionGPS();
      });
  }

  async verificacionGPS() {
    const alert = await this.alertController.create({
      header: '¡Requerido!',
      message: 'La Aplicacion nesecita usar GPS, porfavor activelo!',
      backdropDismiss: false,
      mode: 'ios',
      buttons: [
        {
          cssClass: 'secondarybtn',
          text: 'Atrás',
          handler: () => {
            this.closeModal();
          },
        },
        {
          cssClass: 'primarybtn',
          text: 'Activar',
          handler: async () => {
            this.checkGPSPermission();
          },
        },
      ],
    });

    await alert.present();
  }
  //Cargar el mapa cuando se ingrese a la vista
  async ionViewDidEnter() {
    try {
      this.playAudio('inicioubicar');
    } catch (error) {
      console.log('error');
    }
    this.latlonAlerta = true;
    setTimeout(() => {
      this.latlonAlerta = false;
      this.direccionAlerta = true;
      this.referenciaAlerta = true;
      setTimeout(() => {
        this.direccionAlerta = false;
        this.referenciaAlerta = false;
      }, 4000);
    }, 5000);
    this.pedidos = this.carritoService.obtenerPedidos();
    if (this.pedidos.length > 0) {
      this.latitudEmpresa = this.pedidos[0].Latitud;
      this.longitudEmpresa = this.pedidos[0].Longitud;
      this.razonSocialEmpresa = this.pedidos[0].RazonSocial;
    }

    try {
      setTimeout(() => {
        this.mymap = new L.map('mapid', {
          attributionControl: false,
          scrollWheelZoom: false,
          doubleClickZoom: false,
        }).setView(
          [
            this.latitudEmpresa || -9.929611,
            this.longitudEmpresa || -76.239687,
          ],
          13
        );
        L.tileLayer(
          'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=' +
            environment.tokenMapa,
          {
            maxZoom: 22,
            id: 'mapbox/streets-v11',
            accessToken:
              'pk.eyJ1IjoicmVuem85MjIxIiwiYSI6ImNraDRhZ2NxbzA5eHEycW92d2Y1cGhldWUifQ.1zWCqGLtZfq_VSSWJx23Pg',
          }
        ).addTo(this.mymap);

        this.cliente = L.layerGroup().addTo(this.mymap);
        this.empresalayer = L.layerGroup().addTo(this.mymap);

        this.mymap.closePopup();
        if (this.empresalayer !== undefined) {
          this.empresalayer.clearLayers();
          L.marker([this.latitudEmpresa, this.longitudEmpresa])
            .addTo(this.empresalayer)
            .bindTooltip('<b>' + this.razonSocialEmpresa + '</b>')
            .openTooltip();
        }

        this.casaIcon = new L.Icon({
          iconUrl: '../assets/img/casa.png',
          shadowUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        });

        this.mymap.on('click', (e: any) => {
          //console.log(e.latlng.lat, e.latlng.lng);
          this.latitude = e.latlng.lat;
          this.longitude = e.latlng.lng;
          this.cargarMapa(e.latlng.lat, e.latlng.lng);
          this.obtenerDireccionforLatLng();
        });
      }, 500);
    } catch (error) {}
  }

  //Dibujar un icono en la ubicación del cliente
  cargarMapa(lattitude: number, longitude: number) {
    if (this.cliente !== undefined) {
      this.cliente.clearLayers();
      L.marker([lattitude, longitude], { icon: this.casaIcon }).addTo(
        this.cliente
      );
    }
  }

  //Obtener las coordenadas de una ubicación a través del nombre ingresado en el buscador
  obtenerCoordsfFromName() {
    let options: NativeGeocoderOptions = {
      useLocale: true,
      maxResults: 5,
    };
    this.nativeGeocoder
      .forwardGeocode(this.ciudadBusqueda, options)
      .then((result: NativeGeocoderResult[]) => {
        console.log(result);
        
        this.latitude = result[0].latitude;
        this.longitude = result[0].longitude;
        this.mymap.flyTo(new L.LatLng(this.latitude, this.longitude), 18, {
          animate: true,
          duration: 2,
        });
        this.cargarMapa(this.latitude, this.longitude);
        this.obtenerDireccionforLatLng();
      })
      .catch((error: any) => {
        console.log(error);
        
        this.latitude = null;
        this.longitude = null;
      });
  }

  //Obetener dirección a través de las coordenadas(Latitud, Longitud)
  obtenerDireccionforLatLng() { // TODO
    let nativeGeocoderOptions: NativeGeocoderOptions = {
      useLocale: true,
      maxResults: 5,
    };
    this.nativeGeocoder
      .reverseGeocode(this.latitude, this.longitude, nativeGeocoderOptions)
      .then((res: NativeGeocoderResult[]) => {
        console.log(res);
        
        //Jr - Número - Distrito - Provincia
        //this.direccion = res[0].thoroughfare + " " + res[0].subThoroughfare + " - " + res[0].locality  + " , " +res[0].subAdministrativeArea+" , "+res[0].administrativeArea;
        this.direccion =
          res[0].thoroughfare +
          ' ' +
          res[0].subThoroughfare +
          ' - ' +
          res[0].locality;
        this.distrito = res[0].locality;
        this.provincia = res[0].subAdministrativeArea;
        this.departamento = res[0].administrativeArea;
        this.direccionAlerta = true;
        setTimeout(() => {
          this.direccionAlerta = false;
        }, 4000);
      })
      .catch((error: any) => {
        console.log(error);
        
        //alert('Error getting location'+ JSON.stringify(error));
      });
  }

  //Dar formato a la dirección obtenida a través de la función obtenerDireccionforLatLng()
  pretifyAddress(address: any) {
    let obj = [];
    let data = '';
    for (let key in address) {
      obj.push(address[key]);
    }
    obj.reverse();
    for (let val in obj) {
      if (obj[val].length) data += obj[val] + ', ';
    }
    return address.slice(0, -2);
  }
  //Cerrar el modal y pasar la nueva dirección al input dirección de la vista anterior
  async toAccept() {
    this.direccion = ('' + this.direccion).replace(new RegExp("'", 'g'), '');
    this.direccion = ('' + this.direccion).replace(new RegExp('"', 'g'), '');
    this.direccion = ('' + this.direccion).replace(new RegExp('\n', 'g'), '');
    this.direccion = ('' + this.direccion).replace(
      new RegExp('\\'.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'),
      ''
    );

    this.referencia = ('' + this.referencia).replace(new RegExp("'", 'g'), '');
    this.referencia = ('' + this.referencia).replace(new RegExp('"', 'g'), '');
    this.referencia = ('' + this.referencia).replace(new RegExp('\n', 'g'), '');
    this.referencia = ('' + this.referencia).replace(
      new RegExp('\\'.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'),
      ''
    );

    if (this.latitude == null || this.longitude == null) {
      this.latlonAlerta = true;
      setTimeout(() => {
        this.latlonAlerta = false;
      }, 6000);
      try {
        this.playAudio('latlon');
      } catch (error) {
        console.log('error');
      }
      await this.mostrarMensajeTop(
        'Por favor seleccione un punto en el mapa o use el botón azul para obtener su ubicación.',
        4000,
        'warning'
      );
      return;
    }

    if (('' + this.direccion).trim() == '') {
      this.direccionAlerta = true;
      setTimeout(() => {
        this.direccionAlerta = false;
      }, 4000);
      try {
        this.playAudio('completedir');
      } catch (error) {
        console.log('error');
      }
      await this.mostrarMensajeTop(
        'Por favor complete su dirección.',
        4000,
        'warning'
      );
      return;
    }
    /*
    if((''+this.referencia).trim()==''){
      this.referenciaAlerta=true;
      setTimeout(() => {
        this.referenciaAlerta=false;
      }, 4000);
      try {
        this.playAudio('indiqueref');
      } catch (error) {
        console.log("error");
      }
      await this.mostrarMensajeTop('Por favor, indique alguna referencia.',4000,'warning')
      return;
    }*/

    try {
      this.playAudio('confirmedir');
    } catch (error) {
      console.log('error');
    }

    const alert = await this.alertController.create({
      header: 'Confirme su nueva dirección',
      message:
        'Se agregará la dirección:  ' +
        this.direccion.toUpperCase() +
        '   y ' +
        (('' + this.referencia).trim() == ''
          ? '   Sin referencia   '
          : ' referencia:  ' + this.referencia.toUpperCase() + '  ') +
        ' ¿Es correcto?',
      mode: 'ios',
      buttons: [
        {
          cssClass: 'secondarybtn',
          text: 'No, Editar',
          handler: () => {
            this.direccionAlerta = true;
            setTimeout(() => {
              this.direccionAlerta = false;
            }, 2000);
            this.referenciaAlerta = true;
            setTimeout(() => {
              this.referenciaAlerta = false;
            }, 2000);
          },
        },
        {
          cssClass: 'primarybtn',
          text: 'Sí, agregar',
          handler: async () => {
            alert.dismiss();
            let cliente = await this.storage.get('cliente');
            if (cliente !== null) {
              let dataDireccion = {
                IdCliente: cliente.IdCliente,
                Direccion: this.direccion.toUpperCase(),
                Referencia: this.referencia.toUpperCase(),
                Latitud: this.latitude,
                Longitud: this.longitude,
                Distrito: this.distrito.toUpperCase(),
                Provincia: this.provincia.toUpperCase(),
                Departamento: this.departamento.toUpperCase(),
              };
              try {
                let respuestaDireccion =
                  await this.dataService.postNuevaDireccion(dataDireccion);
                if (respuestaDireccion.data.success == true) {
                  await this.modalController.dismiss({
                    latitude: dataDireccion.Latitud,
                    longitude: dataDireccion.Longitud,
                    direccion: dataDireccion.Direccion,
                    referencia: dataDireccion.Referencia,
                  });
                  await this.mostrarMensajeTop(
                    'Su dirección fue guardada y actualizada...',
                    2000,
                    'success'
                  );
                }
              } catch (error: any) {
                this.mostrarMensajeTop(error, 2000, 'danger');
              }
            }
          },
        },
      ],
    });

    await alert.present();
  }

  //Cerrar el modal sin realizar ningún cambio
  closeModal() {
    this.modalController.dismiss(null);
  }

  async mostrarMensajeTop(mensaje: string, duracion: number, color: string) {
    const toast = await this.toastController.create({
      message: ' ' + mensaje + '  ',
      duration: duracion,
      position: 'top',
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
    const track = this.audioTracks.find(t => t.name === name);
    if (track) {
      track.audio.play();
    }
  }
}
