import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EmpresaPageRoutingModule } from './empresa-routing.module';

import { EmpresaPage } from './empresa.page';
import { ProductoDetallePageModule } from 'src/app/modals/producto-detalle/producto-detalle.module';
import { MapaPageModule } from 'src/app/modals/mapa/mapa.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EmpresaPageRoutingModule,
    ProductoDetallePageModule,
    MapaPageModule
  ],
  declarations: [EmpresaPage]
})
export class EmpresaPageModule {}
