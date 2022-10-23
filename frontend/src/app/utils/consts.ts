export const siteURL: string = 'localhost:4200';

export interface Product {
  product_id: number,
  name: string,
  description: string,
  price: number,
  image: any
}

export interface ProductsList extends Product{
  amount: number;
}
