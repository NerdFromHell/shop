import { Component, Directive, DoCheck, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { SearchService } from 'src/app/services/search.service';
import { StorageService } from 'src/app/services/token-storage.service';
import { siteURL } from 'src/app/utils/consts';
import { DropDownAnimation } from 'src/animations/menu-dropdown.animation';

@Component({
  selector: 'app-navbar',
  animations:[DropDownAnimation],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit{

  url: string = siteURL;
  search : string ="";
  isCollapsed: boolean = false;
  isLoggedIn: boolean = false;
  constructor(private searchService: SearchService, private storageService: StorageService, private authService: AuthService, private router: Router) { }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        console.log('delete storage');
        this.storageService.clean();
        this.isLoggedIn = false;
        this.router.navigate(['/login']);
      },
      error: err => {
        console.log(err);
      }
    });
  }

  emptySearchText(): void {
    this.search = '';
    this.searchService.setSearchText(this.search);
  }

  setSerchText(): void {
    this.searchService.setSearchText(this.search);
    this.router.navigate(['/home']);
  }

  ngOnInit() {
    this.isLoggedIn = this.storageService.isLoggedIn();
    if (this.isLoggedIn) {
      this.router.navigate(['/']);
    }
  }
}
