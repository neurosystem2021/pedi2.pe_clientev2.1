import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NavController, AlertController, ToastController, LoadingController, IonInput, IonicSlides } from '@ionic/angular';
import { DataService } from 'src/app/services/data.service';
import { Storage } from '@ionic/storage';
import { NavegacionService } from 'src/app/services/navegacion.service';
import { SmsRetriever } from '@awesome-cordova-plugins/sms-retriever/ngx';
import { AudioTrack } from 'src/app/interface/audioTrack.interface';
@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage implements OnInit, AfterViewInit {
  celular: string = "";
  celular2: string = "";
  pin: string = "";
  pin2: string = "";
  dni: string = "";
  nombres: string = "";
  apellidos: string = "";
  accionBoton: string = "SIGUIENTE";
  heroForm: any;
  sliderOne: any;
  slideOptsOne = {
    initialSlide: 0,
    slidesPerView: 1,
    autoplay: false,

  };
  loaderToShow: any;
  showPassword = false;
  showPassword2 = false;
  passwordAlerta = false;
  numeroAlerta = false;
  dniAlerta = false;
  @ViewChild('passinput',{static:false}) input!: IonInput;
  @ViewChild('passinput2',{static:false}) input2!: IonInput;
  @ViewChild('swiper') swiperRef!: ElementRef;
  swiperInstance: any;

  hashSMS:string='dgzH6F7xDpL';
  swiperModules = [IonicSlides];

  audioTracks: AudioTrack[] = [
    { name: 'completedatos', audio: new Audio('assets/audio/registro/completedatos.mp3') },
    { name: '8digitos', audio: new Audio('assets/audio/registro/8digitos.mp3') },
    { name: 'passnocoinciden', audio: new Audio('assets/audio/registro/passnocoinciden.mp3') },
    { name: 'min4', audio: new Audio('assets/audio/registro/min4.mp3') },
    { name: 'numnocoinciden', audio: new Audio('assets/audio/registro/numnocoinciden.mp3') },
    { name: '9digitos', audio: new Audio('assets/audio/registro/9digitos.mp3') },
    { name: 'inicio', audio: new Audio('assets/audio/registro/inicio.mp3') },
    { name: 'iniciopersonales', audio: new Audio('assets/audio/registro/iniciopersonales.mp3') },

  ];


  constructor(public navCtrl: NavController,
    public alertController: AlertController,
    public toastController: ToastController,
    public dataService: DataService,
    public loadingController: LoadingController,
    private storage: Storage,
    private navegacionService:NavegacionService,
    private smsRetriever: SmsRetriever) {
  }


  ngOnInit() {
    this.celular=''
    this.pin = ''
  }

  ngAfterViewInit() {
    this.swiperInstance = this.swiperRef.nativeElement.swiper;
  }
  
  toggleShow() {
    this.showPassword = !this.showPassword;
    this.input.type = this.showPassword ? 'text' : 'password';
  }

  toggleShow2() {
    this.showPassword2 = !this.showPassword2;
    this.input2.type = this.showPassword2 ? 'text' : 'password';
  }

  ionViewDidEnter() {

    this.numeroAlerta = true;
    setTimeout(() => {
      this.numeroAlerta = false;
    }, 2000);

    this.passwordAlerta = true;
    setTimeout(() => {
      this.passwordAlerta = false;
    }, 2000);

    try {
      this.playAudio('inicio');
    } catch (error) {
      console.log("error");
    }
  }

  async ionViewWillLeave() {
    try {
      const element = await this.loadingController.getTop();
      if (element) {
        this.loadingController.dismiss();
      }

    } catch (error) {

    }
  }

  async slideNext() {
    switch (this.accionBoton) {
      case "SIGUIENTE": {
        if ((this.celular + "").trim().length == 9) {
          //if (this.celular == this.celular2) {
            if ((this.pin + "").trim().length >= 4) {
              //if (this.pin === this.pin2) {
                
                await this.mostrarLoader("Verficando teléfono...")
                /*consulta api*/
                try {
                  let respuestaExiste = await this.dataService.postExisteCliente(this.celular);
                  debugger
                  if(respuestaExiste.data.success==true){
                    this.mostrarMensajeBottom(respuestaExiste.data.msg,3000,"danger")
                  }else if(respuestaExiste.data.success==false){
                    this.loaderToShow.dismiss();
                    this.accionBoton = "CREAR CUENTA";
                    this.swiperInstance.slideNext();
                    try {
                      this.playAudio('iniciopersonales');
                      this.mostrarMensajeBottom("Por favor complete su nombre",7000,"primary")
                    } catch (error) {
                      console.log("error");
                    }
                  }
                  this.ocultarLoader();
                } catch (error) {
                  console.log(error);
                  this.ocultarLoader();
                  this.mostrarMensajeBottom("No hay conexión",3000,"danger");
                }

                /*fin consulta api*/
              /*} else {
                this.passwordAlerta = true;
                setTimeout(() => {
                  this.passwordAlerta = false;
                }, 3000);

                try {
                 this.playAudio('passnocoinciden');
                } catch (error) {
                  console.log("error");
                }
                this.mostrarMensajeBottom(" "+'Las constraseñas no coinciden.'+"  ",3000,"warning");
              }*/
            } else {
              this.passwordAlerta = true;
              setTimeout(() => {
                this.passwordAlerta = false;
              }, 3000);
              
              try {
                this.playAudio('min4');
              } catch (error) {
                console.log("error");
              }
              this.mostrarMensajeBottom(" " +'La contraseña debe tener mínimo 4 dígitos.'+"  ",3000,"warning");
            }

          /*} else {
            this.numeroAlerta = true;
            setTimeout(() => {
              this.numeroAlerta = false;
            }, 3000);
            
            try {
              this.playAudio('numnocoinciden');
            } catch (error) {
              console.log("error");
            }
            this.mostrarMensajeBottom(" " +'Los números de celular no coinciden.'+"  ",3000,"warning");
          }*/

        } else {
          this.numeroAlerta = true;
          setTimeout(() => {
            this.numeroAlerta = false;
          }, 3000);
          
          try {
            this.playAudio('9digitos');
          } catch (error) {
            console.log("error");
          }
          this.mostrarMensajeBottom(" " +'El número de celular debe tener 9 digitos.'+"  ",3000,"warning");
        }
        break;

      }

      case "CREAR CUENTA": {
        //if ((this.dni + "").trim().length == 8) {
          if ((this.nombres + "").trim().length > 0) {
            /*consulta api*/

            let dataCliente = {
              Telefono:this.celular,
              Contrasena: this.pin,
              //Dni:this.dni,
              Nombres:this.nombres.toUpperCase(),
              //Apellidos:this.apellidos.toUpperCase()
            }
            await this.mostrarLoader("Creando Cuenta...")
            this.smsRetriever.getAppHash()
            .then((res: any) =>this.hashSMS = res )
            .catch((error: any) => this.hashSMS = 'dgzH6F7xDpL')
            .finally(async ()=>{
              try {
                let respuestaRegistro = await this.dataService.postRegistroCliente(dataCliente,this.hashSMS);
                if(respuestaRegistro.data.success==true){
  
                  try {
                    let respuestaLogin = await this.dataService.getLoginCliente(this.celular,this.pin);
                    if(respuestaLogin.data.success==true){
                      this.navegacionService.setUsuarioValid(respuestaLogin.data.data);
                      let cuenta = {
                        celular: respuestaLogin.data.data.Telefono,
                        password: respuestaLogin.data.data.Password
                      }
  
                      await this.storage.set('cuenta', cuenta)
                      this.navCtrl.navigateRoot('/otp', { animationDirection: 'forward' });
                      this.mostrarMensajeTop('Por favor valide su número',3000,'warning');    
                    }else{
                      this.navCtrl.navigateRoot('/login', { animationDirection: 'back' });
                    }
                  } catch (error) {
                    this.navCtrl.navigateRoot('/login', { animationDirection: 'back' });
                  }
  
                 }
                this.ocultarLoader();
              } catch (error) {
                this.ocultarLoader();
                this.mostrarMensajeBottom("No hay conexión",3000,"danger");
              }
              /*fin consulta api*/
            })

          } else {
            try {
              this.playAudio('completedatos');
            } catch (error) {
              console.log("error");
            }
            this.mostrarMensajeBottom(" " +'Por favor complete los datos.'+"  ",3000,"warning");
          }
        /*} else {
          this.dniAlerta = true;
          setTimeout(() => {
            this.dniAlerta = false;
          }, 3000);
          
          try {
            this.playAudio('8digitos');
          } catch (error) {
            console.log("error");
          }
          this.mostrarMensajeBottom(" " +'El DNI debe tener 8 dígitos.'+"  ",3000,"warning");
        }*/
        break;
      }

    }

  }

  //Move to previous slide
  slidePrev(slideView: any) {
    slideView.slidePrev(500).then(() => {

    });;
  }

  onIrLogin() {
    this.navCtrl.navigateRoot('/login', { animationDirection: 'back' });
  }

  async onBuscarDni(){
    if((''+this.dni).trim().length==8){
      try {
        await this.mostrarLoader("Buscando...")
        let respuestaBusqueda = await this.dataService.getDataDni(this.dni);
        if(respuestaBusqueda.data.success==true){
          this.nombres = respuestaBusqueda.data.data.nombres
          this.apellidos = respuestaBusqueda.data.data.apellidoPaterno +" "+ respuestaBusqueda.data.data.apellidoMaterno
          this.mostrarMensajeBottom("Dni encontrado, se completó sus datos.",3000,"success");
        }else{
          this.mostrarMensajeBottom("No encontrado, complete sus datos manualmente.",3000,"warning");
        }
        this.ocultarLoader()
      } catch (error) {
         this.mostrarMensajeBottom("Error, complete sus datos manualmente.",3000,"warning");
         this.ocultarLoader()
      }
    }
  }

  async mostrarMensajeTop(mensaje:string,duracion:number,color:string){
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

  async mostrarMensajeBottom(mensaje:string,duracion:number,color:string){
    const toast = await this.toastController.create({
      message: ' '+mensaje+'  ',
      duration: duracion,
      position: 'top',
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

  playAudio(name: string) {
    const track = this.audioTracks.find(t => t.name === name);
    if (track) {
      track.audio.play();
    }
  }
}
