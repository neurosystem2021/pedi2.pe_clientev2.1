import { Component, Input, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import { IonInput, ModalController, IonContent, ToastController, AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { Storage } from '@ionic/storage';
import { AccionesService } from 'src/app/services/acciones.service';
import { CallNumber } from '@awesome-cordova-plugins/call-number/ngx';
@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  @Input() nombreMotorizado?:string;
  @Input() mensajesSinLeer?:number;
  @Input() mensajes?:any;
  @ViewChild("content",{ static: false }) content?: IonContent;
  @Input() idCliente?:number;
  @Input() idPedido?:number;
  @Input() idMotorizado?:number;
  @Input() telefonoMotorizado?:any;
  @ViewChildren('allTheseThings') things?: QueryList<any>;
  @ViewChild('inputid', { static: false }) myInput?: IonInput;
  IdMotorizado?: number;
  IdPedido?: number;
  escucharNuevoMensaje?: Subscription;
  botonEnviar: boolean = false;
  nuevaEntrada: string = "";
  subcribescroll?:Subscription;
  constructor(
    public modalController:ModalController,
    public storage: Storage,
    public dataService: DataService,
    public accionesService: AccionesService,
    public toastController: ToastController,
    private callNumber: CallNumber,
    public alertController: AlertController,
  ) { }

  ngOnInit() {
    this.escucharNuevoMensaje = this.accionesService.mensajeEscuchar().subscribe((resp: any) => {
      this.refrescarMensajesCliente();
    });
  }

  //Ejecutar acciones mientras la vista se carga
  async ionViewWillEnter(){
    //Bajar el scroll hasta el final antes de que termine de cargar la vista
    this.scrollToBottom();
    this.subcribescroll= this.things?.changes.subscribe(t => {
      this.scrollToBottom();
    });
    this.refrescarMensajesCliente();
  }

  //Foco al input después 150ms después de cargar la vista 
  ionViewDidEnter(){
    setTimeout(() => {
      this.myInput?.setFocus();
    },150);
  }

  async llamarMotorizado(){
    const alert = await this.alertController.create({
      header: 'Llamada al motorizado',
      message: "¿Desea llamar al motorizado?  "+this.telefonoMotorizado+"  ",
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
            this.callNumber.callNumber(this.telefonoMotorizado, true)
            .then(res => console.log('Launched dialer!', res))
            .catch(err => console.log('Error launching dialer', err));
          }
        }
      ]
    });
  
    await alert.present();

  }

  //Función asincrónica para enviar mensajes nuevos al servidor
  async enviarMensaje(){
    this.nuevaEntrada = (''+this.nuevaEntrada).replace(new RegExp("'", 'g'), '');
    this.nuevaEntrada = (''+this.nuevaEntrada).replace(new RegExp('"', 'g'), '');
    this.nuevaEntrada = (''+this.nuevaEntrada).replace(new RegExp('\n', 'g'), '');
    this.nuevaEntrada = (''+this.nuevaEntrada).replace(new RegExp('\\'.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), '')
    if(this.nuevaEntrada.trim().length===0){
      return;
    }
    this.myInput?.setFocus();
    this.botonEnviar = true;
    this.refrescarNuevosMensajes();
    this.scrollToBottom();

  }

  async refrescarMensajesCliente(){
    try {
      let data = await this.dataService.getMensajes(this.idPedido);
      if(data.data.success){
        this.mensajes = data.data.chat!=null && data.data.chat!= ""  ? JSON.parse(data.data.chat) : [];
      }else{
        const toast = await this.createToaster(2000,data.data.msg,'danger');
        toast.present();
      }
    } catch (error: any) {
      const toast = await this.createToaster(2000,error,'danger');
      toast.present();
    }    
  }

  //Función para enviar y obtener los nuevos mensajes
  async refrescarNuevosMensajes(){

    try {
      let resp = await this.dataService.postNuevoMensajeServidor(this.idPedido,JSON.stringify({user:this.idCliente,msg:this.nuevaEntrada,motorizado:false}));

      if(resp.data.success){
        this.mensajes =  resp.data.chat!=null && resp.data.chat!="" ? JSON.parse(resp.data.chat):[];             
        this.accionesService.mensajeEmitirMotorizado(this.idMotorizado,this.idPedido,this.nuevaEntrada);
        this.nuevaEntrada = "";
      }else{
        const toast = await this.toastController.create({
          message: 'No se pudo enviar el mensaje, compruebe su conexión a internet.',
          duration: 2000,
          color: 'danger'
        });
        toast.present();
      }
      this.botonEnviar = false;
    } catch (error) {
      this.botonEnviar = false;
    }

  }

  //Cerrar el modal sin realizar ningún cambio
  dismiss(){
    this.modalController.dismiss(null);
    this.escucharNuevoMensaje?.unsubscribe();
  }

  //Abandona la vista
  ionViewDidLeave(){
    //Dejar de bajar el scroll cuando se abandone la vista
    this.subcribescroll?.unsubscribe();
    //Dejar de escuchar nuevos mensajes cuando se abandone la vista
   // this.escucharNuevoMensaje.unsubscribe();
  }

  //Bajar el scroll hasta el final
  scrollToBottom() {
    setTimeout(()=>{
      this.content?.scrollToBottom(50);
    },50);
  }

   //Crear mensajes toaster
   async createToaster(duration:number, message:string,color:string){
    const toast = await this.toastController.create({
      message: message,
      duration: duration,
      color: color
    });
    return toast;
  }

}

