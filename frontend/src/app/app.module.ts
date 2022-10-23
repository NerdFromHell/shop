import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';

import { NgxNavbarModule } from 'ngx-bootstrap-navbar';
import { NgProgressModule } from "ngx-progressbar";
import { NgProgressHttpModule } from "ngx-progressbar/http";

import { AppRoutingModule } from './app-routing.module'
import { CartPageComponent } from './pages/cart-page/cart-page.component';
import { ShoppingPageComponent } from './pages/shopping-page/shopping-page.component';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';

import { ItemCardComponent } from './components/item-card/item-card.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { CartItemCardComponent } from './components/cart-item-card/cart-item-card.component';
import { LoginFormComponent } from './components/login-form/login-form.component';
import { RegisterFormComponent } from './components/register-form/register-form.component';
import { httpInterceptorProviders } from './helpers/auth.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    ShoppingPageComponent,
    CartPageComponent,
    ItemCardComponent,
    NavbarComponent,
    CartItemCardComponent,
    LoginPageComponent,
    LoginFormComponent,
    RegisterPageComponent,
    RegisterFormComponent,
  ],
  imports: [
    HttpClientModule,
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    NgxNavbarModule,
    FlexLayoutModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatSnackBarModule,
    MatIconModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatMenuModule,
    NgProgressModule.withConfig({
      spinner: false,
      color: "lightgreen"
    }),
    NgProgressHttpModule
  ],
  providers: [CookieService, httpInterceptorProviders],
  bootstrap: [AppComponent]
})
export class AppModule { }
