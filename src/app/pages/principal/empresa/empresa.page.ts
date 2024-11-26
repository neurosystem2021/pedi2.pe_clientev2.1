import { ChangeDetectorRef, Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import {
  NavController,
  ModalController,
  LoadingController,
  ToastController,
  AlertController,
} from '@ionic/angular';
import { NavegacionService } from 'src/app/services/navegacion.service';
import { CarritoService } from '../../../services/carrito.service';
import { DataService } from 'src/app/services/data.service';
import { CarritoPage } from 'src/app/modals/carrito/carrito.page';
import { ProductoDetallePage } from 'src/app/modals/producto-detalle/producto-detalle.page';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
import { MapaPage } from 'src/app/modals/mapa/mapa.page';
import { SpeechRecognition } from "@capacitor-community/speech-recognition";

@Component({
  selector: 'app-empresa',
  templateUrl: './empresa.page.html',
  styleUrls: ['./empresa.page.scss'],
})
export class EmpresaPage implements OnInit{
  empresa: any = {};
  loaderToShow: any;
  estadoCarga: boolean = false;
  existeProductos: boolean = false;
  categoriaMenu: any = [];
  IdProductoCategoria: any = null;
  productos: any = [];
  cargando: boolean = false;
  proSelect: any = {};
  efectoAgregar: boolean = false;
  myPane: any;
  abiertoEmpresa: boolean = false;
  agregado: number = 0;
  busqueda: string = '';
  alertaBusqueda: boolean = false;
  scrollDemo: any;
  recording: boolean = false;
  text: any = ''

  //@ViewChild('scrollHorizontal', { static: false }) ionContenido: ElementRef;
  constructor(
    public navCtrl: NavController,
    public navegacionService: NavegacionService,
    public modalController: ModalController,
    public carritoService: CarritoService,
    public loadingController: LoadingController,
    public dataService: DataService,
    public toastController: ToastController,
    public alertController: AlertController,
    private statusBar: StatusBar,
    public element: ElementRef,
    public renderer: Renderer2,
    public changeDetectorRef: ChangeDetectorRef
  ) {
    this.statusBar.backgroundColorByHexString('#FBFBFB');
    this.statusBar.styleDefault();
  }

  ngOnInit(): void {
    SpeechRecognition.requestPermissions();
  }
  
  async startRecognition() {
    const {available} = await SpeechRecognition.available();
    if (available) {
      this.recording = true;
      SpeechRecognition.start({
        language: "es-ES",
        partialResults: true,
        popup: false,
      });

      SpeechRecognition.addListener("partialResults", (data: any) => {
        if (data.matches && data.matches.length > 0) {
          const text = {
            detail: {
              value: data.matches[0]
            }
          }
          this.buscarProducto(text);
          this.busqueda = data.matches[0];
          this.changeDetectorRef.detectChanges(); 
        }
      });
    }

  }

  async stopRecognition(){
    this.recording = false;
    await SpeechRecognition.stop();
  }

  async ionViewWillEnter() {
    if (this.navegacionService.getEmpresa() == null) {
      this.navCtrl.navigateRoot('/principal/categoria', {
        animationDirection: 'back',
      });
      return;
    }

    this.empresa = await this.navegacionService.getEmpresa();
    try {
      this.cargando = false;
      let respuestaConsulta = await this.dataService.getConsultaSistema(
        this.empresa.IdEmpresa
      );
      if (respuestaConsulta.data.success == true) {
        this.empresa.TieneSistema = respuestaConsulta.data.data;
        this.empresa.FacturaUrl = respuestaConsulta.data.url;
        this.cargarCategorias();
      } else {
        this.cargando = true;
      }
    } catch (error) {
      this.cargando = false;
    }
    //this.cargarCategorias();
    this.abiertoEmpresa = this.verificarHora(
      this.empresa.HorarioInicio,
      this.empresa.HorarioFin
    );
    if (!this.abiertoEmpresa) {
      this.mostrarMensajeBottom(
        '¡La empresa está cerrada! Solo puede visualizar los productos',
        5000,
        'warning'
      );
    }
    //this.renderer.setStyle(this.header['el'], 'webkitTransition', 'top 1000ms');
    //this.renderer.setStyle(this.ionContenido['el'], 'webkitTransition', 'top 1000ms');
  }

  async abrirCarrito() {
    const modal = await this.modalController.create({
      component: CarritoPage,
      componentProps: {},
    });

    modal.onDidDismiss().then((dataReturned) => {
      if (dataReturned !== null) {
        // console.log('Modal Sent Data :' + dataReturned.data);
      }
    });

    return await modal.present();
    //fin de modal
  }

  verificarExistencia(idproducto: number) {
    return this.carritoService
      .obtenerPedidos()
      .some(
        (pedido) =>
          pedido.IdProducto === idproducto &&
          pedido.IdEmpresa === this.empresa.IdEmpresa
      );
  }

  async cargarProducto(
    idProductoCategoria: number,
    ProductoCategoria: string,
    esOferta: number
  ) {
    this.IdProductoCategoria = null;
    this.productos = [];
    setTimeout(async () => {
      this.cargando = false;
      this.productos = [];
      this.IdProductoCategoria = idProductoCategoria;

      try {
        let resultadoProductos;
        if (esOferta == 1) {
          resultadoProductos = await this.dataService.getProductosUrlOferta(
            idProductoCategoria,
            this.empresa.FacturaUrl,
            this.empresa.TieneSistema
          );
        } else {
          resultadoProductos = await this.dataService.getProductosUrl(
            idProductoCategoria,
            this.empresa.FacturaUrl,
            this.empresa.TieneSistema
          );
        }
        this.productos = resultadoProductos.data;
        this.cargando = true;
      } catch (error) {
        this.productos = [];
        this.cargando = true;
      }
    }, 300);
  }

  async cargarCategorias() {
    try {
      let respuestaCategorias = await this.dataService.getCategoriasUrl(
        this.empresa.IdEmpresa,
        this.empresa.FacturaUrl,
        this.empresa.TieneSistema
      );
      if (respuestaCategorias.data) {
        this.categoriaMenu = respuestaCategorias.data;
        if (this.categoriaMenu.length != 0) {
          this.IdProductoCategoria = this.categoriaMenu[0].IdProductoCategoria;
          this.cargarProducto(
            this.categoriaMenu[0].IdProductoCategoria,
            this.categoriaMenu[0].ProductoCategoria,
            this.categoriaMenu[0].EsOferta
          );
          const btnRight: any = document.getElementById('btnRight');
          const btnLeft: any = document.getElementById('btnLeft');
          this.scrollDemo = document.querySelector('#scrollHorizontal');
          this.scrollDemo.addEventListener(
            'scroll',
            (event: any) => {
              if (event.target['scrollLeft'] == 0) {
                btnLeft.style.display = 'none';
              } else {
                btnLeft.style.display = 'block';
              }
              if (
                Math.trunc(
                  event.target['scrollWidth'] - event.target['clientWidth']
                ) == Math.trunc(event.target['scrollLeft'])
              ) {
                btnRight.style.display = 'none';
              } else {
                btnRight.style.display = 'block';
              }
            },
            { passive: true }
          );
        } else {
          this.cargando = true;
        }
      } else {
        this.cargando = true;
      }
    } catch (error) {
      this.cargando = true;
    }
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
          handler: () => {},
        },
      ],
    });
    await toast.present();
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

  filtro(categoria_menu: string) {
    return this.productos.filter(
      (producto: any) => producto.categoria_menu == categoria_menu
    );
  }

  mostrarMenu(index: number) {
    if (this.categoriaMenu[index].mostrar == true) {
      this.categoriaMenu[index].mostrar = false;
    } else {
      this.categoriaMenu[index].mostrar = true;
    }
  }
  async ionViewWillLeave() {
    this.productos = [];
    try {
      const element = await this.loadingController.getTop();
      if (element) {
        this.loadingController.dismiss();
      }
    } catch (error) {}
  }

  onIrCategoria() {
    this.navCtrl.navigateRoot('/principal/categoria', {
      animationDirection: 'back',
    });
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

  async onVerProducto(producto: any) {
    if (
      this.verificarExistencia(producto.IdProducto) ||
      !this.verificarHora(this.empresa.HorarioInicio, this.empresa.HorarioFin)
    ) {
    } else {
      //abrir modal
      producto.Cantidad = 1;
      producto.Indicacion = '';
      producto.VerMas = 0;
      const modal = await this.modalController.create({
        component: ProductoDetallePage,
        componentProps: {
          producto: producto,
          empresa: this.empresa,
        },
      });

      modal.onDidDismiss().then((dataReturned) => {
        if (dataReturned.data !== null && dataReturned.data !== undefined) {
          this.agregado = dataReturned.data;
          setTimeout(() => {
            this.efectoAgregar = true;
            this.agregado = 0;
            setTimeout(() => {
              this.efectoAgregar = false;
            }, 2500);
          }, 2000);
        }
      });

      return await modal.present();
      //fin de modal
    }
  }

  async abrirMapa() {
    const modal = await this.modalController.create({
      component: MapaPage,
      componentProps: {
        lon: this.empresa.Longitud,
        lat: this.empresa.Latitud,
        razonSocial: this.empresa.RazonSocial,
        direccion: this.empresa.Direccion,
        distrito: this.empresa.DistritoUbicacion,
        horarioInicio: this.empresa.HorarioInicio,
        horarioFin: this.empresa.HorarioFin,
      },
    });

    modal.onDidDismiss().then((dataReturned) => {
      if (dataReturned !== null) {
        // console.log('Modal Sent Data :' + dataReturned.data);
      }
    });

    return await modal.present();
    //fin de modal
  }

  cargarBusqueda(pos: any, cat: any) {
    this.busqueda = '';
    this.IdProductoCategoria = pos;
    this.productos = [];
    this.alertaBusqueda = true;
    setTimeout(() => {
      this.alertaBusqueda = false;
    }, 2000);
  }

  async buscarProducto(e: any) {
    if (e.detail.value.trim() != '') {
      this.cargando = false;
      this.productos = [];
      //this.ionContenido.scrollToTop(100);
      let scroll = document.getElementById('scroll');
      if (scroll) {
        scroll.scrollIntoView();
      }
      try {
        let resultadoProductos = await this.dataService.getProductosUrlBusqueda(
          e.detail.value,
          this.empresa.IdEmpresa,
          this.empresa.FacturaUrl,
          this.empresa.TieneSistema
        );
        this.productos = resultadoProductos.data;
        this.cargando = true;
      } catch (error) {
        this.productos = [];
        this.cargando = true;
      }
    }
  }

  onLimpiarBusqueda(e: any) {
    this.cargando = true;
    this.productos = [];
    this.busqueda = '';
  }

  ngOnDestroy() {
    if (this.scrollDemo) {
      this.scrollDemo.removeEventListener('scroll', () => {});
    }
  }
}
