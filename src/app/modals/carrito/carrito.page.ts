import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController, NavController, LoadingController } from '@ionic/angular';
import { CarritoService } from '../../services/carrito.service';
import { PedidoModel } from '../../modelos/pedido.model';
import { NavegacionService } from '../../services/navegacion.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.page.html',
  styleUrls: ['./carrito.page.scss'],
})
export class CarritoPage implements OnInit {
  public cantidad: number = 1;
  public pedidos: PedidoModel[] | null = null;
  public subTotal: number = 0;
  public empresasPedido: any = [];
  constructor(
    public navCtrl: NavController,
    private modalController: ModalController,
    public alertController: AlertController,
    public carritoService: CarritoService,
    public loadingController: LoadingController,
    public navegacionService: NavegacionService,
    private router: Router
  ) { }

  ngOnInit() {
    this.pedidos = this.carritoService.obtenerPedidos();
    this.empresasPedido = this.pedidos.map(a => a.RazonSocial).filter((v, i, a) => a.indexOf(v) === i);
    if (this.router.url !== '/principal/realizar') {
      this.navegacionService.setNavegacionAnteriorCarrito(this.router.url);
    }
  }

  async closeModal() {
    await this.modalController.dismiss();
  }

  filtro(RazonSocial: string) {
    return this.pedidos?.filter(pedido => pedido.RazonSocial == RazonSocial);
  }

  onAgregarCantidad(IdProducto: number,IdEmpresa:number) {
    this.carritoService.agregarCantidad(IdProducto,IdEmpresa);
  }



  async onQuitarCantidad(IdProducto: number,IdEmpresa:number,Cantidad:number) {

    if (Cantidad == 1) {
      const alert = await this.alertController.create({
        header: 'Quitar producto',
        message: "¿Desea quitar  " + this.carritoService.obtenerPedido(IdProducto,IdEmpresa).Producto + "   de su carrito?",
        cssClass: 'alertacarrito',
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

              this.carritoService.eliminarPedido(IdProducto,IdEmpresa);
              this.empresasPedido = this.pedidos?.map(a => a.RazonSocial).filter((v, i, a) => a.indexOf(v) === i);
              alert.dismiss();
            }
          }
        ]
      });

      await alert.present();
    } else {
      this.carritoService.quitarCantidad(IdProducto,IdEmpresa);
    }

  }

  verificarEmpresaCerrada() {
    let objIndex = this.pedidos?.findIndex((pedido => this.verificarHora(pedido.HorarioInicio, pedido.HorarioFin) == false));
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

  async OnIrRealizarPedido() {

    if(this.empresasPedido.length == 1) {
      let index: any = this.verificarEmpresaCerrada();
      if (index == -1) {
        this.closeModal();
        setTimeout(() => {
          this.navCtrl.navigateRoot('/principal/realizar', { animationDirection: 'forward' });
        }, 100);
      }else{
        const alert = await this.alertController.create({
          header: `¡ ${this.pedidos?.[index].RazonSocial}  ya cerró!`,
          message: " " + this.pedidos?.[index].RazonSocial + "   esta cerrado, según su horario de atención...",
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
    }else{
      const alert = await this.alertController.create({
        header: 'Pedidos a 2 empresas diferentes',
        message: "Solo puede solicitar productos a una sola empresa",
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

 async onQuitarPedido(IdProducto: number,IdEmpresa:number){
  const alert = await this.alertController.create({
    header: 'Quitar producto',
    message: "¿Desea quitar  " + this.carritoService.obtenerPedido(IdProducto,IdEmpresa).Producto + "   de su carrito?",
    cssClass: 'alertacarrito',
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

          this.carritoService.eliminarPedido(IdProducto,IdEmpresa);
          this.empresasPedido = this.pedidos?.map(a => a.RazonSocial).filter((v, i, a) => a.indexOf(v) === i);
          alert.dismiss();
        }
      }
    ]
  });

  await alert.present();
 }

}
