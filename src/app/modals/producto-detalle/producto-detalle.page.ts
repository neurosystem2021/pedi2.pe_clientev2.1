import { Component, OnInit, Input} from '@angular/core';
import { ModalController, ToastController, AlertController } from '@ionic/angular';
import { CarritoService } from '../../services/carrito.service';
import { PedidoModel } from '../../modelos/pedido.model';
import { HerramientasService } from 'src/app/services/herramientas.service';

@Component({
  selector: 'app-producto-detalle',
  templateUrl: './producto-detalle.page.html',
  styleUrls: ['./producto-detalle.page.scss'],
})
export class ProductoDetallePage implements OnInit {

  @Input() producto: any;
  @Input() empresa: any;
  public cantidad: number = 0;
  public pedido: any = null;
  constructor(public modalController: ModalController,
    public toastController: ToastController,
    public carritoService: CarritoService,
    public herramientasService:HerramientasService,
    public alertController:AlertController) {}

  ngOnInit() {

  }

  accionVerMas(opc:number){
    this.producto.VerMas = opc
  }

  onAdicionarCantidad() {
    this.producto.Cantidad++;
  }

  onReducirCantidad() {
    if(this.producto.Cantidad<=1){
      this.producto.Cantidad = 1;
    }else{
      this.producto.Cantidad--;
    }

  }

async mostrarOpciones(){
  const alert = await this.alertController.create({
    cssClass: 'my-custom-alert',
    header: 'INDICACIONES COMUNES',
    mode:'ios',
    backdropDismiss: false,
    inputs: [
      {
        name: 'radio2',
        type: 'radio',
        label: 'SIN PICANTE',
        value: 'SIN PICANTE',
        handler: (alertData) => {
          this.producto.Indicacion=this.producto.Indicacion+" - "+alertData.value+" ";
          alert.dismiss();
        }
      },
      {
        name: 'radio3',
        type: 'radio',
        label: 'SIN CEBOLLA',
        value: 'SIN CEBOLLA',
        handler: (alertData) => {
          this.producto.Indicacion=this.producto.Indicacion+" - "+alertData.value+" ";
          alert.dismiss();
        }
      },
      {
        name: 'radio4',
        type: 'radio',
        label: 'SIN ENSALADA',
        value: 'SIN ENSALADA',
        handler: (alertData) => {
          this.producto.Indicacion=this.producto.Indicacion+" - "+alertData.value+" ";
          alert.dismiss();
        }
      },
      {
        name: 'radio5',
        type: 'radio',
        label: 'SIN PAPAS',
        value: 'SIN PAPAS',
        handler: (alertData) => {
          this.producto.Indicacion=this.producto.Indicacion+" - "+alertData.value+" ";
          alert.dismiss();
        }
      },
      {
        name: 'radio6',
        type: 'radio',
        label: 'SIN CREMAS',
        value: 'SIN CREMAS',
        handler: (alertData) => {
          this.producto.Indicacion=this.producto.Indicacion+" - "+alertData.value+" ";
          alert.dismiss();
        }
      },
      {
        name: 'radio6',
        type: 'radio',
        label: 'PARTE:',
        value: 'PARTE:',
        handler: (alertData) => {
          this.producto.Indicacion=this.producto.Indicacion+" - "+alertData.value+" ";
          alert.dismiss();
        }
      },
      {
        name: 'radio6',
        type: 'radio',
        label: 'MAS CREMAS',
        value: 'MAS CREMAS',
        handler: (alertData) => {
          this.producto.Indicacion=this.producto.Indicacion+" - "+alertData.value+" ";
          alert.dismiss();
        }
      },
      {
        name: 'radio7',
        type: 'radio',
        label: 'HELADA',
        value: 'HELADA',
        handler: (alertData) => {
          this.producto.Indicacion=this.producto.Indicacion+" - "+alertData.value+" ";
          alert.dismiss();
        }
      },
      {
        name: 'radio8',
        type: 'radio',
        label: 'SIN HELAR',
        value: 'SIN HELAR',
        handler: (alertData) => {
          this.producto.Indicacion=this.producto.Indicacion+" - "+alertData.value+" ";
          alert.dismiss();
        }
      }
    ],
    buttons: [
      {
        text: 'Cerrar',
        role: 'cancel',
        cssClass: 'primarybtn',
        handler: () => {
          console.log('Confirm Cancel');
        }
      }
    ]
  });

  await alert.present();
}
//asf

  ionViewWillEnter(){  
    //this.herramientasService.consultaFavoritosApi();
  }
  
/*   async onMoficarFavorito(){
    if(!this.herramientasService.existeFavorito(this.id)){
      this.herramientasService.agregarFavorito(this.producto);
    }else{
      this.herramientasService.quitarFavorito(this.id,this.nombre);
    }
   
  } */


  async closeModal(value: any) {
    await this.modalController.dismiss(value);
  }

  async onAgregarCarrito() {
    if(this.carritoService.obtenerPedidos().some(pedido => pedido.IdProducto === this.producto.IdProducto && pedido.IdEmpresa===this.empresa.IdEmpresa)){
      const toast = await this.toastController.create({
        message: " "+this.producto.Producto + "   YA ESTA EN EL CARRITO!",
        duration: 2500,
        position: 'middle',
        mode: "ios",
          color: "warning",
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
      return;
    }
    this.producto.Indicacion = (""+this.producto.Indicacion).replace('\n','');
    this.producto.Indicacion = (''+this.producto.Indicacion).replace(new RegExp("'", 'g'), '');
    this.producto.Indicacion = (''+this.producto.Indicacion).replace(new RegExp('"', 'g'), '');
    this.producto.Indicacion = (''+this.producto.Indicacion).replace(new RegExp('\n', 'g'), '');
    this.producto.Indicacion = (''+this.producto.Indicacion).replace(new RegExp('\\'.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), '')
    this.pedido = new PedidoModel(this.producto.IdProducto,this.producto.Producto,'',3.5,
    this.producto.Cantidad,this.producto.Imagen,this.producto.PrecioContado,this.producto.Indicacion.toUpperCase(),this.empresa.IdEmpresa,this.empresa.IdAlmacen,
    this.empresa.RazonSocial,this.empresa.FacturaUrl,this.empresa.ImagenUrl,this.empresa.HorarioInicio,this.empresa.HorarioFin,this.empresa.Latitud,
    this.empresa.Longitud,this.empresa.TieneSistema);
    this.carritoService.agregarPedido(this.pedido);

    this.closeModal(this.producto.IdProducto);
    const toast = await this.toastController.create({
      message: " "+this.producto.Producto + "   AGREGADO!",
      duration: 2000,
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
  }
  
}
