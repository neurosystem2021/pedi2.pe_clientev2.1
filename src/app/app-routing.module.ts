import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  {
    path: 'inicio',
    loadChildren: () => import('./pages/inicio/inicio.module').then( m => m.InicioPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'registro',
    loadChildren: () => import('./pages/registro/registro.module').then( m => m.RegistroPageModule)
  },
  {
    path: 'principal',
    loadChildren: () => import('./pages/principal/principal.module').then( m => m.PrincipalPageModule)
  },
  {
    path: 'presentacion',
    loadChildren: () => import('./pages/presentacion/presentacion.module').then( m => m.PresentacionPageModule)
  },
  {
    path: 'promociones',
    loadChildren: () => import('./modals/promociones/promociones.module').then( m => m.PromocionesPageModule)
  },
  {
    path: 'cuenta',
    loadChildren: () => import('./modals/cuenta/cuenta.module').then( m => m.CuentaPageModule)
  },
  {
    path: 'notificaciones',
    loadChildren: () => import('./modals/notificaciones/notificaciones.module').then( m => m.NotificacionesPageModule)
  },
  {
    path: 'favoritos',
    loadChildren: () => import('./modals/favoritos/favoritos.module').then( m => m.FavoritosPageModule)
  },
  {
    path: 'hablanos',
    loadChildren: () => import('./modals/hablanos/hablanos.module').then( m => m.HablanosPageModule)
  },
  {
    path: 'ruta',
    loadChildren: () => import('./pages/ruta/ruta.module').then( m => m.RutaPageModule)
  },
  {
    path: 'chat',
    loadChildren: () => import('./modals/chat/chat.module').then( m => m.ChatPageModule)
  },
  {
    path: 'carritoruta',
    loadChildren: () => import('./modals/carritoruta/carritoruta.module').then( m => m.CarritorutaPageModule)
  },
  {
    path: 'pago',
    loadChildren: () => import('./modals/pago/pago.module').then( m => m.PagoPageModule)
  },
  {
    path: 'ubicacion',
    loadChildren: () => import('./modals/ubicacion/ubicacion.module').then( m => m.UbicacionPageModule)
  },
  {
    path: 'ubicar',
    loadChildren: () => import('./modals/ubicar/ubicar.module').then( m => m.UbicarPageModule)
  },
  {
    path: 'otp',
    loadChildren: () => import('./pages/otp/otp.module').then( m => m.OtpPageModule)
  },
  {
    path: 'mapa',
    loadChildren: () => import('./modals/mapa/mapa.module').then( m => m.MapaPageModule)
  },

];


@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
