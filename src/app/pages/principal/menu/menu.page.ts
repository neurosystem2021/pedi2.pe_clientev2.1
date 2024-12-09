import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NavController, ModalController, ActionSheetController, ToastController, AlertController } from '@ionic/angular';
import { NavegacionService } from 'src/app/services/navegacion.service';
import { NotificacionesPage } from 'src/app/modals/notificaciones/notificaciones.page';
import { DataService } from 'src/app/services/data.service';
import { HerramientasService } from 'src/app/services/herramientas.service';
import { CarritoService } from 'src/app/services/carrito.service';
import { CarritoPage } from 'src/app/modals/carrito/carrito.page';
import { AccionesService } from 'src/app/services/acciones.service';
import { Storage } from '@ionic/storage';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
import { WebsocketService } from 'src/app/services/websocket.service';
import {FCM} from '@awesome-cordova-plugins/fcm';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage implements OnInit {
  //@ViewChild('slideAnuncio', { static: false }) slidePresentacion: IonSlides;
  slideOpts = {
    initialSlide: 0,
    slidesPerView: 1,
    spaceBetween: 10,
    autoplay: true,
    speed:500

  };
  nombres = '';
  departamentos:any = [];
  departamentoSelect:any = null;
  anuncios:any = [];
  anuncioCarga:boolean = true;
  categoriaMenu:any = [];
  CategoriaCorrecto:boolean = true;


  idCategoria: any = null;
  nombreCategoria: any = null;
  loaderToShow!: HTMLIonLoadingElement;
  empresas:any = [];
  showListEmpresas:any = [];
  ShowListEmpresaAll:any = [];

  estadoCarga: boolean = false;
  existeEmpresas: boolean = false;
  subCategoria:any = [];
  cargaCompleta:boolean = false;
  recording = false;
  busqueda = '';
  openSearchVoiceStatus = false;

  constructor(public navCtrl: NavController,
    public navegacionService:NavegacionService,
    public modalController:ModalController,
    public herramientasService:HerramientasService,
    public carritoService:CarritoService,
    public accionesService:AccionesService,
    private storage: Storage,
    private dataService:DataService,
    public actionSheetController:ActionSheetController,
    public toastController:ToastController,
    public alertController:AlertController,
    private statusBar: StatusBar,
    public wbSocket: WebsocketService,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  async ngOnInit() {
    SpeechRecognition.requestPermissions();
    this.statusBar.backgroundColorByHexString('#FBFBFB');
    this.statusBar.styleDefault();
    let departamento = await this.storage.get("departamento");
    if(departamento != null){
      this.departamentoSelect = departamento.DepartamentoUbicacion;
    }
    this.obtenerCategoriaMenu();
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

  openSearchVoice(){
    this.openSearchVoiceStatus = !this.openSearchVoiceStatus
  }

  async obtenerCategoriaMenu(){
    this.CategoriaCorrecto = true
    try {
      let respuesta = await this.dataService.getCategorias();
      if(respuesta.data.success==true){
        this.categoriaMenu = respuesta.data.data;
        this.categoriaMenu.map((item: any)=> {
          return {
            ...item,
            active: false
          }
        })
        this.idCategoria = this.categoriaMenu[0].IdEmpresaCategoria;
        this.nombreCategoria = this.categoriaMenu[0].EmpresaCategoria;
        this.categoriaMenu[0].active = true;
        let departamento = await this.storage.get("departamento");
        if(departamento != null){
          this.cargarEmpresas('', departamento.DepartamentoUbicacion);
        }
      }else{
        this.categoriaMenu = []
      }
    } catch (error) {
      this.categoriaMenu = []
      this.CategoriaCorrecto = false
    }
  }

  async cambiarDepartamento(){
    try {
      let respuestaDep = await this.dataService.getDepartamentos();
      this.departamentos = respuestaDep.data.data;
      if(respuestaDep.data.success == true){
        this.departamentos = respuestaDep.data.data;
        let buttons: any = [];
        this.departamentos.map((depa: any)=>{
          let button = {
            text: depa.DepartamentoUbicacion,
            icon: 'location-sharp',
            handler: async () => {
              let postData = {
                'DepartamentoUbicacion': depa.DepartamentoUbicacion,
              }; 
              await this.storage.set('departamento', postData);
              this.departamentoSelect = depa.DepartamentoUbicacion;
              this.cargarAnuncio(this.departamentoSelect)
              this.cargarEmpresas('', this.departamentoSelect);
              try {
                FCM.unsubscribeFromTopic('anuncio-pasco');
                FCM.unsubscribeFromTopic('anuncio-lima');
                FCM.unsubscribeFromTopic('anuncio-pucallpa');
                FCM.unsubscribeFromTopic('anuncio-iquitos');
                FCM.unsubscribeFromTopic('anuncio-junin');
                FCM.unsubscribeFromTopic('anuncio-sanmartin');
                FCM.unsubscribeFromTopic('anuncio-arequipa');
                FCM.unsubscribeFromTopic('anuncio-ancash');
                FCM.unsubscribeFromTopic('anuncio-ica');
                FCM.unsubscribeFromTopic('anuncio-huanuco');
                FCM.subscribeToTopic('anuncio-'+this.departamentoSelect.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(new RegExp(' ', 'g'), ''));
              } catch (error) {
                
              }

            }
          }
          buttons.push(button);
        })
        
        let actionSheet = await this.actionSheetController.create({
          header: 'Seleccione su ciudad actual.',
          backdropDismiss: false,
          cssClass: "headerAction",
          buttons: buttons
        });
        await actionSheet.present();


      }else if(respuestaDep.data.success==false){
        this.departamentos = []
      }
    } catch (error) {
      
    }

  }

  async ionViewWillEnter(){
    await this.storage.get('cliente').then(async (val)=>{
      this.nombres = val.Nombres.toLowerCase().split(" ")[0];
      try {
        let respuestaNotificacionesNum = await this.dataService.getNumeroNotificaciones(val.IdCliente);
        if(respuestaNotificacionesNum.data.success == true){
          this.herramientasService.setNotificaciones(respuestaNotificacionesNum.data.data);
        }else{
          this.herramientasService.setNotificaciones(0);
        }

        if(respuestaNotificacionesNum.data.anulado==1){
          await this.storage.remove('cliente');
          this.navCtrl.navigateRoot('/login', { animationDirection: 'back' }).then(() => {
            setTimeout(() => {
              this.wbSocket.desconectarSocket();
            }, 200);
          });
          const alert = await this.alertController.create({
            header: '¡Cuenta bloqueada!',
            backdropDismiss: false,
            message: "Su cuenta ha sido bloqueda pueder ser por causas como pedidos falsos, envio masivo de mensajes, etc.  Si es un error comunicate con nosotros vía whastapp (+51 997 578 199)  .",
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

        if(respuestaNotificacionesNum.data.otpvalidado==0){
          await this.storage.remove('cliente');
          this.navCtrl.navigateRoot('/login', { animationDirection: 'back' }).then(() => {
            setTimeout(() => {
              this.wbSocket.desconectarSocket();
            }, 200);
          });
          const alert = await this.alertController.create({
            header: '¡Valide su celular!',
            backdropDismiss: false,
            message: "Por favor valide su número de celular",
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
      } catch (error) {
        this.herramientasService.setNotificaciones(0);
      }
     });

     if(this.departamentoSelect==null){
      const alert = await this.alertController.create({
        header: 'Seleccione su ciudad actual',
        backdropDismiss: false,
        message: 'Para una mejor experencia porfavor  seleccione su ciudad actual  ',
        mode: "ios",
        buttons: [
          {
            cssClass: 'primarybtn',
            text: 'Seleccionar',
            handler: () => {
                setTimeout(() => {
                  this.cambiarDepartamento();
                }, 100);
            }
          }
        ]
      });
      await alert.present();
    }else{
      this.cargarAnuncio(this.departamentoSelect);
    }  


  }

  async cargarAnuncio(depa: any){
    try {
      this.anuncios = []
      this.anuncioCarga = true;
      let respuestaAnuncios = await this.dataService.getAnuncios(depa);
      if(respuestaAnuncios.data.success == true){
        this.anuncios = respuestaAnuncios.data.data
      }else{
        this.anuncios = []
      }
      this.anuncioCarga = false
    } catch (error) {
      this.anuncioCarga = false
      this.anuncios = []
    }
  }


  async onIrNotificaciones(){
    //abrir modal
    const modal = await this.modalController.create({
      component: NotificacionesPage,
      componentProps: {
        "paramID": 123,
      }
    });
 
    modal.onDidDismiss().then((dataReturned) => {
      if (dataReturned !== null) {
         
        console.log('Modal Sent Data :'+ dataReturned.data);
      }
    });
 
    return await modal.present();
    //fin de modal
  }

  async onIrCategoria(idCategoria:number, nombreCategoria:string, index: number){
    let departamento = await this.storage.get("departamento");
    this.categoriaMenu = this.categoriaMenu.map((item: any, i: number) => {
      return {
        ...item,
        active: i === index 
      };
    });
    if(departamento == null){
      const toast = await this.toastController.create({
        message: ' Primero seleccione su ciudad  ',
        duration: 2000,
        position: 'bottom',
        mode: "ios",
        color: 'warning',
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
    }else{
      try {
        let resp = await this.dataService.getEmpresaDirecta(idCategoria,departamento.DepartamentoUbicacion)
        if(resp.data.success){
          this.navegacionService.setEmpresa(resp.data.data);
          this.navCtrl.navigateRoot('/principal/empresa', { animationDirection: 'forward' })
          return;
        }else{
          this.idCategoria = idCategoria;
          this.nombreCategoria = nombreCategoria;
          let departamento = await this.storage.get("departamento");
          if(departamento != null){
            this.cargarEmpresas('', departamento.DepartamentoUbicacion);
          }

         /*  this.navegacionService.setCategoria(idCategoria, nombreCategoria)
          this.navCtrl.navigateRoot('/principal/categoria', { animationDirection: 'forward' });   */
        }
      } catch (error) {
       /*  this.navegacionService.setCategoria(idCategoria, nombreCategoria)
        this.navCtrl.navigateRoot('/principal/categoria', { animationDirection: 'forward' });     */
      }
    }
 }

 ionViewWillLeave() {
  let contenido =  document.getElementById('contenidoPrincipal')
  if (contenido) {
    contenido.innerHTML = ""
  }
}
////

async abrirCarrito(){
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

async buscarEmpresa(e: any){
  this.empresas = []
  this.subCategoria = []
  this.estadoCarga = false;
  this.existeEmpresas  = false;
  let departamento = await this.storage.get("departamento");
  if(departamento != null){
    this.cargarEmpresas(e.detail.value, departamento.DepartamentoUbicacion);
  }

}

async onCancel(){
  let departamento = await this.storage.get("departamento");
  if(departamento != null){
    this.cargarEmpresas('', departamento.DepartamentoUbicacion);
  }
}


cargarEmpresas(busqueda:string,departamento:string){
  setTimeout(async () => {
    this.estadoCarga = false;
    this.existeEmpresas  = false;
    this.cargaCompleta = true;
    try {
      let respuestaEmpresas = await this.dataService.getEmpresas(this.idCategoria,busqueda,departamento);
      if(respuestaEmpresas.data.success == true){
        this.empresas = respuestaEmpresas.data.data;
        this.subCategoria = this.empresas
      .map((a: any) => ({ name: a.SubCategoria, ImagenUrlSubCate: a.ImagenUrlSubCate })) // Mapea con un objeto que contenga name
      .filter((v: any, i: any, a: any) => a.findIndex((t: any) => t.name === v.name) === i);
      this.subCategoria.map((item:any) => {
        return {
          ...item,
          active: false
        }
      })
      this.subCategoria[0].active = true;
        this.showListEmpresas = this.filtro(this.subCategoria[0].name)
        this.ShowListEmpresaAll = this.empresas;
        this.existeEmpresas = false;
        setTimeout(() => {
          this.cargaCompleta=false;
          this.estadoCarga = true;
        }, 100);
      }else if(respuestaEmpresas.data.success==false){
        this.existeEmpresas = true;
        this.estadoCarga = true;
        this.cargaCompleta = true;
        this.empresas = []
        this.subCategoria = []
      }
    } catch (error) {
      this.empresas = []
      this.subCategoria = []
      this.cargaCompleta = true;
      this.mostrarMensajeBottom('Error: No se cargaron correctamente las empresas',2000,'danger');
    }
  }, 200);
}

filtro(SubCategoria: string) {
  return this.empresas.filter((empresa: any) => empresa.SubCategoria == SubCategoria);
}

changeSubCategory(subCategory: any, index: any){
  this.showListEmpresas = this.filtro(subCategory);
  this.subCategoria = this.subCategoria.map((item: any, i: number) => {
    return {
      ...item,
      active: i === index 
    };
  });
}


onIrPrincipalMenu() {
  this.navCtrl.navigateRoot('/principal/menu', { animationDirection: 'back' });
}

async onIrEmpresa(empresa:any) {
  this.navegacionService.setEmpresa(empresa);
  this.navCtrl.navigateRoot('/principal/empresa', { animationDirection: 'forward' })
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



ocultarLoader(){
  this.loaderToShow.dismiss();
}

onLimpiarBusqueda(e: any) {
  this.busqueda = '';
  this.cargarEmpresas('', this.departamentoSelect);
}

buscarProducto(e: any){
  if (e.detail.value.trim() != '') {
    this.showListEmpresas = this.empresas.filter((item: any) => item.RazonSocial.toLowerCase().includes(e.detail.value.toLowerCase().trim()));
  }
}
}
