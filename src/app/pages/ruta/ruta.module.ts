import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RutaPageRoutingModule } from './ruta-routing.module';

import { RutaPage } from './ruta.page';
import { ChatPageModule } from 'src/app/modals/chat/chat.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RutaPageRoutingModule,
    ChatPageModule
  ],
  declarations: [RutaPage]
})
export class RutaPageModule {}
