import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-presentacion',
  templateUrl: './presentacion.page.html',
  styleUrls: ['./presentacion.page.scss'],
})
export class PresentacionPage implements OnInit {
  
  slideOpts = {
    initialSlide: 0,
    slidesPerView: 1,
    autoplay: false,

  };
  public posicion:number=1;
  constructor(public navCtrl: NavController,private storage:Storage) { 
    
  }
  ionViewDidEnter() {
   // this.slidePresentacion.lockSwipes(true); todo
  }

  ngOnInit() {
  }

  onSiguiente() {
    this.posicion++;
    //this.slidePresentacion.lockSwipes(false); todo
    //this.slidePresentacion.slideNext(1000); todo
    //this.slidePresentacion.lockSwipes(true); todo
  }
  onAtras(){
    this.posicion--;
    //this.slidePresentacion.lockSwipes(false); todo
    //this.slidePresentacion.slidePrev(1000); todo
    //this.slidePresentacion.lockSwipes(true); todo
  }
  onComenzar(){
    this.storage.set('presentacion', true);
    this.navCtrl.navigateRoot('/login', { animationDirection: 'forward' });
  }
}
