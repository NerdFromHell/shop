import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { CartService } from 'src/app/services/cart.service';
import { ProductsList } from 'src/app/utils/consts';

@Component({
  selector: 'app-cart-page',
  templateUrl: './cart-page.component.html',
  styleUrls: ['./cart-page.component.scss']
})
export class CartPageComponent implements OnInit {

  productsList: ProductsList[] = [];

  constructor(private _cartService: CartService) {
  }

  ngOnInit(): void {
    this._cartService.getProductsList().subscribe(productsArray => this.productsList = productsArray);
  }

  deleteItemFromCart(productId: number){
    this._cartService.deleteItem(productId);
  }

  totalCost(): number{
    let totalSum: number = 0;
    this.productsList.map((product) => totalSum += product.price*product.amount);
    return totalSum;
  }
}
