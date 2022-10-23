import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CartPageComponent } from './pages/cart-page/cart-page.component';
import { ShoppingPageComponent } from './pages/shopping-page/shopping-page.component';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { AuthGuardService as AuthGuard } from './services/authGuard.service';

const routes: Routes = [
  { path: 'home', component: ShoppingPageComponent, canActivate: [AuthGuard]  },
  { path: 'cart', component: CartPageComponent, canActivate: [AuthGuard]  },
  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegisterPageComponent },
   // otherwise redirect to home
   { path: '**', redirectTo: 'home' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule { }
