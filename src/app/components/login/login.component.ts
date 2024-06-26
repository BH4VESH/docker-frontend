import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { User } from '../../models/login'; 

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule,ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private _AuthService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private ToastrService:ToastrService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  login(): void {
    if (this.loginForm.valid) {
      const username = this.loginForm.get('username')?.value;
      const password = this.loginForm.get('password')?.value;

      this._AuthService.login(username, password).subscribe(
        (response:User) => {
          console.log(response)
          console.log('Login successful');
          this.router.navigate(['admin']);
        },
        error => {
          // console.error('Login error:', error.error);
          this.ToastrService.error(error.error)
          this.errorMessage = error.error;
        }
      );
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}