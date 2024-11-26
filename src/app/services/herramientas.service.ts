import { Injectable } from '@angular/core';
import { ProductoInterface } from '../modelos/producto.interface';
import { UsuarioInterface } from '../modelos/usuario.interface';
import { DataService } from './data.service';
import { Storage } from '@ionic/storage';
import { AlertController, ToastController } from '@ionic/angular';
@Injectable({
  providedIn: 'root'
})
export class HerramientasService {
  public favoritos: ProductoInterface[] = [];
  public usuario?: UsuarioInterface;
  public puntos: string = "No hay conexión";
  public respuesta: any;
  public notificacionesNumero:number=0;
  public estado='E';
  public position:number = 0;
  constructor(private dataService: DataService,
    private storage: Storage,
    public toastController: ToastController,
    private alertController: AlertController) { 
    
    }


  obtenerFavoritos() {
    return this.favoritos;
  }

  
  obtenerEstado() {
    return this.estado;
  }

  obtenerPosition(){
    return this.position;
  }

  setEstado(estado:any) {
     this.estado=estado;
     //E , PE, PU, UC, F, C
     switch (this.estado) {
      case 'E':
        this.position = 1;
        break;

      case 'PE':
        this.position = 2;
        break;

      case 'PU':
        this.position = 3;
        break;

      case 'UC':
        this.position = 4;
        break;
 
      case 'F':
        this.position = 0;
        break;

      case 'C':
        this.position = 0;
        break;
     
       default:
         break;
     }
  }

  setFavoritos(favoritos: ProductoInterface[]){
    this.favoritos = favoritos;
  }

  async agregarFavorito(favorito: ProductoInterface) {

    this.storage.get('usuario').then((val) => {
      // val.celular;
/*
    
      this.dataService.favoritosAccion(val['celular'], favorito.id, 'agregar').subscribe(async (resp) => {
        if (resp['success'] == true) {
          this.favoritos.push(favorito);
          const toast = await this.toastController.create({
            message: ' '+favorito.nombre+'  '+ resp['msg'],
            duration: 1000,
            position: 'bottom',
            color: "warning",
            mode:"ios",
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
            message: resp['msg'],
            duration: 1000,
            position: 'bottom'
          });
          await toast.present();
        }
      }, (error) => {

      });*/
    });
  }

  async quitarFavorito(id: string, nombre: string) {
    this.storage.get('usuario').then((val) => {
      // val.celular;
      /*
      this.dataService.favoritosAccion(val['celular'],id, 'quitar').subscribe(async (resp) => {
        if (resp['success'] == true) {
          let objIndex = this.favoritos.findIndex((favorito => favorito.id == id));
          if (objIndex !== -1) {
            this.favoritos.splice(objIndex, 1);
            const toast = await this.toastController.create({
              message: ' '+nombre+'  '+ resp['msg'],
              duration: 1000,
              position: 'bottom',
              color: "warning",
              mode:"ios",
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
        } else {
          const toast = await this.toastController.create({
            message: resp['msg'],
            duration: 1000,
            position: 'bottom'
          });
          await toast.present();
        }
      }, (error) => {

      });*/
    });

  }

  existeFavorito(id: string) {
    return this.favoritos.some(favorito => favorito.id === id);
  }

  consultaFavoritosApi() {
    this.storage.get('usuario').then((val) => {
      // val.celular;
      /*
      this.dataService.favoritosTraer(val['celular']).subscribe((resp) => {
        if(resp==null){
          this.favoritos=[];
        }else{
          this.favoritos=resp;
        }
       
      }, (error) => {
        this.favoritos=[];
      });*/
    });
  }

  obtenerNotificaciones() {
    return this.notificacionesNumero;
  }

  setNotificaciones(notificaciones:number) {
    return this.notificacionesNumero = notificaciones;
  }

  async notificacionesLeidas(celular:string){
    
    try {
      /*
      let respuesta = await this.dataService.notificacionesActualizar(celular).toPromise();
      if(respuesta['success']==true){
        this.notificacionesNumero = 0;
        }*/
    } catch (error) {
      this.notificacionesNumero = 0;
    }

  }

  consultaNotificacionesNumero() {
    this.notificacionesNumero = 0;
/*     this.storage.get('usuario').then((val) => {
      // val.celular;
      this.dataService.notificaciones(val['celular']).subscribe((resp) => {
        if(resp==null){
        this.notificacionesNumero = 0;
        }else{
          let length = resp.filter(d => d.leido=="n").length;
          this.notificacionesNumero= length;
        }
       
      }, (error) => {
        this.notificacionesNumero = 0;
      });
    }); */
  }

  obtenerPuntos() {
    return this.puntos;
  }

  consultaPuntosApi() {
    this.storage.get('usuario').then((val) => {
      /*
      this.dataService.puntosUsuario(val['celular']).subscribe((resp) => {
        this.puntos = resp;
      }, (error) => {
        this.puntos = "No hay conexión";
      });*/
    });
  }

  async showAlert(msg:any){
    const alert = await this.alertController.create({
      header: 'background',
      message:msg,
      backdropDismiss: false,
      mode:"ios",
      buttons: [
        {
          cssClass: 'primarybtn', 
          text: 'Aceptar',
          handler: async () => {

          }
        }
      ]
    });

    await alert.present();
  }

  async showAlert2(msg: any){
    const alert = await this.alertController.create({
      header: 'foreground',
      message:msg,
      backdropDismiss: false,
      mode:"ios",
      buttons: [
        {
          cssClass: 'primarybtn', 
          text: 'Aceptar',
          handler: async () => {

          }
        }
      ]
    });

    await alert.present();
  }
}


