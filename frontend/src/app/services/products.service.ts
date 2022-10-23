import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Product } from '../utils/consts';
import { AuthService } from './auth.service';
import { StorageService } from './token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  endpoint: string = 'http://localhost:3000/products';
  productsList!: Subject<Product[]>;
  productData: any;
  checkToken!: string;

  constructor(private http: HttpClient, private authService: AuthService, private storageService: StorageService) {}

  getProducts(page: number){
    let token = this.storageService.getUser().token;
    return this.http.post<Product[]>(`${this.endpoint}/getproducts?${page}`, { page, token });
  }

  //All the different catergories to display in the dropdown filter
  getAllCategories(){
    return this.http.get(`${this.endpoint}/getallcategories`);
  }

  getCategoryProducts(category: string, searchText: string, page: number){
    return this.http.post(`${this.endpoint}/getcategoryproducts`, { category, searchText, page });
  }

  getProudctsCategoryPages(category: string, searchText: string){
    return this.http.post<number>(`${this.endpoint}/getsearch/products/category/pages`, { category, searchText });
  }

  getSearchProducts(searchText: string, page: number){
    let token = this.storageService.getUser().token;
    return this.http.post<Product[]>(`${this.endpoint}/getsearch/products`,  { page, token, searchText });
  }

  getProudctsPages(){
    return this.http.get<number>(`${this.endpoint}/getpages`);
  }

  getProudctsSearchPages(searchText: string){
    return this.http.post<number>(`${this.endpoint}/getsearch/products/pages`, { searchText });
  }
}
