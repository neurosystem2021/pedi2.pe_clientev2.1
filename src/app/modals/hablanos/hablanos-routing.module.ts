import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HablanosPage } from './hablanos.page';

const routes: Routes = [
  {
    path: '',
    component: HablanosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HablanosPageRoutingModule {}
