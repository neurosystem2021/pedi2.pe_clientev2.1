import { Injectable } from "@angular/core";
import { environment } from 'src/environments/environment';
import axios from "axios";
@Injectable({
  providedIn: "root",
})
export class DataService {
  

  //private servidor = "http://192.168.0.10:5000/";
  private servidor = environment.dataUrl;
  private servidorNet = environment.facturaUrl;
  constructor() {}


  /** Peticiones Axios**/

  getLoginCliente(telefono:string, password:string){
    let config={
      params:{
        Telefono: telefono,
        Password: password
      }
    }
    const path = this.servidor + "/api/login/cliente";
    return axios.get(path, config);
  }

  getPedidoExiste(idCliente:number){
    let config={
      params:{
        IdCliente: idCliente,
      }
    }
    const path = this.servidor + "/api/pedidos/cliente/existe";
    return axios.get(path, config);
  }

  getPedidoExisteDetalle(idCliente:number){
    let config={
      params:{
        IdCliente: idCliente,
      }
    }
    const path = this.servidor + "/api/pedidos/cliente/existe/detalle";
    return axios.get(path, config);
  }

  getMensajes(idPedido: any){
    let config={
      params:{
        IdPedido: idPedido,
      }
    }
    const path = this.servidor + "/api/pedidos/chat";
    return axios.get(path, config);
  }

  postNuevoMensajeServidor(idPedido:any,chat:string){
    const path = this.servidor + "/api/pedidos/chat/actualizar";
    return axios.post(path, {IdPedido: idPedido,Chat: chat, Tipo:'MOTORIZADO'});
  }

  getEstadoPedidoActivo(idPedido:any){
    let config={
      params:{
        IdPedido: idPedido,
      }
    }
    const path = this.servidor + "/api/pedidos/activo/estado";
    return axios.get(path, config);
  }
  

  getCategorias(){
    const path = this.servidor + "/api/empresa/categorias";
    return axios.get(path);
  }

  //empresas
  getEmpresas(idCategoria:number,busqueda:string,departamento:string){
    let config = {
      params:{
        IdCategoria: idCategoria,
        Busqueda: busqueda,
        DepartamentoUbicacion:departamento
      }
    }
    const path = this.servidor + "/api/empresas";
    return axios.get(path,config);
  }

  getEmpresa(idEmpresa:number){
    let config = {
      params:{
        IdEmpresa: idEmpresa,
      }
    }
    const path = this.servidor + "/api/empresa";
    return axios.get(path,config);
  }

  postRealizarPedido(infoPedido:any,productos:any){
    const path = this.servidor + "/api/pedido/realizar";
    return axios.post(path, {infoPedido:infoPedido,productos:productos});
  }

  postCancelarPedido(idPedido:any){
    const path = this.servidor + "/api/pedido/cancelar";
    return axios.post(path, {IdPedido:idPedido});
  }

  postExisteCliente(telefono:any){
    const path = this.servidor + "/api/cliente/existe";
    return axios.post(path, {Telefono:telefono});
  }

  postRegistroCliente(dataCliente:any,hashSMS: any){
    const path = this.servidor + "/api/cliente/registro";
    return axios.post(path, {DataCliente:dataCliente,hashSMS:hashSMS});
  }

  getDepartamentos(){
    const path = this.servidor + "/api/empresa/departamento";
    return axios.get(path);
  }

  getDistritos(){
    const path = this.servidor + "/api/empresa/distrito";
    return axios.get(path);
  }

  getEmpresaDirecta(idCategoria:number,departamento:string){
    let config = {
      params:{
        IdCategoria: idCategoria,
        Departamento: departamento
      }
    }
    const path = this.servidor + "/api/empresa/directa";
    return axios.get(path,config);
  }

  getConfiguracionEmpresa(idEmpresa:number){
    let config = {
      params:{
        IdEmpresa: idEmpresa,
      }
    }
    const path = this.servidor + "/api/empresa/config";
    return axios.get(path,config);
  }

  getAnuncios(departamento: any){
    let config = {
      params:{
        Departamento: departamento,
      }
    }
    const path = this.servidor + "/api/cliente/anuncios";
    return axios.get(path,config);
  }

  getConfiguracionApp(){
    const path = this.servidor + "/api/config/app";
    return axios.get(path);
  }

  postHablanos(IdCliente:any,Correo:any,Opc:any,Msg:any){
    const path = this.servidor + "/api/cliente/hablanos";
    return axios.post(path, {IdCliente:IdCliente,Correo:Correo,Opc:Opc,Msg:Msg});
  }

  getMotorizadoInfo(idMotorizado:number){
    let config = {
      params:{
        IdMotorizado: idMotorizado,
      }
    }
    const path = this.servidor + "/api/pedidos/motorizado/info";
    return axios.get(path,config);
  }

  //Direccion
  getDirecciones(idCliente:number){
    let config = {
      params:{
        IdCliente: idCliente,
      }
    }
    const path = this.servidor + "/api/cliente/direcciones";
    return axios.get(path,config);
  }

  postNuevaDireccion(dataDireccion:any){
    const path = this.servidor + "/api/cliente/nueva/direccion";
    return axios.post(path, {DataDireccion:dataDireccion});
  }

  postEliminarDireccion(idDireccionCliente:any){
    const path = this.servidor + "/api/cliente/eliminar/direccion";
    return axios.post(path, {IdDireccionUsuario:idDireccionCliente});
  }


  //Historial
  getHistorialPedidos(idCliente:number){
    let config = {
      params:{
        IdCliente: idCliente,
      }
    }
    const path = this.servidor + "/api/cliente/pedido/historial";
    return axios.get(path,config);
  }

  //Notificaciones
  getNotificaciones(idCliente:number){
    let config = {
      params:{
        IdCliente: idCliente,
      }
    }
    const path = this.servidor + "/api/cliente/notificaciones";
    return axios.get(path,config);
  }

  getNumeroNotificaciones(idCliente:number){
    let config = {
      params:{
        IdCliente: idCliente,
      }
    }
    const path = this.servidor + "/api/cliente/notificaciones/numero";
    return axios.get(path,config);
  }

  postNotificacionesActualizar(idCliente:number){
    const path = this.servidor + "/api/cliente/notificaciones/actualizar";
    return axios.post(path, {IdCliente:idCliente});
  }

  postNotificacionesEliminar(idNotificacion:number){
    const path = this.servidor + "/api/cliente/notificaciones/eliminar";
    return axios.post(path, {IdNotificacion:idNotificacion});
  }

  postNuevoCodigoOtp(idCliente:number,hashSMS:string){
    const path = this.servidor + "/api/cliente/nuevo/otp";
    return axios.post(path, {IdCliente:idCliente,hashSMS:hashSMS});
  }

  postValidarOtp(idCliente:number,codigoOtp:string){
    const path = this.servidor + "/api/cliente/validar/otp";
    return axios.post(path, {IdCliente:idCliente,CodigoOtp:codigoOtp});
  }
  
  //Peticion al servidor app factura vip

  getCategoriasToken(token:string){
    //await this.validarToken()
    let config = {
      headers: {
        Authorization: token,
      }
    }
    const path = this.servidorNet+ "/categorias?filter[where][MostrarDelivery]=1";
    return axios.get(path,config);
  }

  getProductosToken(idProductoCategoria:number,token:string){
    //await this.validarToken()
    let config = {
      headers: {
        Authorization: token,
      }
    }
    const path = this.servidorNet+ "/productos?filter[where][IdProductoCategoria]="+idProductoCategoria+"&filter[where][PrecioContado][gt]=0";
    return axios.get(path,config);
  }


  /** Peticiones Axios Final**/
  //peticiones RestApi
  /*inicio*/

  //Peticiones directacion
  getCategoriasUrl(idEmpresa:number,url:string,tieneSistema:number){
    //await this.validarToken()
    let config = {
      params: {
        IdEmpresa: idEmpresa,
      }
    }
    const path = url+ (tieneSistema==1?"/api/restapi.php/delivery/categorias":"/api/empresa/productos/categorias");
    return axios.get(path,config);
  }

  getProductosUrl(idProductoCategoria:number,url:string,tieneSistema:number){
    //await this.validarToken()
    let config = {
      params: {
        IdProductoCategoria: idProductoCategoria,
      }
    }
    const path = url+ (tieneSistema==1?"/api/restapi.php/delivery/productos/categoria":'/api/empresa/productos');
    return axios.get(path,config);
  }

  getProductosUrlOferta(idProductoCategoria:number,url:string,tieneSistema:number){
    //await this.validarToken()
    let config = {
      params: {
        IdProductoCategoria: idProductoCategoria,
      }
    }
    const path = url+ (tieneSistema==1?"/api/restapi.php/delivery/productos/categoria/oferta":'/api/empresa/productos/oferta');
    return axios.get(path,config);
  }

  getProductosUrlBusqueda(busqueda:string,idEmpresa:number,url:string,tieneSistema:number){
    //await this.validarToken()
    let config = {
      params: {
        IdEmpresa: idEmpresa,
        Busqueda: busqueda,
      }
    }
    const path = url+ (tieneSistema==1?"/api/restapi.php/delivery/productos/busqueda":'/api/empresa/productos/busqueda');
    return axios.get(path,config);
  }

  getConsultaSistema(idEmpresa:number){
    let config = {
      params: {
        IdEmpresa: idEmpresa,
      }
    }
    const path = this.servidor + "/api/consulta/sistema";
    return axios.get(path,config);  
  }

  getDataDni(dni:string){
    const path = this.servidor + "/api/cliente/buscar/dni";
    return axios.post(path, {Code:'xgr3d2drg432',Dni:dni});
  }
 
}
