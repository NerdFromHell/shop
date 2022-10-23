import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Product } from 'src/app/utils/consts';

@Component({
  selector: 'app-cart-item-card',
  templateUrl: './cart-item-card.component.html',
  styleUrls: ['./cart-item-card.component.scss']
})
export class CartItemCardComponent {

  @Input()
  product!: Product;
  @Input()
  amount!: number;

  @Input()
  set item(properties: Product){
    this.product = properties;
  }

  @Input()
  set quantity(qty: number){
    this.amount = qty;
  }

  @Output()
  removeProduct: EventEmitter<number> = new EventEmitter();

  //deleting product from cart
  getProductId(evt: Event){
    this.removeProduct.emit(this.product.product_id);
  }
}
