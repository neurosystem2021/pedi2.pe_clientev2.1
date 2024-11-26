import { Component, OnInit } from '@angular/core';
import { ModalController, LoadingController, ToastController, AlertController } from '@ionic/angular';
import { DataService } from 'src/app/services/data.service';
import { ProductoInterface } from 'src/app/modelos/producto.interface';
import { CarritoService } from 'src/app/services/carrito.service';
import { PedidoModel } from 'src/app/modelos/pedido.model';


@Component({
  selector: 'app-promociones',
  templateUrl: './promociones.page.html',
  styleUrls: ['./promociones.page.scss'],
})
export class PromocionesPage implements OnInit {
  loaderToShow: any;
  public estadoCarga: boolean = false;
  public existePromocion: boolean = false;
  public promociones: any[] = [];
  public pedido: any = null;

  constructor(private modalController: ModalController,
    public loadingController: LoadingController,
    public dataService: DataService,
    public carritoService: CarritoService,
    public toastController: ToastController,
    public alertController: AlertController) { }

  ngOnInit() {
  }
  verificarExistencia(idproducto: number) {
    return this.carritoService.obtenerPedidos().some(pedido => pedido.IdProducto === idproducto);
  }

  async closeModal() {
    await this.modalController.dismiss("Promociones");
  }

  async ionViewWillEnter() {

/*
    this.loaderToShow = await this.loadingController.create({
      message: 'Cargando promociones...',
      spinner: 'dots',
      backdropDismiss: false,
      mode: "ios",
    });
    this.loaderToShow.present();
    try {
      let respuesta = await this.dataService.obtenerPromociones().toPromise()
      if (respuesta['success'] == false) {
        this.existePromocion = true;
        console.log('No hay promociones');
        this.loaderToShow.dismiss();
        this.estadoCarga = true;
      } else {
        this.existePromocion = false;
        this.promociones = respuesta;
        this.loaderToShow.dismiss();
        this.estadoCarga = true;
      }

    } catch (error) {
      this.loaderToShow.dismiss();
      this.estadoCarga = true;
    }
*/
  }

  async ionViewWillLeave() {
    this.promociones = [];
    try {
      const element = await this.loadingController.getTop();
      if (element) {
        this.loadingController.dismiss();
      }

    } catch (error) {

    }
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
  async onAgregarCarrito(producto: ProductoInterface) {
    if (this.verificarHora(producto.horario_inicio, producto.horario_fin)) {
      //this.pedido = new PedidoModel(producto.id, producto.empresa_ruc, producto.empresa_razon_social, producto.nombre, producto.descripcion, producto.url_imagen,
       // producto.precio_unitario, producto.ranking, 1, (producto.precio_unitario * 1), producto.horario_inicio, producto.horario_fin);
      //this.carritoService.agregarPedido(this.pedido);
      const toast = await this.toastController.create({
        message: " " + producto.nombre + "   se agrego al carrito!",
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

  async verPromo(index: number) {
    const alert = await this.alertController.create({
      header: this.promociones[index].nombre,
      cssClass: 'promoalerta',
      subHeader: "S/." + this.promociones[index].precio_unitario,
      message: this.promociones[index].descripcion,
      mode: "ios",
      buttons: [
        {
          cssClass: 'primarybtn',
          text: 'Ok',
          handler: () => {

          }
        }
      ],


    });

    await alert.present();
  }
}
