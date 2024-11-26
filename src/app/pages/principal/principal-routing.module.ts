import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PrincipalPage } from './principal.page';

const routes: Routes = [
  { path: '', redirectTo: 'menu', pathMatch: 'full' },
  {
    path: '',
    component: PrincipalPage,
    children: [
      {
        path: 'menu',
        loadChildren: () =>
          import('./menu/menu.module').then((m) => m.MenuPageModule),
      },
      {
        path: 'categoria',
        loadChildren: () =>
          import('./categoria/categoria.module').then(
            (m) => m.CategoriaPageModule
          ),
      },

      {
        path: 'realizar',
        loadChildren: () =>
          import('./realizar/realizar.module').then(
            (m) => m.RealizarPageModule
          ),
      },
    ],
  },
  {
    path: 'empresa',
    loadChildren: () =>
      import('./empresa/empresa.module').then((m) => m.EmpresaPageModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PrincipalPageRoutingModule {}
