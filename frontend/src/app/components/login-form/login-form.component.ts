import { Component, OnInit } from '@angular/core';
import {FormControl, Validators, FormBuilder, FormGroup} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { StorageService } from 'src/app/services/token-storage.service';
@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent implements OnInit {
  loginForm!: FormGroup;
  hide = true;
  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';

  constructor(private formBuilder: FormBuilder, private authService: AuthService, private storageService: StorageService, private router: Router, private _snackBar: MatSnackBar) { }


  ngOnInit(): void {
    if (this.storageService.isLoggedIn()) {
      this.isLoggedIn = true;
      this.router.navigate(['/home']);
    }

    //
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email, Validators.pattern('^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}$')]],
      password: ['', [Validators.required, Validators.pattern('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{6,}$')]],
    });
  }

  destroy$: Subject<boolean> = new Subject<boolean>();

  /**
   * Checking with the authService and backend if user login info is valid
   */
  onSubmit() {
    //Exits if form fields are not filled
    if (this.loginForm.invalid) {
      this._snackBar.open('מלא את כל השדות לפי הנדרש', '', { duration: 2000, direction: 'rtl' });
      return;
    }

    this.authService.login(this.loginForm.controls['email'].value, this.loginForm.controls['password'].value).subscribe({
      next: data => {
        this.storageService.saveUser(data);
        this.isLoginFailed = false;
        this.isLoggedIn = true;
        window.location.reload(); //Make navbar status chnage
        this.router.navigate(['/home']);

      },
      error: err => {
        this.errorMessage = err.error;
        console.log(err)
        if(this.errorMessage === 'password do not match!')
          this._snackBar.open('שם משתמש או סיסמה שגויים', '', { duration: 2000, direction: 'rtl' });
        if(err.error === 'user do not exist!')
          this._snackBar.open('האימייל לא קיים במערכת, נסה להרשם', '', { duration: 3000, direction: 'rtl' });
        this.isLoginFailed = true;
      }
    });
  }
}
