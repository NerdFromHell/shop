import { Injectable, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import * as consts from '../utils/consts';

@Injectable({providedIn: 'root'})
export class CartService{
  productsList: consts.ProductsList[] = [];
  shopCartProductsList = new Subject<consts.ProductsList[]>();

  constructor(private _cookieService: CookieService) {
    this.shopCartProductsList = new BehaviorSubject<consts.ProductsList[]>(new Array<consts.ProductsList>());
    //Checks if cart coockie is not empty
    try {
      let cartInfo: any = localStorage.getItem('cart')
      if (cartInfo)
        this.productsList = JSON.parse(cartInfo)
      else
        this.productsList = [];
    }
    catch {
      this.productsList = [];
    }
    this.shopCartProductsList.next(this.productsList);
  }

  setCookie() {
    localStorage.setItem('cart', JSON.stringify(this.productsList));
    this._cookieService.set('cart', JSON.stringify(this.productsList));
  }

  deleteCookie(){
    localStorage.removeItem('cart');
    this._cookieService.delete('cart');
  }

  getProductsList(): Subject<consts.ProductsList[]> {
    return this.shopCartProductsList;
  }

  addItem(product: consts.Product){
    console.log(this.productsList)
    try{
      const found = this.productsList.find(element => element.product_id === product.product_id);
      if(found === undefined)
      {
        this.productsList.push({...product, amount: 1});
      }
      else {
        this.productsList.find(element => { if(element.product_id === product.product_id) element.amount++} );
      }
      this.shopCartProductsList.next(this.productsList);
      this.setCookie();
      return true;
    }
    catch
    {
      return false;
    }
  }

  deleteItem(productId: number){
    // idex of id 2
    let index = this.productsList.findIndex(function(employee) {
      return employee.product_id === productId;
    });
    console.log(`item in cart #:` + index + ' productId #:'  + productId);
    // slice index with id 2
    this.productsList = [...this.productsList.slice(0, index), ...this.productsList.slice(index + 1)];
    this.shopCartProductsList.next(this.productsList);
    this.setCookie();
  }
}
