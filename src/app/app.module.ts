import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { CarritoPageModule } from './modals/carrito/carrito.module';

import { IonicStorageModule } from '@ionic/storage-angular';
import { environment } from 'src/environments/environment';

import { Market } from '@awesome-cordova-plugins/market/ngx';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { SmsRetriever } from '@awesome-cordova-plugins/sms-retriever/ngx';
import { NativeGeocoder } from '@awesome-cordova-plugins/native-geocoder/ngx';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { LocationAccuracy } from '@awesome-cordova-plugins/location-accuracy/ngx';


const config: SocketIoConfig = { url: environment.wsUrl, options: {} };

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    IonicStorageModule.forRoot(),
    SocketIoModule.forRoot(config),
    AppRoutingModule,
    CarritoPageModule,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    Market,
    StatusBar,
    SmsRetriever,
    NativeGeocoder,
    AndroidPermissions,
    LocationAccuracy
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
