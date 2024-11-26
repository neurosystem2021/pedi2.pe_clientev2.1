import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UbicarPage } from './ubicar.page';

const routes: Routes = [
  {
    path: '',
    component: UbicarPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UbicarPageRoutingModule {}
