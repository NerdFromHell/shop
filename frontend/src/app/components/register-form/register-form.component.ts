import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.scss']
})
export class RegisterFormComponent implements OnInit {

  registerForm!: FormGroup;
  submitted = false;
  hide = true;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private formBuilder: FormBuilder, private authService: AuthService, private router: Router, private _snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email, Validators.pattern('^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}$')]],
      password: ['', [Validators.required, Validators.pattern('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{6,}$')]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]+$'), Validators.maxLength(10), Validators.minLength(10)]]
    });
  }

  /**
   * Checking with the authService and backend if user info is valid and to be stored
   */
  onSubmit() {
      this.submitted = true;
      //Exits if form fields are not filled
      if (this.registerForm.invalid) {
        this._snackBar.open('מלא את כל השדות לפי הנדרש', '', { duration: 2000, direction: 'rtl' });
          return;
      }

      this.authService.register(this.registerForm.value).pipe(takeUntil(this.destroy$)).subscribe({
        next:  () => {
          this.router.navigate(['/login']);
        },
        error: err => {
          if(err.error === 'email exists, try to log in')
            this._snackBar.open('האימייל קיים במערכת, נסה להתחבר', '', { duration: 3000, direction: 'rtl' });
        }
      });
  }
}
