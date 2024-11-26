import { Injectable } from '@angular/core';
import { PedidoModel } from '../modelos/pedido.model';


@Injectable({
  providedIn: 'root'
})
export class CarritoService {

  private pedidos: PedidoModel[] = [];

  
  constructor() { }
  agregarPedido(pedido: PedidoModel) {
    this.pedidos.push(pedido);
  }


  //Antiguos funciones
  eliminarPedido(IdProducto: number,IdEmpresa:number) {
    let objIndex = this.pedidos.findIndex((pedido => pedido.IdProducto === IdProducto && pedido.IdEmpresa===IdEmpresa));
    if (objIndex !== -1) {
      this.pedidos.splice(objIndex, 1);
    }

  }

  agregarCantidad(IdProducto: number,IdEmpresa:number) {

    let objIndex = this.pedidos.findIndex((pedido => pedido.IdProducto === IdProducto && pedido.IdEmpresa===IdEmpresa ));
    this.pedidos[objIndex].Cantidad++;
    //this.pedidos[objIndex].subtotal = this.pedidos[objIndex].cantidad * this.pedidos[objIndex].precio_unitario;
  }

  quitarCantidad(IdProducto: number,IdEmpresa:number) {
    let objIndex = this.pedidos.findIndex((pedido => pedido.IdProducto === IdProducto && pedido.IdEmpresa===IdEmpresa ));
    this.pedidos[objIndex].Cantidad--;
    //this.pedidos[objIndex].subtotal = this.pedidos[objIndex].cantidad * this.pedidos[objIndex].precio_unitario;
  }

  obtenerPedido(IdProducto: number,IdEmpresa:number) {
    let objIndex = this.pedidos.findIndex((pedido => pedido.IdProducto === IdProducto && pedido.IdEmpresa===IdEmpresa ));
    return this.pedidos[objIndex];
  }
  
  obtenerPedidos() {
    return this.pedidos;
  }

  eliminarPedidos() {
    this.pedidos = [];
  }

  calcularSubtotal() {
    let subtotal = this.pedidos.reduce((acc, pedido) => {
      return acc + (pedido.Precio*pedido.Cantidad);
    }, 0);
    return subtotal;
  }

  calcularCantidadProductos() {
    let cantidad = this.pedidos.reduce((acc, pedido) => {
      return acc + pedido.Cantidad;
    }, 0);
    return cantidad;
  }
}
