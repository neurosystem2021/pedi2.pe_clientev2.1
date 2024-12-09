import { Component, OnInit } from '@angular/core';
import { AlertController, NavController, ToastController } from '@ionic/angular';
import { DataService } from 'src/app/services/data.service';
import { NavegacionService } from 'src/app/services/navegacion.service';
import { Storage } from '@ionic/storage';
import { SmsRetriever } from '@awesome-cordova-plugins/sms-retriever/ngx';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.page.html',
  styleUrls: ['./otp.page.scss'],
})

export class OtpPage implements OnInit {
  otp: any =  {
    first: '',
    second: '',
    third: '',
    forth: '',
  };
  telefono:any=null;
  nombre:any=null;
  otpCodigoServer:any=null;
  idCliente:any=null;
  fechaReg:any=null;
  fechaRegOtp:any=null;
  contador:string="";
  intervalo:any=null;
  habilitar:boolean=false;
  hashSMS:string='dgzH6F7xDpL';
  constructor(
    readonly navegacionService:NavegacionService,
    readonly navController: NavController,
    readonly alertController:AlertController,
    readonly dataService:DataService,
    readonly toastController:ToastController,
    readonly storage: Storage,
    readonly smsRetriever: SmsRetriever) { }

  ngOnInit() {
  }

  next(el: any) {
    el.setFocus();
  }

  start() {
    this.smsRetriever.getAppHash()
    .then((res: any) =>this.hashSMS = res )
    .catch((error: any) => this.hashSMS = 'dgzH6F7xDpL')
    .finally(async ()=>{
     this.smsRetriever.startWatching() 
      .then((res: any) => {
        //this.infoMensaje = JSON.stringify(res);
        let valido = false;
        if(res.Message && res.Message !=''){
          for (var i = 0; i < res.Message .length && valido==false; i++) {
  
            if(res.Message.charAt(i)==':'){
              this.otp.first = res.Message.charAt(i+2);
              this.otp.second = res.Message.charAt(i+3) ;
              this.otp.third = res.Message.charAt(i+4) ;
              this.otp.forth = res.Message.charAt(i+5);
              valido = true;
              this.mostrarMensajeBottom('Código de validación obtenido...',2000,'success')
              break; 
            }
          }
        }
      }) 
      .catch((error: any) => console.error(error));
    });
  }
  
  calcularReenvio(fechaOtp: any){
    let countDownDate = new Date(fechaOtp).getTime()+(1*60000);
    let ahora = new Date().getTime();

    if((countDownDate - ahora) < 0){
      this.habilitar = true;
      return
    }

    // Update the count down every 1 second
    this.intervalo = setInterval(()=> {
      // Get today's date and time
      let now = new Date().getTime();

      // Find the distance between now and the count down date
      let distance = countDownDate - now;

      // Time calculations for days, hours, minutes and seconds
      //var days = Math.floor(distance / (1000 * 60 * 60 * 24));
      //var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      let seconds = Math.floor((distance % (1000 * 60)) / 1000);

      // Display the result in the element with id="demo"
      this.contador = minutes + "m " + seconds + "s ";

      // If the count down is finished, write some text
      if (distance < 0) {
        this.removerIntervalo();
        this.habilitar = true;
        this.contador = "";
      }
    }, 1000);
  }

  ngOnDestroy(){
    clearInterval(this.intervalo);
  }

  removerIntervalo(){
    clearInterval(this.intervalo);
  }

  async ionViewWillEnter() {
    console.log(this.navegacionService.getUsuarioValid());
    let usuario = this.navegacionService.getUsuarioValid();

    if (usuario==null){
      this.navController.navigateRoot('/login', { animationDirection: 'back' });
      return;
    }

    this.telefono = usuario.Telefono;
    this.nombre = usuario.Nombres;
    this.idCliente = usuario.IdCliente;
    this.otpCodigoServer = usuario.OtpCodigo;
    this.fechaReg = usuario.FechaRegFormat;
    this.fechaRegOtp = usuario.FechaRegOtpFormat
    this.calcularReenvio(this.fechaRegOtp);
    this.start()
  }

  otpController(event: any,next: any,prev: any){
    if(event.target.value.length < 1 && prev){
      prev.setFocus()
    }
    else if(next && event.target.value.length>0){
      next.setFocus();
    }
    else {
     return 0;
    } 
    return 0;
 }

 async reenviar(){
  const alert = await this.alertController.create({
    header: 'Reenviar',
    message: "¿Se reenviará un nuevo código, está seguro?",
    mode:"ios",
    buttons: [
      {
        cssClass: 'secondarybtn', 
        text: 'Atrás',
        handler: () => {
         
        }
      }, {
        cssClass: 'primarybtn', 
        text: 'Sí, reenviar',
        handler: async () => {
          

            this.smsRetriever.getAppHash()
            .then((res: any) =>this.hashSMS = res )
            .catch((error: any) => this.hashSMS = 'dgzH6F7xDpL')
            .finally(async ()=>{
              try {
              this.start()  
              let respuestaNuevo = await this.dataService.postNuevoCodigoOtp(this.idCliente,this.hashSMS);
              if(respuestaNuevo.data.success==true){
                this.otpCodigoServer = respuestaNuevo.data.CodigoOtp;
                this.fechaRegOtp = respuestaNuevo.data.fechaOtp
                if(this.intervalo!=null){
                  clearInterval(this.intervalo);
                }
                this.habilitar=false;
                this.calcularReenvio(this.fechaRegOtp);
                this.mostrarMensajeBottom('Le enviamos un nuevo código por sms...',2000,'warning')
              }else if(respuestaNuevo.data.success==false){
                this.navController.navigateRoot('/login', { animationDirection: 'back' });
              }
              } catch (error) {
                this.mostrarMensajeBottom('Ha ocurrido un error al generar nuevo código',2000,'danger')
              }
            });  
        }
      }
    ]
  });

  await alert.present();
 }

 async validar(){
  if(this.otp.first == '' ||  this.otp.second == '' || this.otp.third  == '' || this.otp.forth == ''){
    this.mostrarMensajeBottom('Por favor complete el código de verificación',2000,'warning')
    return;
  }

   let codigo = this.otp.first + this.otp.second + this.otp.third + this.otp.forth;
   try {
     let respuestaValidar = await this.dataService.postValidarOtp(this.idCliente,codigo)
  
     if(respuestaValidar.data.success==true){
      let cliente = respuestaValidar.data.data;
    
      let postData = {
        'Apellidos': cliente.Apellidos,
        'Direccion': cliente.Direccion,
        'Direccion2':cliente.Direccion2,
        'Direccion3': cliente.Direccion3,
        'Dni': cliente.Dni,
        'Email': cliente.Email,
        'FechaMod': cliente.FechaMod,
        'FechaReg': cliente.FechaReg,
        'FechaRegFormat':cliente.FechaRegFormat,
        'FechaRegOtpFormat':cliente.FechaRegOtpFormat,
        'IdCliente': cliente.IdCliente,
        'Latitud': cliente.Latitud,
        'Longitud': cliente.Longitud,
        'Nombres': cliente.Nombres,
        'Puntos': cliente.Puntos,
        'Telefono': cliente.Telefono
        }
        
        let cuenta = {
          celular: cliente.Telefono,
          password: cliente.Password
        }
  
      await this.storage.set('cliente', postData);
      await this.storage.set('cuenta', cuenta)
      this.navegacionService.setUsuarioValid(null);
      this.mostrarMensajeBottom('Teléfono Validado, Bienvenido!',4000,"success");
      this.navController.navigateRoot('/principal/menu', { animationDirection: 'forward' });
     }else if(respuestaValidar.data.success==false){
      this.mostrarMensajeBottom('Codigo incorrecto',2000,"danger");
     }
   } catch (error) {
     
   }
 }

 async mostrarMensajeBottom(mensaje:string,duracion:number,color:string){
  const toast = await this.toastController.create({
    message: ' '+mensaje+'  ',
    duration: duracion,
    position: 'bottom',
    mode: "ios",
    color: color,
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
