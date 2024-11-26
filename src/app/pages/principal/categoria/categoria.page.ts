import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, ToastController, ModalController } from '@ionic/angular';
import { NavegacionService } from 'src/app/services/navegacion.service';
import { DataService } from 'src/app/services/data.service';
import { CarritoService } from 'src/app/services/carrito.service';
import { CarritoPage } from 'src/app/modals/carrito/carrito.page';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-categoria',
  templateUrl: './categoria.page.html',
  styleUrls: ['./categoria.page.scss'],
})
export class CategoriaPage implements OnInit {
  public idCategoria: any = null;
  public nombreCategoria: any = null;
  loaderToShow!: HTMLIonLoadingElement;
  public empresas:any = [];
  public estadoCarga: boolean = false;
  public existeEmpresas: boolean = false;
  public subCategoria:any = [];
  departamentoSelect: any = null;
  cargaCompleta:boolean = false;
  constructor(public navCtrl: NavController,
    public navegacionService: NavegacionService,
    public loadingController: LoadingController,
    public dataService: DataService,
    public toastController: ToastController,
    public carritoService:CarritoService,
    public modalController:ModalController,
    private storage: Storage,) { }

  async ngOnInit() {
    let departamento = await this.storage.get("departamento");
    if(departamento != null){
      this.departamentoSelect = departamento.DepartamentoUbicacion
    }
  }

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

  async ionViewDidEnter() {
    if(this.navegacionService.getCategoria().idCategoria==null && this.navegacionService.getCategoria().nombreCategoria==null){
     this.navCtrl.navigateRoot('/principal/menu', { animationDirection: 'back' });
    return;
    } 

    this.idCategoria = this.navegacionService.getCategoria().idCategoria;
    this.nombreCategoria = this.navegacionService.getCategoria().nombreCategoria;
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
        if(respuestaEmpresas.data.success==true){
          this.empresas = respuestaEmpresas.data.data;
          this.subCategoria = this.empresas.map((a: any) => a.SubCategoria).filter((v: any, i: any, a: any) => a.indexOf(v) === i);
          this.existeEmpresas = false;
          setTimeout(() => {
            this.cargaCompleta=false;
            this.estadoCarga = true;
          }, 50);
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

  async ionViewWillLeave() {
    this.empresas = [];
    try {
      const element = await this.loadingController.getTop();
      if (element) {
        this.loadingController.dismiss();
      }

    } catch (error) {

    }
  }



  onIrPrincipalMenu() {
    this.navCtrl.navigateRoot('/principal/menu', { animationDirection: 'back' });
  }

  async onIrEmpresa(empresa:any) {
    this.navegacionService.setEmpresa(empresa);
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

  async mostrarLoader(mensaje:string){
    this.loaderToShow = await this.loadingController.create({
      message: mensaje,
      spinner: 'circles',
      backdropDismiss: false,
      mode: 'ios',
    });
    this.loaderToShow.present();
  }

  ocultarLoader(){
    this.loaderToShow.dismiss();
  }
}
