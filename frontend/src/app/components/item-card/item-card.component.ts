import { Component, Input, NgModule, OnInit } from '@angular/core';
import { Product } from '../../utils/consts';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CartService } from '../../services/cart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-item-card',
  templateUrl: './item-card.component.html',
  styleUrls: ['./item-card.component.scss']
})
export class ItemCardComponent {

  @Input()
  product!: Product;

  @Input()
  set item(properties: Product){
    this.product = properties;
  }

  constructor(private _cartService: CartService, private _snackBar: MatSnackBar, public router: Router) {}

  //adding item to basket
  addToBasket() {
    if(this._cartService.addItem(this.product))
      this._snackBar.open('המוצר נוסף לסל', '', {
        duration: 1000,
        direction: 'rtl',
      });
    else
      this._snackBar.open('שגיאה', '', {
        duration: 1000,
        direction: 'rtl',
      });
  }

  //inserting the product to basket and navigating to cart page
  buyNow(){
    this.addToBasket();
    this.router.navigate(['/cart']);
  }

}
