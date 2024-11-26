import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, LoadingController, MenuController, ToastController, AlertController, IonInput } from '@ionic/angular';
import { DataService } from 'src/app/services/data.service';
import { Storage } from '@ionic/storage';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
import { NavegacionService } from 'src/app/services/navegacion.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  celular: string = "";
  password: string = "";
  public loaderToShow: any;
  showPassword = false;
  @ViewChild('passinput',{static:false}) input!: IonInput;

  constructor(
    private router: Router,
    public navCtrl: NavController,
    public loadingController: LoadingController,
    public menuController: MenuController,
    public toastController: ToastController,
    public dataService: DataService,
    private storage: Storage,
    public alertController: AlertController,
    private statusBar: StatusBar,
    private navegacionService:NavegacionService) { 
      this.statusBar.backgroundColorByHexString('#FFB414');
      this.statusBar.styleDefault();
    }

  ngOnInit() {

  }

  toggleShow() {
    this.showPassword = !this.showPassword;
    this.input.type = this.showPassword ? 'text' : 'password';
  }

  onIrRegistro() {
    this.navCtrl.navigateRoot('/registro', { animationDirection: 'forward' });
  }

  async ionViewWillEnter() {
    let cuenta = await this.storage.get('cuenta');
    if(cuenta != null){
      this.celular = cuenta.celular
      this.password = cuenta.password
    }
  }

  async onIniciarSesion() {
    if((this.celular+'').trim()==''){
      this.mostrarMensajeBottom('Por favor ingrese su telefono.',2000,'warning');
      return;
    }

    if((this.password+'').trim()==''){
      this.mostrarMensajeBottom('Por favor ingrese su contraseña.',2000,'warning');
      return;
    }

    await this.mostrarLoader('Iniciando Sesión...')

    try {
    let respuestaLogin = await this.dataService.getLoginCliente(this.celular,this.password);

    if(respuestaLogin.data.success==false){
      this.ocultarLoader();
      this.mostrarMensajeBottom(respuestaLogin.data.msg,2000,'danger');
      return;
    }
    

    if(respuestaLogin.data.success==true && respuestaLogin.data.valido==false){
      this.navegacionService.setUsuarioValid(respuestaLogin.data.data);
      this.ocultarLoader();
      let cuenta = {
        celular: this.celular,
        password: this.password
      }
      await this.storage.set('cuenta', cuenta)
      this.navCtrl.navigateRoot('/otp', { animationDirection: 'forward' });
      this.mostrarMensajeBottom('Por favor valide su número',3000,'warning');
      return;
    }

    let cliente = respuestaLogin.data.data;
    if(cliente.Anulado==0){
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
        'Telefono': cliente.Telefono,
      };
      
      let cuenta = {
        celular: this.celular,
        password: this.password
      }

      await this.storage.set('cliente', postData);
      await this.storage.set('cuenta', cuenta)
      let respuestaPedidoExiste = await this.dataService.getPedidoExiste(Number(cliente.IdCliente));
      if(respuestaPedidoExiste.data.success==true){
        this.navCtrl.navigateRoot('/ruta', { animationDirection: 'forward' });
      }else{
        this.router.navigate(['/principal/menu'])
        //this.navCtrl.navigateRoot('/principal/menu')
      }
    }else{
      const alert = await this.alertController.create({
        header: '¡Cuenta bloqueada!',
        backdropDismiss: false,
        message: "Su cuenta ha sido bloqueda pueder ser por causas como pedidos falsos, envio masivo de mensajes, etc.  Si es un error comunicate con nosotros vía whastapp (+51 997 578 199)  .",
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

     this.ocultarLoader();

    } catch (error) {
     this.ocultarLoader();
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

  async mostrarLoader(mensaje:string){
    this.loaderToShow = await this.loadingController.create({
      message: mensaje,
      spinner: 'circles',
      backdropDismiss: false,
      mode: 'ios',
    });
    this.loaderToShow.present();
  }

  ocultarLoader(){
    this.loaderToShow.dismiss();
  }

  async lostPass(){
    const alert = await this.alertController.create({
      header: '¡Comunicate con nosotros!',
      backdropDismiss: false,
      message: "Comunicate con nosotros vía whastapp (+51 997 578 199) para recuperar su cuenta.",
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
