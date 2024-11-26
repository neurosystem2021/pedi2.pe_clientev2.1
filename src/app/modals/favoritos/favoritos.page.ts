import { Component, OnInit } from '@angular/core';
import { ModalController, LoadingController, ToastController, AlertController } from '@ionic/angular';
import { HerramientasService } from 'src/app/services/herramientas.service';
import { ProductoInterface } from 'src/app/modelos/producto.interface';
import { DataService } from 'src/app/services/data.service';
import { Storage } from '@ionic/storage';
import { CarritoService } from 'src/app/services/carrito.service';

@Component({
  selector: 'app-favoritos',
  templateUrl: './favoritos.page.html',
  styleUrls: ['./favoritos.page.scss'],
})
export class FavoritosPage implements OnInit {
  public favoritos: any[] = [];
  loaderToShow: any;
  pedido: any = null;
  public existeFavoritos: boolean = false;
  constructor(
    private modalController: ModalController,
    public herramientasService: HerramientasService,
    public dataService: DataService,
    private storage: Storage,
    public loadingController: LoadingController,
    public carritoService: CarritoService,
    public toastController: ToastController,
    public alertController: AlertController
  ) { }

  ngOnInit() {

  }
  async ionViewWillEnter() {
    this.loaderToShow = await this.loadingController.create({
      message: 'Cargando favoritos...',
      spinner: 'dots',
      mode:"ios",
      backdropDismiss: false,
    });
    this.loaderToShow.present();

    this.storage.get('usuario').then(async (val) => {
      // val.celular;
      try {
        /*
        let respuesta = await this.dataService.favoritosTraer(val['celular']).toPromise();
        if (respuesta  == null) {
          this.favoritos = [];
          this.existeFavoritos = true;
          this.herramientasService.setFavoritos(this.favoritos);
          this.loaderToShow.dismiss();
        } else {
          this.existeFavoritos = false;
          this.herramientasService.setFavoritos(respuesta );
          this.favoritos = respuesta ;
          this.loaderToShow.dismiss();
        }
        */
      } catch (error) {
        this.existeFavoritos = false;
        this.favoritos = [];
        this.herramientasService.setFavoritos(this.favoritos);
        this.loaderToShow.dismiss();
      }

    });
  }

  verificarExistencia(idproducto: number) {
    return this.carritoService.obtenerPedidos().some(pedido => pedido.IdProducto === idproducto);
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

  async quitarFavorito(id: string, nombre: string) {
    const alert = await this.alertController.create({
      header: 'Quitar favorito',
      message: "¿Desea quitar  " + nombre + "   de sus favoritos?",
      mode: "ios",
      buttons: [
        {
          text: 'No',
          cssClass: 'secondarybtn',
          handler: () => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Si',
          cssClass: 'primarybtn',
          handler: () => {
            if (this.herramientasService.existeFavorito(id)) {
              this.herramientasService.quitarFavorito(id, nombre);
            }
            alert.dismiss();
          }
        }
      ]
    });
    await alert.present();

  }

  async onAgregarCarrito(producto: ProductoInterface) {
    if (this.verificarHora(producto.horario_inicio, producto.horario_fin)) {
     // this.pedido = new PedidoModel(producto.id, producto.empresa_ruc, producto.empresa_razon_social, producto.nombre, producto.descripcion, producto.url_imagen,
     //   producto.precio_unitario, producto.ranking, 1, (producto.precio_unitario * 1), producto.horario_inicio, producto.horario_fin);
     // this.carritoService.agregarPedido(this.pedido);
      const toast = await this.toastController.create({
        message: " "+producto.nombre + "   se agrego al carrito!",
        duration: 1000,
        position: 'bottom',
        mode: "ios",
        color: "success",
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

    } else {
      const toast = await this.toastController.create({
        message: producto.empresa_razon_social + ' está cerrado!',
        duration: 500,
        position: 'bottom'
      });
      await toast.present();
    }


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
    await this.modalController.dismiss("favoritos");
  }
}
