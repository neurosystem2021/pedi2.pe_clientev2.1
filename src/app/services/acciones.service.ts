import { Injectable } from '@angular/core';
import { WebsocketService } from './websocket.service';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class AccionesService {

  constructor(public wsService:WebsocketService, private storage: Storage) {
   }



   /* Nuevo Websocket */
   escucharUbicacionMotorizado(){
     return this.wsService.listen('ubicacion-motorizado-recibir');
   }

   mensajeEmitirMotorizado(idMotorizado:any,idPedido:any,msg:string){
    const payload = {
      iddb:idMotorizado,
      idPedido:idPedido,
      tipo: 'MOTORIZADO',
      msg:msg
    };
    this.wsService.emit('mensaje-emitir',payload);
   }

   mensajeEscuchar(){
     return this.wsService.listen('mensaje-recibido');
   }

   estadoPedidoEscuchar(){
     return this.wsService.listen('estado-pedido-actualizado');
   }

   estadoPedidoCancelar(){
    return this.wsService.listen('estado-pedido-recibir');
  }
   /* Fin Websocket */


   async emitirNuevoPedido(plataforma:string,idAlmacen:number,iddbEmpresa:number,tieneSistema:number,idRegion:number){
    let cliente = await this.storage.get('cliente');
    if(cliente !== null){
      this.wsService.emit('emitir-nuevo-pedido',{nombres:cliente.Nombres+" "+cliente.Apellidos,plataforma:plataforma, idalmacen:idAlmacen, iddbempresa:iddbEmpresa,tienesistema:tieneSistema,idregion:idRegion});
    }
    }

   async emitirCanceladoPedido(idPedido:any,idEmpresa: any){
    let cliente = await this.storage.get('cliente');
    if(cliente !== null){
      this.wsService.emit('emitir-cancelado-pedido',{nombre:cliente.Nombres+" "+cliente.Apellidos, idPedido:idPedido, idEmpresa:idEmpresa});
    }      
   }

}
