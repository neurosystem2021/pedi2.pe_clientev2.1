import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Storage } from '@ionic/storage';
import { AlertController, ModalController, NavController } from '@ionic/angular';
import { HerramientasService } from './herramientas.service';
import { Router } from '@angular/router';

import { INotificationPayload } from 'cordova-plugin-fcm-with-dependecy-updated';
import {FCM} from '@awesome-cordova-plugins/fcm';

import { Platform } from '@ionic/angular';
import { DataService } from './data.service';
import { AudioTrack } from '../interface/audioTrack.interface';


@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  public socketStatus = false;
  public celular = "";

  public hasPermission?: boolean;
  public token: string='';
  public pushPayload?: INotificationPayload | null;

  audioTracks: AudioTrack[] = [
    { name: 'msg', audio: new Audio('assets/audio/notificacion/msg.mp3') },
    { name: 'chat', audio: new Audio('assets/audio/notificacion/chat.mp3') },
  ];


  constructor(
    private socket: Socket,
    private storage: Storage,
    public alertController: AlertController,
    public navController: NavController,
    public herramientasService: HerramientasService,
    private router: Router,
    private platform: Platform,
    public dataService:DataService,
    private modalController:ModalController) {
    this.setupFCM();
    this.checkStatus();
  }
  conectarSocket() {
    this.socket.connect();
  }

  private async setupFCM() {
    await this.platform.ready();
    console.log('FCM setup started');

    if (!this.platform.is('cordova')) {
      return;
    }
    console.log('In cordova platform');

    FCM.subscribeToTopic('general')

    /*console.log('Subscribing to token updates');
    FCM.onTokenRefresh().subscribe((newToken) => {
      this.token = newToken;
      console.log('onTokenRefresh received event with: ', newToken);
    });*/

    console.log('Subscribing to new notifications');
    FCM.onNotification().subscribe(async (payload: any) => {
      this.pushPayload = payload;
      /*
      if (payload.wasTapped) {
        this.herramientasService.showAlert(JSON.stringify(this.pushPayload));
      } else {
        this.herramientasService.showAlert2(JSON.stringify(this.pushPayload));
      }*/

      if(payload.ruta){
        let cliente = await this.storage.get('cliente');
        if (cliente != null) {
          try {
            let respuestaPedido = await this.dataService.getPedidoExisteDetalle(Number(cliente.IdCliente));
            if(respuestaPedido.data.success==true){
              let respuestaPedidoInfo=respuestaPedido.data.data;
              this.herramientasService.setEstado(respuestaPedidoInfo.Estado);
  
            }else if(respuestaPedido.data.success==false){
              
              if (this.router.isActive('/ruta', true) && this.router.url === '/ruta') {
                this.navController.navigateRoot('/principal', { animationDirection: 'forward' });
              }
            }
          } catch (error) {
            
          }
        }
      }
      
      if(payload.mensaje && !payload.wasTapped){
        if (this.router.isActive('/ruta', true) && this.router.url === '/ruta') {

          try {
            const element = await this.modalController.getTop();
            if (!element) {
             this.playAudio('msg');
            }else{
             this.playAudio('chat');
            }
          } catch (error) {
            console.log("error");
          }
        }
      }
      
    });

   
  }

  getToken() {
    FCM.getToken().then((token: any) => {
      // Register your new token in your back-end if you want
      // backend.registerToken(token);
    });
  }

  checkStatus() {
    this.socket.on('connect', async () => {
      try {
        let cliente = await this.storage.get('cliente');
        if (cliente != null) {

          try {
            this.token = await FCM.getToken();
          } catch (error) {
            
          }
          

          this.socket.emit(
            'conectar',
            { tipo: 'CLIENTE', objeto:{iddb: cliente.IdCliente, nombres: cliente.Nombres, apellidos: cliente.Apellidos,token:this.token} },
            async (resp: any) => {
              console.log(resp);
              switch (resp['existe']) {
                case true: {
                     if (
                       !this.router.isActive('/login', true) &&
                       this.router.url !== '/login'
                     ) {
                       this.navController.navigateRoot('/login');
                     }
                     const alert = await this.alertController.create({
                       header:
                         '¡Solo puede usar la aplicación en 1 dispositivo!',
                       backdropDismiss: false,
                       message:
                         'Su cuenta ya esta ejecutandosé en otro dispositivo, por favor cierre sesión en el otro dispositivo e intente nuevamente en este.',
                       mode: 'ios',
                       buttons: [
                         {
                           cssClass: 'primarybtn',
                           text: 'Entiendo',
                           handler: () => {},
                         },
                       ],
                     });
                     await alert.present();

                     await this.storage.remove('cliente');
                     this.socketStatus = false;
                     this.desconectarSocket();
                  break;
                }

                case false: {
                  console.log('Connectado al servidor');
                  this.socketStatus = true;

                  if (
                    this.router.isActive('/presentacion', true) &&
                    this.router.url === '/presentacion'
                  ) {
                    this.navController.navigateRoot('/login', {
                      animationDirection: 'forward',
                    });
                  }

                  if (
                    this.router.isActive('/inicio', true) &&
                    this.router.url === '/inicio'
                  ) {
                    this.navController.navigateRoot('/principal', {
                      animationDirection: 'forward',
                    });
                  }

                  if (
                    this.router.isActive('/login', true) &&
                    this.router.url === '/login'
                  ) {
                    this.navController.navigateRoot('/principal', {
                      animationDirection: 'forward',
                    });
                  }
                  break;
                }

                default: {
                  console.log('Error conectar socket');
                  break;
                }
              }
            }
          );
        } else {
          this.desconectarSocket();
          this.navController.navigateRoot('/login');
        }
      } catch (error) {}
    });

    this.socket.on('disconnect', () => {
      console.log('Desconectado del servidor');
      this.socketStatus = false;
    });   

  }

  desconectarSocket() {
    this.socket.disconnect();
  }

  //emita cuaquier evento
  emit(evento: string, payload?: any, callback?: Function) {
    console.log("Emitiendo ", evento);
    this.socket.emit(evento, payload, callback);
  }
  //escuchar cualquier evento
  listen(evento: string) {
    return this.socket.fromEvent(evento);
  }

  playAudio(name: string) {
    const track = this.audioTracks.find(t => t.name === name);
    if (track) {
      track.audio.play();
    }
  }
}