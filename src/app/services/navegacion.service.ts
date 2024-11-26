import { Injectable } from '@angular/core';
import { INotificationPayload } from 'cordova-plugin-fcm-with-dependecy-updated';
@Injectable({
  providedIn: 'root'
})
export class NavegacionService {
  // categoria:string="";
  //private empresa:string="";
  //private categoriaNombre:string="";
  //private empresaNombre:string="";
  private navegacionAnteriorCarrito:string="";
  
  //Nuevas Variables
  private categoria:any = {
    idCategoria:null,
    nombreCategoria:null,

  };
  
  private empresa:any = null
  public pushPayload: INotificationPayload | null=null;
  public usuarioValidate:any = null;

  constructor() { }
  //metodos otp
  getUsuarioValid(){
    return this.usuarioValidate;
  }

  setUsuarioValid(usuario:any){
    this.usuarioValidate = usuario;
  }
  
  //Metodos de notificaciones
  getNotificationPromo(){
    return this.pushPayload
  }
  setNotificationPromo(pushPayload:INotificationPayload){
    if(pushPayload["promocion"]){
      this.pushPayload = pushPayload
    }else{
      this.pushPayload = null
    }
  }

  initNotificacionPromo(){
    this.pushPayload = null
  }

  //Nuevos Metodos
  getCategoria(){
    return this.categoria;
  }

  setCategoria(idCategoria:number, nombreCategoria:string){
    this.categoria.idCategoria = idCategoria;
    this.categoria.nombreCategoria = nombreCategoria;
  }

  getEmpresa(){
    return this.empresa;
  }

  setEmpresa(empresa:any){
    this.empresa = empresa;
  }
  //Fin de nuevos metodos


  getNavegacionAnteriorCarrito(){
    return this.navegacionAnteriorCarrito;
  }

  setNavegacionAnteriorCarrito(navegacionCarrito:string){
    this.navegacionAnteriorCarrito = navegacionCarrito;
  }

}
