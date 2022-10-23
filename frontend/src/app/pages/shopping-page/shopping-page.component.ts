import { KeyValuePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { catchError } from 'rxjs';
import { ProductsService } from 'src/app/services/products.service';
import * as consts from '../../utils/consts';
import { Buffer } from 'buffer';
import { StorageService } from 'src/app/services/token-storage.service';
import { SearchService } from 'src/app/services/search.service';
import { ThisReceiver } from '@angular/compiler';
@Component({
  selector: 'app-shopping-page',
  templateUrl: './shopping-page.component.html',
  styleUrls: ['./shopping-page.component.scss']
})
export class ShoppingPageComponent implements OnInit {

  public Products: consts.Product[] = [];
  public maxPageNumber!: number;
  public currentPage!: number;
  public uptoPage!: number;
  public startingPage: number = 1;
  public searchQuery!: string;
  public categories: Array<string> = [];
  public currentCategory!: string;
  public typeSearch!: string;

  constructor(private productService: ProductsService, private searchService: SearchService, private router: Router, private sessionStorage: StorageService) {}

  ngOnInit(): void {
    this.typeSearch = 'regular';
    this.currentCategory = '';
    this.searchService.getSearchText().subscribe((text) => {
      this.searchQuery = text;
      this.currentPage = 1;
      if (this.searchQuery === ''){
        this.loadProducts(this.currentPage);
        this.getPages();
      }
      else {
        this.loadProductsBySearch(this.searchQuery, this.currentPage);
        this.getPagesFromSearch(this.searchQuery);
      }

    });
    this.currentPage = 1;
    if (this.searchQuery === ''){
      this.loadProducts(this.currentPage);
      this.getPages();
    }
    else {
      this.loadProductsBySearch(this.searchQuery, this.currentPage);
      this.getPagesFromSearch(this.searchQuery);
    }

    this.productService.getAllCategories().subscribe({
      next:
        (data: any) => {
          this.categories = [];
          data.map((category: any) => {
            if (category.category)
              this.categories.push(category.category);
          })
        },
      error:
        (err: any) => {
          console.log(err.message);
        }
    })
  }

  //loading all products in the current page
  loadProducts(loadPageNumber: number){
    this.currentCategory = '';
    this.typeSearch = 'regular';
    this.currentPage = loadPageNumber;
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
    this.productService.getProducts(loadPageNumber).subscribe({
      next:
        (data: any)  => {
          this.Products = [];
          data.map((item: consts.Product, index: number) => {
            this.Products.push(item);
          })
        },
      error:
        (err: any) => {
          if (err.status === 401 || err.status === 403){
            this.sessionStorage.clean();
            alert('token expired');
            this.router.navigate(['/login']);
          }
        }
      });
  }

  //getting total products pages from service
  getPages(){
    this.productService.getProudctsPages().subscribe({
      next:
        (data: any) => {
          this.maxPageNumber = data[0].count;
        },
      error:
        err => {
          console.log(err.error);
        }
      })
  }

  //getting data from search
  loadProductsBySearch(text: string, loadPageNumber: number){
    this.currentPage = loadPageNumber;
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
    this.productService.getSearchProducts(text, loadPageNumber).subscribe({
      next:
        (data: any)  => {
          this.Products = [];
          data.map((item: consts.Product, index: number) => {
            this.Products.push(item);
          })
        },
      error:
        (err: any) => {
          if (err.status === 401 || err.status === 403){
            this.sessionStorage.clean();
            alert('token expired');
            this.router.navigate(['/login']);
          }
        }
      });
  }

  //getting pages number from service in the search query
  getPagesFromSearch(text: string){
    this.typeSearch = 'text';
    this.productService.getProudctsSearchPages(text).subscribe({
      next:
        (data: any) => {
          this.maxPageNumber = data[0].count;
        },
      error:
        err => {
          console.log(err.error);
        }
      });
  }

  //searching all the products in spesific selected category from dropdown
  filterByCategory(category: string, page: number){
    this.typeSearch = 'category';
    this.currentCategory = category;
    this.currentPage = page;
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });

    this.productService.getProudctsCategoryPages(category, this.searchQuery).subscribe({
      next:
        (data: any) => {
          this.maxPageNumber = data[0].count;
        },
      error:
        err => {
          console.log(err.error);
        }
    });

    this.productService.getCategoryProducts(category, this.searchQuery, page).subscribe({
      next:
        (data: any)  => {
          this.Products = [];
          data.map((item: consts.Product, index: number) => {
            this.Products.push(item);
          })
        },
      error:
        (err: any) => {
          console.log(err.message);
        }
    });
  }

  //how many pages calculation in the search
  pageSelection(){
    let pages: Array<number> = [];
    this.uptoPage =  this.currentPage < 3 ? this.maxPageNumber < 5 ? this.maxPageNumber : 5 : this.currentPage + 2 > this.maxPageNumber ? this.maxPageNumber : this.currentPage + 2;
    let startPage = this.currentPage < 3 ? 1 : this.uptoPage - 4;
    for (let index = 0; startPage <= this.uptoPage; startPage++, index++) {5
      pages[index] = startPage;
    }
    return pages;
  }

  typeSelection(page: number){
    switch (this.typeSearch) {
      case 'regular':
        this.loadProducts(page);
        break;
      case 'text':
        this.loadProductsBySearch(this.searchQuery, page);
        break;
      case 'category':
        this.filterByCategory(this.currentCategory, page);
        break;
      default:
        break;
    }
  }

  startedClass = false;
  completedClass = false;

  onStarted() {
    this.startedClass = true;
    setTimeout(() => {
      this.startedClass = false;
    }, 0);
  }

  onCompleted() {
    this.completedClass = true;
    setTimeout(() => {
      this.completedClass = false;
    }, 0);
  }
}
