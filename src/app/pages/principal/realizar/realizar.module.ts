import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RealizarPageRoutingModule } from './realizar-routing.module';

import { RealizarPage } from './realizar.page';
import { UbicarPageModule } from 'src/app/modals/ubicar/ubicar.module';
import { UbicacionPageModule } from 'src/app/modals/ubicacion/ubicacion.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RealizarPageRoutingModule,
    UbicacionPageModule,
    UbicarPageModule
  ],
  declarations: [RealizarPage]
})
export class RealizarPageModule {}
