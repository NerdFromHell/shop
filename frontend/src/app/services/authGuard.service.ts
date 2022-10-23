import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';
import { StorageService } from './token-storage.service';

@Injectable()
export class AuthGuardService implements CanActivate {
  isLoggedIn = false;
  showNavbar: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private storageService: StorageService, private authService: AuthService, public router: Router) {}

  canActivate(): boolean {
    this.isLoggedIn = this.storageService.isLoggedIn();
    this.showNavbar.next(false);
    if (this.isLoggedIn) {
        // authorised so returns true
        this.showNavbar.next(true);
        return true;
    }
    // not logged in so redirect to login page
    alert('login first!!')
    this.router.navigate(['/login']);
    return false;
  }
}
