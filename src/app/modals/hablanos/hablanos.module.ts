import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HablanosPageRoutingModule } from './hablanos-routing.module';

import { HablanosPage } from './hablanos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HablanosPageRoutingModule
  ],
  declarations: [HablanosPage]
})
export class HablanosPageModule {}
