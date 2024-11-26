import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UbicarPageRoutingModule } from './ubicar-routing.module';

import { UbicarPage } from './ubicar.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UbicarPageRoutingModule
  ],
  declarations: [UbicarPage]
})
export class UbicarPageModule {}
