import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { StorageService } from './services/token-storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'shop';
  isLoggedIn = false;
  toShowNavbar!: boolean;
  constructor(private storageService: StorageService, private authService: AuthService){}

  ngOnInit(): void {
    this.isLoggedIn = this.storageService.isLoggedIn();
  }

}
